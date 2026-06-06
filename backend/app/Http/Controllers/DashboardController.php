<?php

namespace App\Http\Controllers;

use App\Models\Equipamento;
use App\Models\OrdemServico;
use App\Models\Alerta;
use App\Models\ExecucaoChecklist;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $alertas_count = Alerta::whereJsonContains('perfis_destinatarios', $user->role)
            ->where('status', 'novo')->count();

        $alertas_recentes = Alerta::whereJsonContains('perfis_destinatarios', $user->role)
            ->where('status', 'novo')
            ->with('equipamento:id,nome')
            ->latest('created_at')
            ->limit(5)->get();

        return match ($user->role) {
            'gestor', 'lider_campo' => $this->dashboardGestor($alertas_count, $alertas_recentes),
            'mecanico'              => $this->dashboardMecanico($user, $alertas_count, $alertas_recentes),
            'operador'              => $this->dashboardOperador($user, $alertas_count, $alertas_recentes),
            default                 => response()->json([]),
        };
    }

    private function dashboardGestor($alertas_count, $alertas_recentes)
    {
        $equipamentos = [
            'total'        => Equipamento::count(),
            'ativos'       => Equipamento::where('status', 'ativo')->count(),
            'em_manutencao'=> Equipamento::where('status', 'em_manutencao')->count(),
            'inativos'     => Equipamento::where('status', 'inativo')->count(),
        ];

        $ordens = [
            'abertas'        => OrdemServico::where('status', 'aberta')->count(),
            'em_andamento'   => OrdemServico::where('status', 'em_andamento')->count(),
            'concluidas_mes' => OrdemServico::where('status', 'concluida')
                ->whereMonth('data_conclusao', now()->month)->count(),
            'vencidas'       => OrdemServico::whereNotIn('status', ['concluida', 'cancelada'])
                ->whereNotNull('data_prevista')->where('data_prevista', '<', now())->count(),
        ];

        $checklists_hoje = ExecucaoChecklist::whereDate('data_hora', today())->count();

        $os_recentes = OrdemServico::with(['equipamento:id,nome', 'tecnico:id,name'])
            ->whereNotIn('status', ['concluida', 'cancelada'])
            ->orderByRaw("FIELD(prioridade, 'urgente', 'alta', 'media', 'baixa')")
            ->limit(5)->get();

        return response()->json(compact(
            'equipamentos', 'ordens', 'alertas_count',
            'checklists_hoje', 'os_recentes', 'alertas_recentes'
        ));
    }

    private function dashboardMecanico($user, $alertas_count, $alertas_recentes)
    {
        $minhasOrdens = OrdemServico::where('tecnico_id', $user->id);

        $equipamentos = [
            'total'        => Equipamento::count(),
            'ativos'       => Equipamento::where('status', 'ativo')->count(),
            'em_manutencao'=> Equipamento::where('status', 'em_manutencao')->count(),
            'inativos'     => Equipamento::where('status', 'inativo')->count(),
        ];

        $ordens = [
            'abertas'        => (clone $minhasOrdens)->whereIn('status', ['aberta', 'aprovada'])->count(),
            'em_andamento'   => (clone $minhasOrdens)->where('status', 'em_andamento')->count(),
            'concluidas_mes' => (clone $minhasOrdens)->where('status', 'concluida')
                ->whereMonth('data_conclusao', now()->month)->count(),
            'vencidas'       => (clone $minhasOrdens)->whereNotIn('status', ['concluida', 'cancelada'])
                ->whereNotNull('data_prevista')->where('data_prevista', '<', now())->count(),
        ];

        $checklists_hoje = ExecucaoChecklist::whereDate('data_hora', today())->count();

        $os_recentes = OrdemServico::with(['equipamento:id,nome'])
            ->where('tecnico_id', $user->id)
            ->whereNotIn('status', ['concluida', 'cancelada'])
            ->orderByRaw("FIELD(prioridade, 'urgente', 'alta', 'media', 'baixa')")
            ->limit(5)->get();

        return response()->json(compact(
            'equipamentos', 'ordens', 'alertas_count',
            'checklists_hoje', 'os_recentes', 'alertas_recentes'
        ));
    }

    private function dashboardOperador($user, $alertas_count, $alertas_recentes)
    {
        $equipamentos = [
            'total'        => Equipamento::count(),
            'ativos'       => Equipamento::where('status', 'ativo')->count(),
            'em_manutencao'=> Equipamento::where('status', 'em_manutencao')->count(),
            'inativos'     => Equipamento::where('status', 'inativo')->count(),
        ];

        $ordens = [
            'abertas'        => OrdemServico::where('solicitante_id', $user->id)
                ->whereIn('status', ['aberta', 'aprovada'])->count(),
            'em_andamento'   => OrdemServico::where('solicitante_id', $user->id)
                ->where('status', 'em_andamento')->count(),
            'concluidas_mes' => OrdemServico::where('solicitante_id', $user->id)
                ->where('status', 'concluida')
                ->whereMonth('data_conclusao', now()->month)->count(),
            'vencidas'       => 0,
        ];

        $checklists_hoje = ExecucaoChecklist::where('operador_id', $user->id)
            ->whereDate('data_hora', today())->count();

        $os_recentes = OrdemServico::with(['equipamento:id,nome', 'tecnico:id,name'])
            ->where('solicitante_id', $user->id)
            ->whereNotIn('status', ['concluida', 'cancelada'])
            ->latest()
            ->limit(5)->get();

        return response()->json(compact(
            'equipamentos', 'ordens', 'alertas_count',
            'checklists_hoje', 'os_recentes', 'alertas_recentes'
        ));
    }
}

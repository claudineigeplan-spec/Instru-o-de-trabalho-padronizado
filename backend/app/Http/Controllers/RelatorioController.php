<?php

namespace App\Http\Controllers;

use App\Models\OrdemServico;
use App\Models\Equipamento;
use App\Models\InstrucaoTrabalho;
use App\Models\ExecucaoChecklist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RelatorioController extends Controller
{
    public function index(Request $request)
    {
        $dias = (int) ($request->query('periodo', 30));
        $inicio = Carbon::now()->subDays($dias)->startOfDay();
        $fim = Carbon::now()->endOfDay();

        if ($request->filled('data_inicio') && $request->filled('data_fim')) {
            $inicio = Carbon::parse($request->data_inicio)->startOfDay();
            $fim = Carbon::parse($request->data_fim)->endOfDay();
        }

        return response()->json([
            'periodo' => ['inicio' => $inicio->toDateString(), 'fim' => $fim->toDateString()],
            'visao_geral'           => $this->visaoGeral($inicio, $fim),
            'manutencoes_por_tipo'  => $this->manutencoesPorTipo($inicio, $fim),
            'manutencoes_por_dia'   => $this->manutencoesPorDia($inicio, $fim),
            'desempenho_mecanicos'  => $this->desempenhoMecanicos($inicio, $fim),
            'equipamentos_freq'     => $this->equipamentosFrequencia($inicio, $fim),
            'instrucoes_usadas'     => $this->instrucoesUtilizadas($inicio, $fim),
            'checklists_anomalias'  => $this->checklistsAnomalias($inicio, $fim),
        ]);
    }

    private function visaoGeral(Carbon $inicio, Carbon $fim): array
    {
        $base = OrdemServico::whereBetween('created_at', [$inicio, $fim]);

        return [
            'total'         => (clone $base)->count(),
            'concluidas'    => (clone $base)->where('status', 'concluida')->count(),
            'canceladas'    => (clone $base)->where('status', 'cancelada')->count(),
            'em_aberto'     => (clone $base)->whereNotIn('status', ['concluida', 'cancelada'])->count(),
            'vencidas'      => (clone $base)->whereNotIn('status', ['concluida', 'cancelada'])
                                ->whereNotNull('data_prevista')
                                ->where('data_prevista', '<', now())->count(),
            'tempo_medio_horas' => (clone $base)->where('status', 'concluida')
                ->whereNotNull('data_conclusao')
                ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, data_conclusao)) as media'))
                ->value('media'),
        ];
    }

    private function manutencoesPorTipo(Carbon $inicio, Carbon $fim): array
    {
        return OrdemServico::whereBetween('created_at', [$inicio, $fim])
            ->select('tipo', DB::raw('count(*) as total'))
            ->groupBy('tipo')
            ->get()
            ->toArray();
    }

    private function manutencoesPorDia(Carbon $inicio, Carbon $fim): array
    {
        return OrdemServico::whereBetween('created_at', [$inicio, $fim])
            ->select(
                DB::raw('DATE(created_at) as data'),
                DB::raw('count(*) as total'),
                DB::raw("SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas")
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('data')
            ->get()
            ->toArray();
    }

    private function desempenhoMecanicos(Carbon $inicio, Carbon $fim): array
    {
        return User::where('role', 'mecanico')
            ->select('users.id', 'users.name')
            ->selectSub(
                OrdemServico::whereColumn('tecnico_id', 'users.id')
                    ->whereBetween('ordens_servico.created_at', [$inicio, $fim])
                    ->selectRaw('count(*)'),
                'total_atribuidas'
            )
            ->selectSub(
                OrdemServico::whereColumn('tecnico_id', 'users.id')
                    ->where('status', 'concluida')
                    ->whereBetween('ordens_servico.created_at', [$inicio, $fim])
                    ->selectRaw('count(*)'),
                'concluidas'
            )
            ->orderByDesc('concluidas')
            ->get()
            ->toArray();
    }

    private function equipamentosFrequencia(Carbon $inicio, Carbon $fim): array
    {
        return Equipamento::select('equipamentos.id', 'equipamentos.nome', 'equipamentos.modelo', 'equipamentos.fabricante')
            ->selectSub(
                OrdemServico::whereColumn('equipamento_id', 'equipamentos.id')
                    ->whereBetween('ordens_servico.created_at', [$inicio, $fim])
                    ->selectRaw('count(*)'),
                'total_ordens'
            )
            ->orderByDesc('total_ordens')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function instrucoesUtilizadas(Carbon $inicio, Carbon $fim): array
    {
        return InstrucaoTrabalho::select('instrucoes_trabalho.id', 'instrucoes_trabalho.titulo', 'instrucoes_trabalho.tipo')
            ->join('execucoes_os', 'execucoes_os.instrucao_trabalho_id', '=', 'instrucoes_trabalho.id')
            ->join('ordens_servico', 'ordens_servico.id', '=', 'execucoes_os.os_id')
            ->whereBetween('ordens_servico.created_at', [$inicio, $fim])
            ->selectRaw('count(execucoes_os.id) as usos')
            ->groupBy('instrucoes_trabalho.id', 'instrucoes_trabalho.titulo', 'instrucoes_trabalho.tipo')
            ->orderByDesc('usos')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function checklistsAnomalias(Carbon $inicio, Carbon $fim): array
    {
        $total = ExecucaoChecklist::whereBetween('data_hora', [$inicio, $fim])->count();
        $anomalias = ExecucaoChecklist::whereBetween('data_hora', [$inicio, $fim])
            ->where('status', 'com_anomalia')->count();

        return [
            'total'     => $total,
            'anomalias' => $anomalias,
            'taxa'      => $total > 0 ? round(($anomalias / $total) * 100, 1) : 0,
        ];
    }
}

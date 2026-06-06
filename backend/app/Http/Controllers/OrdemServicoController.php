<?php

namespace App\Http\Controllers;

use App\Models\OrdemServico;
use App\Models\ExecucaoOs;
use App\Models\PassoExecutado;
use App\Models\GatilhoPlano;
use App\Services\AlertaService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrdemServicoController extends Controller
{
    public function __construct(private AlertaService $alertaService) {}

    public function index(Request $request)
    {
        $query = OrdemServico::with(['equipamento:id,nome,tipo', 'tecnico:id,name', 'solicitante:id,name']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->equipamento_id) {
            $query->where('equipamento_id', $request->equipamento_id);
        }
        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        $user = $request->user();
        if ($user->role === 'mecanico') {
            $query->where('tecnico_id', $user->id);
        }
        if ($user->role === 'operador') {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'equipamento_id' => 'required|exists:equipamentos,id',
            'plano_id' => 'nullable|exists:planos_manutencao,id',
            'tipo' => 'required|in:preventiva,corretiva,preditiva',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'required|in:baixa,media,alta,urgente',
            'tecnico_id' => 'nullable|exists:users,id',
            'data_prevista' => 'nullable|date',
            'instrucao_trabalho_id' => 'nullable|exists:instrucoes_trabalho,id',
        ]);

        $os = OrdemServico::create(array_merge($data, [
            'solicitante_id' => $request->user()->id,
            'data_abertura' => now(),
            'status' => 'aberta',
        ]));

        if (!empty($data['instrucao_trabalho_id'])) {
            $execucao = ExecucaoOs::create([
                'os_id' => $os->id,
                'instrucao_trabalho_id' => $data['instrucao_trabalho_id'],
            ]);

            $passos = \App\Models\PassoIt::where('instrucao_trabalho_id', $data['instrucao_trabalho_id'])
                ->orderBy('ordem')->get();

            foreach ($passos as $passo) {
                PassoExecutado::create([
                    'execucao_os_id' => $execucao->id,
                    'passo_id' => $passo->id,
                    'concluido' => false,
                ]);
            }
        }

        $os->load('equipamento:id,nome');

        if (!empty($data['tecnico_id'])) {
            $this->alertaService->criarAlertaOsAtribuida($os);
        }

        return response()->json($os->load(['solicitante:id,name']), 201);
    }

    public function show(OrdemServico $os)
    {
        return response()->json($os->load([
            'equipamento', 'plano', 'solicitante:id,name',
            'tecnico:id,name', 'supervisor:id,name',
            'execucoes.instrucao.passos',
            'execucoes.passosExecutados.passo',
        ]));
    }

    public function update(Request $request, OrdemServico $os)
    {
        $data = $request->validate([
            'tecnico_id' => 'nullable|exists:users,id',
            'data_prevista' => 'nullable|date',
            'descricao' => 'nullable|string',
            'prioridade' => 'nullable|in:baixa,media,alta,urgente',
        ]);

        $os->update($data);
        return response()->json($os);
    }

    public function destroy(OrdemServico $os)
    {
        if (!in_array($os->status, ['aberta', 'cancelada'])) {
            return response()->json(['message' => 'Apenas OS abertas podem ser excluídas.'], 422);
        }
        $os->delete();
        return response()->json(null, 204);
    }

    public function atualizarStatus(Request $request, OrdemServico $os)
    {
        $data = $request->validate([
            'status' => 'required|in:aprovada,em_andamento,concluida,cancelada',
            'km_execucao' => 'nullable|numeric',
            'horas_execucao' => 'nullable|numeric',
        ]);

        $transicoes = [
            'aberta' => ['aprovada', 'cancelada'],
            'aprovada' => ['em_andamento', 'cancelada'],
            'em_andamento' => ['concluida', 'cancelada'],
        ];

        if (!in_array($data['status'], $transicoes[$os->status] ?? [])) {
            return response()->json(['message' => 'Transição de status inválida.'], 422);
        }

        $update = ['status' => $data['status']];

        if ($data['status'] === 'em_andamento') {
            $update['supervisor_id'] = $request->user()->id;
        }

        if ($data['status'] === 'concluida') {
            $update['data_conclusao'] = now();
            if (!empty($data['km_execucao'])) {
                $update['km_execucao'] = $data['km_execucao'];
            }
            if (!empty($data['horas_execucao'])) {
                $update['horas_execucao'] = $data['horas_execucao'];
            }

            if ($os->plano_id) {
                $this->reiniciarGatilhos($os);
            }
        }

        $os->update($update);
        $os->refresh()->load('equipamento:id,nome');
        $this->alertaService->criarAlertaStatusOS($os, $data['status']);

        return response()->json($os);
    }

    public function concluirPasso(Request $request, OrdemServico $os, int $passoId)
    {
        $data = $request->validate([
            'concluido' => 'required|boolean',
            'observacao' => 'nullable|string',
        ]);

        $passoExecutado = PassoExecutado::whereHas('execucaoOs', fn($q) => $q->where('os_id', $os->id))
            ->where('passo_id', $passoId)
            ->firstOrFail();

        $passoExecutado->update($data);
        return response()->json($passoExecutado);
    }

    private function reiniciarGatilhos(OrdemServico $os): void
    {
        $gatilhos = GatilhoPlano::where('plano_id', $os->plano_id)->get();
        $equipamento = $os->equipamento;

        foreach ($gatilhos as $gatilho) {
            $update = [];
            switch ($gatilho->tipo) {
                case 'km':
                    $update['ultimo_valor_executado'] = $os->km_execucao ?? $equipamento->hodometro_atual;
                    break;
                case 'horas':
                    $update['ultimo_valor_executado'] = $os->horas_execucao ?? $equipamento->horimetro_atual;
                    break;
                case 'periodicidade_dias':
                    $update['proxima_data_execucao'] = Carbon::now()->addDays($gatilho->valor_intervalo);
                    break;
            }
            $gatilho->update($update);
        }
    }
}

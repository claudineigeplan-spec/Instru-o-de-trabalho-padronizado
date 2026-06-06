<?php

namespace App\Http\Controllers;

use App\Models\ExecucaoChecklist;
use App\Models\ModeloChecklist;
use App\Models\OrdemServico;
use App\Services\AlertaService;
use Illuminate\Http\Request;

class ExecucaoChecklistController extends Controller
{
    public function __construct(private AlertaService $alertaService) {}

    public function index(Request $request)
    {
        $query = ExecucaoChecklist::with(['equipamento:id,nome', 'operador:id,name', 'modelo:id,nome']);

        if ($request->equipamento_id) {
            $query->where('equipamento_id', $request->equipamento_id);
        }

        return response()->json($query->latest('data_hora')->paginate(20));
    }

    public function show(ExecucaoChecklist $execucao)
    {
        return response()->json($execucao->load([
            'modelo.itens',
            'equipamento:id,nome',
            'operador:id,name',
            'respostas.item',
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'modelo_id' => 'required|exists:modelos_checklist,id',
            'equipamento_id' => 'required|exists:equipamentos,id',
            'km_atual' => 'nullable|numeric|min:0',
            'horas_atual' => 'nullable|numeric|min:0',
            'observacao' => 'nullable|string',
            'respostas' => 'required|array',
            'respostas.*.item_id' => 'required|exists:itens_checklist,id',
            'respostas.*.resposta' => 'required|string',
            'respostas.*.observacao' => 'nullable|string',
        ]);

        $temAnomalia = false;
        $itensCriticosNok = [];

        $modelo = ModeloChecklist::with('itens')->findOrFail($data['modelo_id']);

        foreach ($data['respostas'] as $resposta) {
            $item = $modelo->itens->find($resposta['item_id']);
            if ($item && $item->critico && $resposta['resposta'] === 'nok') {
                $temAnomalia = true;
                $itensCriticosNok[] = $item;
            }
        }

        $execucao = ExecucaoChecklist::create([
            'modelo_id' => $data['modelo_id'],
            'equipamento_id' => $data['equipamento_id'],
            'operador_id' => $request->user()->id,
            'data_hora' => now(),
            'status' => $temAnomalia ? 'com_anomalia' : 'concluido',
            'km_atual' => $data['km_atual'] ?? null,
            'horas_atual' => $data['horas_atual'] ?? null,
            'observacao' => $data['observacao'] ?? null,
        ]);

        foreach ($data['respostas'] as $r) {
            $execucao->respostas()->create([
                'item_id' => $r['item_id'],
                'resposta' => $r['resposta'],
                'observacao' => $r['observacao'] ?? null,
            ]);
        }

        $equipamento = $execucao->equipamento;

        if ($data['km_atual'] ?? null) {
            $equipamento->update(['hodometro_atual' => $data['km_atual']]);
        }
        if ($data['horas_atual'] ?? null) {
            $equipamento->update(['horimetro_atual' => $data['horas_atual']]);
        }

        if ($temAnomalia) {
            foreach ($itensCriticosNok as $item) {
                OrdemServico::create([
                    'equipamento_id' => $data['equipamento_id'],
                    'tipo' => 'corretiva',
                    'titulo' => 'Anomalia no checklist: ' . $item->descricao,
                    'descricao' => 'OS criada automaticamente por anomalia crítica no checklist.',
                    'prioridade' => 'alta',
                    'status' => 'aberta',
                    'solicitante_id' => $request->user()->id,
                    'data_abertura' => now(),
                ]);
            }

            $this->alertaService->criarAlertaChecklistAnomalia($execucao);
        }

        return response()->json($execucao->load('respostas'), 201);
    }

    public function hoje(Request $request, $equipamentoId)
    {
        $execucao = ExecucaoChecklist::where('equipamento_id', $equipamentoId)
            ->whereDate('data_hora', today())
            ->with('respostas')
            ->first();

        return response()->json($execucao);
    }
}

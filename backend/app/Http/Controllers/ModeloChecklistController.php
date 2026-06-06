<?php

namespace App\Http\Controllers;

use App\Models\ModeloChecklist;
use App\Models\ItemChecklist;
use Illuminate\Http\Request;

class ModeloChecklistController extends Controller
{
    public function index(Request $request)
    {
        $query = ModeloChecklist::with(['itens', 'equipamento:id,nome']);

        if ($request->equipamento_id) {
            $query->where('equipamento_id', $request->equipamento_id)
                ->orWhereNull('equipamento_id');
        }

        return response()->json($query->where('ativo', true)->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'equipamento_id' => 'nullable|exists:equipamentos,id',
            'tipo_equipamento' => 'nullable|in:veiculo,maquina,eletrico_hidraulico',
            'periodicidade' => 'required|in:diario,semanal,mensal',
            'itens' => 'nullable|array',
            'itens.*.descricao' => 'required|string',
            'itens.*.tipo_resposta' => 'required|in:ok_nok,valor_numerico,texto',
            'itens.*.critico' => 'boolean',
        ]);

        $modelo = ModeloChecklist::create($data);

        if (!empty($data['itens'])) {
            foreach ($data['itens'] as $i => $item) {
                $modelo->itens()->create(array_merge($item, ['ordem' => $i + 1]));
            }
        }

        return response()->json($modelo->load('itens'), 201);
    }

    public function show(ModeloChecklist $modeloChecklist)
    {
        return response()->json($modeloChecklist->load(['itens', 'equipamento:id,nome']));
    }

    public function update(Request $request, ModeloChecklist $modeloChecklist)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'periodicidade' => 'sometimes|in:diario,semanal,mensal',
            'ativo' => 'boolean',
        ]);

        $modeloChecklist->update($data);
        return response()->json($modeloChecklist);
    }

    public function destroy(ModeloChecklist $modeloChecklist)
    {
        $modeloChecklist->delete();
        return response()->json(null, 204);
    }
}

class ItemChecklistController extends Controller
{
    public function index(ModeloChecklist $modeloChecklist)
    {
        return response()->json($modeloChecklist->itens);
    }

    public function store(Request $request, ModeloChecklist $modeloChecklist)
    {
        $data = $request->validate([
            'descricao' => 'required|string',
            'tipo_resposta' => 'required|in:ok_nok,valor_numerico,texto',
            'critico' => 'boolean',
        ]);

        $ordem = $modeloChecklist->itens()->max('ordem') + 1;
        $item = $modeloChecklist->itens()->create(array_merge($data, ['ordem' => $ordem]));

        return response()->json($item, 201);
    }

    public function show(ItemChecklist $item)
    {
        return response()->json($item);
    }

    public function update(Request $request, ItemChecklist $item)
    {
        $data = $request->validate([
            'descricao' => 'sometimes|string',
            'tipo_resposta' => 'sometimes|in:ok_nok,valor_numerico,texto',
            'critico' => 'boolean',
            'ordem' => 'sometimes|integer',
        ]);

        $item->update($data);
        return response()->json($item);
    }

    public function destroy(ItemChecklist $item)
    {
        $item->delete();
        return response()->json(null, 204);
    }
}

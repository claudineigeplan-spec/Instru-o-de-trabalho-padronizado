<?php

namespace App\Http\Controllers;

use App\Models\ItemChecklist;
use App\Models\ModeloChecklist;
use Illuminate\Http\Request;

class ItemChecklistController extends Controller
{
    public function index(ModeloChecklist $modeloChecklist)
    {
        return response()->json($modeloChecklist->itens()->orderBy('ordem')->get());
    }

    public function store(Request $request, ModeloChecklist $modeloChecklist)
    {
        $data = $request->validate([
            'descricao'     => 'required|string|max:255',
            'tipo_resposta' => 'required|in:ok_nok,valor_numerico,texto',
            'critico'       => 'boolean',
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
            'descricao'     => 'sometimes|string|max:255',
            'tipo_resposta' => 'sometimes|in:ok_nok,valor_numerico,texto',
            'critico'       => 'boolean',
            'ordem'         => 'nullable|integer|min:1',
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

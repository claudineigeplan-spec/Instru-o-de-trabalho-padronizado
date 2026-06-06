<?php

namespace App\Http\Controllers;

use App\Models\PlanoManutencao;
use Illuminate\Http\Request;

class PlanoManutencaoController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanoManutencao::with(['equipamento:id,nome', 'gatilhos']);

        if ($request->equipamento_id) {
            $query->where('equipamento_id', $request->equipamento_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'equipamento_id' => 'required|exists:equipamentos,id',
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        return response()->json(PlanoManutencao::create($data), 201);
    }

    public function show(PlanoManutencao $plano)
    {
        return response()->json($plano->load(['equipamento', 'gatilhos', 'instrucaoTrabalho.passos']));
    }

    public function update(Request $request, PlanoManutencao $plano)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $plano->update($data);
        return response()->json($plano);
    }

    public function destroy(PlanoManutencao $plano)
    {
        $plano->delete();
        return response()->json(null, 204);
    }
}

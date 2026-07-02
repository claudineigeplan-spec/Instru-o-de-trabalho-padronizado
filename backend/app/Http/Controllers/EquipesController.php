<?php

namespace App\Http\Controllers;

use App\Models\EquipeCampo;
use Illuminate\Http\Request;

class EquipesController extends Controller
{
    public function index(Request $request)
    {
        $query = EquipeCampo::with(['lider', 'colaboradores', 'contrato'])
            ->orderBy('nome');

        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }
        if ($request->contrato_id) {
            $query->where('contrato_id', $request->contrato_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome'        => 'required|string|max:100|unique:equipes_campo,nome',
            'tipo'        => 'nullable|string|max:100',
            'contrato_id' => 'nullable|exists:contratos,id',
            'lider_id'    => 'nullable|exists:colaboradores,id',
            'ativo'       => 'nullable|boolean',
        ]);

        $data['ativo'] ??= true;

        $equipe = EquipeCampo::create($data);
        return response()->json($equipe->load(['lider', 'colaboradores', 'contrato']), 201);
    }

    public function show(EquipeCampo $equipe)
    {
        return response()->json($equipe->load(['lider', 'colaboradores', 'contrato']));
    }

    public function update(Request $request, EquipeCampo $equipe)
    {
        $data = $request->validate([
            'nome'        => 'sometimes|string|max:100',
            'tipo'        => 'nullable|string|max:100',
            'contrato_id' => 'nullable|exists:contratos,id',
            'lider_id'    => 'nullable|exists:colaboradores,id',
            'ativo'       => 'sometimes|boolean',
        ]);

        $equipe->update($data);
        return response()->json($equipe->load(['lider', 'colaboradores', 'contrato']));
    }

    public function destroy(EquipeCampo $equipe)
    {
        $equipe->delete();
        return response()->json(null, 204);
    }

    public function adicionarMembro(Request $request, EquipeCampo $equipe)
    {
        $request->validate([
            'colaborador_id' => 'required|exists:colaboradores,id',
            'funcao_equipe'  => 'nullable|string|max:100',
        ]);

        $equipe->colaboradores()->syncWithoutDetaching([
            $request->colaborador_id => ['funcao_na_equipe' => $request->funcao_equipe],
        ]);

        return response()->json($equipe->load('colaboradores'));
    }

    public function removerMembro(EquipeCampo $equipe, int $colaboradorId)
    {
        $equipe->colaboradores()->detach($colaboradorId);
        return response()->json(null, 204);
    }
}

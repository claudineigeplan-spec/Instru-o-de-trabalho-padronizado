<?php

namespace App\Http\Controllers;

use App\Models\Colaborador;
use Illuminate\Http\Request;

class ColaboradoresController extends Controller
{
    public function index(Request $request)
    {
        $query = Colaborador::with('equipes')
            ->orderBy('nome');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->setor) {
            $query->where('setor', $request->setor);
        }
        if ($request->busca) {
            $b = $request->busca;
            $query->where(fn($q) => $q->where('nome', 'like', "%$b%")
                ->orWhere('matricula', 'like', "%$b%")
                ->orWhere('funcao', 'like', "%$b%"));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'matricula'     => 'required|string|max:20|unique:colaboradores,matricula',
            'nome'          => 'required|string|max:255',
            'cpf'           => 'nullable|string|max:14',
            'funcao'        => 'required|string|max:100',
            'cargo'         => 'nullable|string|max:100',
            'setor'         => 'nullable|string|max:100',
            'data_admissao' => 'nullable|date',
            'vinculo'       => 'nullable|in:clt,pj,terceirizado,estagio',
            'status'        => 'nullable|in:ativo,afastado,ferias,demitido',
            'telefone'      => 'nullable|string|max:20',
            'cnh_categoria' => 'nullable|string|max:5',
            'cnh_validade'  => 'nullable|date',
            'aso_validade'  => 'nullable|date',
            'user_id'       => 'nullable|exists:users,id',
        ]);

        $data['status'] ??= 'ativo';

        $colaborador = Colaborador::create($data);
        return response()->json($colaborador->load('equipes'), 201);
    }

    public function show(Colaborador $colaborador)
    {
        return response()->json($colaborador->load(['equipes', 'user']));
    }

    public function update(Request $request, Colaborador $colaborador)
    {
        $data = $request->validate([
            'nome'          => 'sometimes|string|max:255',
            'funcao'        => 'sometimes|string|max:100',
            'cargo'         => 'nullable|string|max:100',
            'setor'         => 'nullable|string|max:100',
            'data_admissao' => 'nullable|date',
            'vinculo'       => 'nullable|in:clt,pj,terceirizado,estagio',
            'status'        => 'sometimes|in:ativo,afastado,ferias,demitido',
            'telefone'      => 'nullable|string|max:20',
            'cnh_categoria' => 'nullable|string|max:5',
            'cnh_validade'  => 'nullable|date',
            'aso_validade'  => 'nullable|date',
        ]);

        $colaborador->update($data);
        return response()->json($colaborador);
    }

    public function destroy(Colaborador $colaborador)
    {
        $colaborador->delete();
        return response()->json(null, 204);
    }
}

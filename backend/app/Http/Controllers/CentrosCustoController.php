<?php

namespace App\Http\Controllers;

use App\Models\CentroCusto;
use Illuminate\Http\Request;

class CentrosCustoController extends Controller
{
    public function index(Request $request)
    {
        $query = CentroCusto::withCount('contratos')
            ->orderBy('codigo');

        if ($request->ativo !== null) {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->busca) {
            $b = $request->busca;
            $query->where(fn($q) => $q->where('codigo', 'like', "%$b%")
                ->orWhere('nome', 'like', "%$b%"));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo'       => 'required|string|max:20|unique:centros_custo,codigo',
            'nome'         => 'required|string|max:255',
            'descricao'    => 'nullable|string',
            'ativo'        => 'nullable|boolean',
        ]);

        $data['ativo'] ??= true;

        $centro = CentroCusto::create($data);
        return response()->json($centro, 201);
    }

    public function show(CentroCusto $centroCusto)
    {
        return response()->json($centroCusto->load('contratos'));
    }

    public function update(Request $request, CentroCusto $centroCusto)
    {
        $data = $request->validate([
            'nome'        => 'sometimes|string|max:255',
            'descricao'   => 'nullable|string',
            'ativo'       => 'nullable|boolean',
        ]);

        $centroCusto->update($data);
        return response()->json($centroCusto);
    }

    public function destroy(CentroCusto $centroCusto)
    {
        if ($centroCusto->contratos()->exists()) {
            return response()->json(['message' => 'Centro de custo com contratos vinculados não pode ser excluído.'], 422);
        }
        $centroCusto->delete();
        return response()->json(null, 204);
    }
}

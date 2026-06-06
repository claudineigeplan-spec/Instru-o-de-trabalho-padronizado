<?php

namespace App\Http\Controllers;

use App\Models\ItemEstoque;
use Illuminate\Http\Request;

class ItemEstoqueController extends Controller
{
    public function index(Request $request)
    {
        $query = ItemEstoque::query();

        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }
        if ($request->search) {
            $query->where('nome', 'like', "%{$request->search}%")
                ->orWhere('codigo', 'like', "%{$request->search}%");
        }

        return response()->json($query->orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo' => 'required|string|unique:itens_estoque',
            'nome' => 'required|string',
            'tipo' => 'required|in:peca,oleo,filtro,outros',
            'unidade' => 'required|string',
            'estoque_minimo' => 'nullable|integer|min:0',
        ]);

        return response()->json(ItemEstoque::create($data), 201);
    }

    public function show(ItemEstoque $estoque)
    {
        return response()->json($estoque->load('previsoes.equipamento:id,nome'));
    }

    public function update(Request $request, ItemEstoque $estoque)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string',
            'tipo' => 'sometimes|in:peca,oleo,filtro,outros',
            'unidade' => 'sometimes|string',
            'estoque_minimo' => 'nullable|integer|min:0',
        ]);

        $estoque->update($data);
        return response()->json($estoque);
    }

    public function destroy(ItemEstoque $estoque)
    {
        $estoque->delete();
        return response()->json(null, 204);
    }
}

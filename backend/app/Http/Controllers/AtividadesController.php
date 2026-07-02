<?php

namespace App\Http\Controllers;

use App\Models\Atividade;
use Illuminate\Http\Request;

class AtividadesController extends Controller
{
    public function index(Request $request)
    {
        $query = Atividade::orderBy('codigo');

        if ($request->categoria) {
            $query->where('categoria', $request->categoria);
        }
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
            'codigo'         => 'required|string|max:20|unique:atividades,codigo',
            'nome'           => 'required|string|max:255',
            'categoria'      => 'required|string|max:100',
            'unidade_medida' => 'required|string|max:20',
            'ativo'          => 'nullable|boolean',
        ]);

        $data['ativo'] ??= true;

        $atividade = Atividade::create($data);
        return response()->json($atividade, 201);
    }

    public function show(Atividade $atividade)
    {
        return response()->json($atividade);
    }

    public function update(Request $request, Atividade $atividade)
    {
        $data = $request->validate([
            'nome'           => 'sometimes|string|max:255',
            'categoria'      => 'sometimes|string|max:100',
            'unidade_medida' => 'sometimes|string|max:20',
            'ativo'          => 'nullable|boolean',
        ]);

        $atividade->update($data);
        return response()->json($atividade);
    }

    public function destroy(Atividade $atividade)
    {
        $atividade->delete();
        return response()->json(null, 204);
    }
}

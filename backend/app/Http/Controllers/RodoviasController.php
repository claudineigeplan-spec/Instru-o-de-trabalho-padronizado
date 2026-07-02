<?php

namespace App\Http\Controllers;

use App\Models\Rodovia;
use App\Models\Trecho;
use Illuminate\Http\Request;

class RodoviasController extends Controller
{
    public function index(Request $request)
    {
        $query = Rodovia::withCount('trechos')
            ->orderBy('codigo');

        if ($request->uf) {
            $query->where('uf', strtoupper($request->uf));
        }
        if ($request->busca) {
            $b = $request->busca;
            $query->where(fn($q) => $q->where('codigo', 'like', "%$b%")
                ->orWhere('nome', 'like', "%$b%")
                ->orWhere('municipio', 'like', "%$b%"));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo'    => 'required|string|max:20|unique:rodovias,codigo',
            'nome'      => 'required|string|max:255',
            'municipio' => 'nullable|string|max:255',
            'uf'        => 'required|string|size:2',
        ]);

        $data['uf'] = strtoupper($data['uf']);
        $rodovia = Rodovia::create($data);
        return response()->json($rodovia, 201);
    }

    public function show(Rodovia $rodovia)
    {
        return response()->json($rodovia->load('trechos.contrato'));
    }

    public function update(Request $request, Rodovia $rodovia)
    {
        $data = $request->validate([
            'codigo'    => 'sometimes|string|max:20|unique:rodovias,codigo,' . $rodovia->id,
            'nome'      => 'sometimes|string|max:255',
            'municipio' => 'nullable|string|max:255',
            'uf'        => 'sometimes|string|size:2',
        ]);

        if (isset($data['uf'])) {
            $data['uf'] = strtoupper($data['uf']);
        }

        $rodovia->update($data);
        return response()->json($rodovia);
    }

    public function destroy(Rodovia $rodovia)
    {
        $rodovia->delete();
        return response()->json(null, 204);
    }

    /* ── Trechos ─────────────────────────────────────────────── */

    public function trechos(Rodovia $rodovia)
    {
        return response()->json(
            $rodovia->trechos()->with('contrato:id,numero')->orderBy('km_inicial')->get()
        );
    }

    public function storeTrecho(Request $request, Rodovia $rodovia)
    {
        $data = $request->validate([
            'contrato_id'   => 'required|exists:contratos,id',
            'km_inicial'    => 'required|numeric|min:0',
            'km_final'      => 'required|numeric|min:0|gt:km_inicial',
            'municipio'     => 'nullable|string|max:100',
            'descricao'     => 'nullable|string|max:255',
            'ativo'         => 'nullable|boolean',
        ]);

        $data['rodovia_id'] = $rodovia->id;
        $data['ativo'] ??= true;

        $trecho = Trecho::create($data);
        return response()->json($trecho, 201);
    }

    public function updateTrecho(Request $request, Rodovia $rodovia, Trecho $trecho)
    {
        $data = $request->validate([
            'contrato_id'   => 'nullable|exists:contratos,id',
            'km_inicial'    => 'sometimes|numeric|min:0',
            'km_final'      => 'sometimes|numeric|min:0',
            'municipio'     => 'nullable|string|max:100',
            'descricao'     => 'nullable|string|max:255',
            'ativo'         => 'nullable|boolean',
        ]);

        $trecho->update($data);
        return response()->json($trecho);
    }

    public function destroyTrecho(Rodovia $rodovia, Trecho $trecho)
    {
        $trecho->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PassoIt;
use App\Models\InstrucaoTrabalho;
use Illuminate\Http\Request;

class PassoItController extends Controller
{
    public function index(InstrucaoTrabalho $instrucao)
    {
        return response()->json($instrucao->passos);
    }

    public function store(Request $request, InstrucaoTrabalho $instrucao)
    {
        $data = $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'alerta_seguranca' => 'nullable|string',
        ]);

        $ordem = $instrucao->passos()->max('ordem') + 1;
        $passo = $instrucao->passos()->create(array_merge($data, ['ordem' => $ordem]));

        return response()->json($passo, 201);
    }

    public function show(PassoIt $passo)
    {
        return response()->json($passo);
    }

    public function update(Request $request, PassoIt $passo)
    {
        $data = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'descricao' => 'nullable|string',
            'alerta_seguranca' => 'nullable|string',
            'ordem' => 'nullable|integer|min:1',
        ]);

        $passo->update($data);
        return response()->json($passo);
    }

    public function destroy(PassoIt $passo)
    {
        $passo->delete();
        return response()->json(null, 204);
    }

    public function reordenar(Request $request, InstrucaoTrabalho $instrucao)
    {
        $request->validate([
            'ordem' => 'required|array',
            'ordem.*' => 'integer|exists:passos_it,id',
        ]);

        foreach ($request->ordem as $posicao => $id) {
            PassoIt::where('id', $id)->where('instrucao_trabalho_id', $instrucao->id)
                ->update(['ordem' => $posicao + 1]);
        }

        return response()->json(['message' => 'Ordem atualizada.']);
    }
}

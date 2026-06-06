<?php

namespace App\Http\Controllers;

use App\Models\InstrucaoTrabalho;
use Illuminate\Http\Request;

class InstrucaoTrabalhoController extends Controller
{
    public function index(Request $request)
    {
        $query = InstrucaoTrabalho::with(['plano.equipamento:id,nome', 'passos']);

        if ($request->plano_id) {
            $query->where('plano_manutencao_id', $request->plano_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plano_manutencao_id'  => 'nullable|exists:planos_manutencao,id',
            'titulo'               => 'required|string|max:255',
            'descricao'            => 'nullable|string',
            'tempo_estimado_min'   => 'nullable|integer|min:0',
            'tipo'                 => 'nullable|in:preventiva,corretiva,preditiva,inspecao',
            'prioridade'           => 'nullable|in:baixa,media,alta,urgente',
            'responsavel'          => 'nullable|string|max:100',
            'status'               => 'nullable|in:rascunho,publicada,arquivada',
        ]);

        return response()->json(InstrucaoTrabalho::create($data), 201);
    }

    public function show(InstrucaoTrabalho $instrucao)
    {
        return response()->json($instrucao->load(['plano.equipamento', 'passos', 'componentes.item']));
    }

    public function update(Request $request, InstrucaoTrabalho $instrucao)
    {
        $data = $request->validate([
            'titulo'               => 'sometimes|string|max:255',
            'descricao'            => 'nullable|string',
            'tempo_estimado_min'   => 'nullable|integer|min:0',
            'plano_manutencao_id'  => 'nullable|exists:planos_manutencao,id',
            'tipo'                 => 'nullable|in:preventiva,corretiva,preditiva,inspecao',
            'prioridade'           => 'nullable|in:baixa,media,alta,urgente',
            'responsavel'          => 'nullable|string|max:100',
            'status'               => 'nullable|in:rascunho,publicada,arquivada',
        ]);

        $instrucao->update($data);
        return response()->json($instrucao);
    }

    public function destroy(InstrucaoTrabalho $instrucao)
    {
        $instrucao->delete();
        return response()->json(null, 204);
    }
}

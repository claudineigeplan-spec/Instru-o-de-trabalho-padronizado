<?php

namespace App\Http\Controllers;

use App\Models\Programacao;
use App\Models\ProgramacaoItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProgramacoesController extends Controller
{
    public function index(Request $request)
    {
        $query = Programacao::with(['contrato', 'equipe', 'itens.atividade'])
            ->orderBy('data_programada', 'desc');

        if ($request->contrato_id) {
            $query->where('contrato_id', $request->contrato_id);
        }
        if ($request->equipe_id) {
            $query->where('equipe_id', $request->equipe_id);
        }
        if ($request->data_inicio && $request->data_fim) {
            $query->whereBetween('data_programada', [$request->data_inicio, $request->data_fim]);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'contrato_id'      => 'required|exists:contratos,id',
            'equipe_id'        => 'nullable|exists:equipes_campo,id',
            'lider_id'         => 'nullable|exists:colaboradores,id',
            'trecho_id'        => 'nullable|exists:trechos,id',
            'data_programada'  => 'required|date',
            'tipo'             => 'nullable|in:mensal,semanal,diario',
            'turno'            => 'nullable|string|max:20',
            'observacoes'      => 'nullable|string',
            'status'           => 'nullable|in:rascunho,planejado,aprovado,em_execucao,executado,parcialmente_executado,cancelado,reprogramado',
            'itens'                     => 'nullable|array',
            'itens.*.atividade_id'      => 'required|exists:atividades,id',
            'itens.*.item_contratual_id'=> 'nullable|exists:itens_contratuais,id',
            'itens.*.quantidade_prevista' => 'required|numeric|min:0',
            'itens.*.unidade'           => 'required|string|max:20',
            'itens.*.observacoes'       => 'nullable|string',
        ]);

        $data['criado_por'] = Auth::id();
        $data['status'] ??= 'rascunho';
        $data['tipo'] ??= 'diario';
        $data['turno'] ??= 'integral';

        $itens = $data['itens'] ?? [];
        unset($data['itens']);

        $programacao = Programacao::create($data);

        foreach ($itens as $item) {
            $programacao->itens()->create($item);
        }

        return response()->json($programacao->load(['contrato', 'equipe', 'itens.atividade']), 201);
    }

    public function show(Programacao $programacao)
    {
        return response()->json(
            $programacao->load(['contrato', 'equipe', 'itens.atividade'])
        );
    }

    public function update(Request $request, Programacao $programacao)
    {
        $data = $request->validate([
            'equipe_id'       => 'nullable|exists:equipes_campo,id',
            'lider_id'        => 'nullable|exists:colaboradores,id',
            'trecho_id'       => 'nullable|exists:trechos,id',
            'data_programada' => 'sometimes|date',
            'tipo'            => 'sometimes|in:mensal,semanal,diario',
            'turno'           => 'sometimes|string|max:20',
            'status'          => 'sometimes|in:rascunho,planejado,aprovado,em_execucao,executado,parcialmente_executado,cancelado,reprogramado',
            'observacoes'     => 'nullable|string',
        ]);

        if (($data['status'] ?? null) === 'aprovado' && $programacao->status !== 'aprovado') {
            $data['aprovado_por'] = Auth::id();
            $data['aprovado_em'] = now();
        }

        $programacao->update($data);
        return response()->json($programacao->load(['contrato', 'equipe', 'itens.atividade']));
    }

    public function destroy(Programacao $programacao)
    {
        $programacao->delete();
        return response()->json(null, 204);
    }

    public function storeItem(Request $request, Programacao $programacao)
    {
        $data = $request->validate([
            'atividade_id'        => 'required|exists:atividades,id',
            'item_contratual_id'  => 'nullable|exists:itens_contratuais,id',
            'quantidade_prevista' => 'required|numeric|min:0',
            'quantidade_executada'=> 'nullable|numeric|min:0',
            'unidade'             => 'required|string|max:20',
            'observacoes'         => 'nullable|string',
        ]);

        $item = $programacao->itens()->create($data);
        return response()->json($item->load('atividade'), 201);
    }

    public function updateItem(Request $request, Programacao $programacao, ProgramacaoItem $item)
    {
        $data = $request->validate([
            'quantidade_prevista'  => 'sometimes|numeric|min:0',
            'quantidade_executada' => 'sometimes|numeric|min:0',
            'unidade'              => 'sometimes|string|max:20',
            'observacoes'          => 'nullable|string',
        ]);

        $item->update($data);
        return response()->json($item->load('atividade'));
    }

    public function destroyItem(Programacao $programacao, ProgramacaoItem $item)
    {
        $item->delete();
        return response()->json(null, 204);
    }
}

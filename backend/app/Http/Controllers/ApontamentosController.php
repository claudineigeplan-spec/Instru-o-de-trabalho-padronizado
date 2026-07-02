<?php

namespace App\Http\Controllers;

use App\Models\ApontamentoProducao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApontamentosController extends Controller
{
    public function index(Request $request)
    {
        $query = ApontamentoProducao::with(['contrato', 'equipe', 'atividade', 'responsavel'])
            ->orderBy('data', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->contrato_id) {
            $query->where('contrato_id', $request->contrato_id);
        }
        if ($request->equipe_id) {
            $query->where('equipe_id', $request->equipe_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->data_inicio && $request->data_fim) {
            $query->whereBetween('data', [$request->data_inicio, $request->data_fim]);
        } elseif ($request->data) {
            $query->whereDate('data', $request->data);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo'               => 'required|string|max:50|unique:apontamentos_producao,codigo',
            'contrato_id'          => 'required|exists:contratos,id',
            'equipe_id'            => 'nullable|exists:equipes_campo,id',
            'atividade_id'         => 'required|exists:atividades,id',
            'item_contratual_id'   => 'nullable|exists:itens_contratuais,id',
            'trecho_id'            => 'nullable|exists:trechos,id',
            'data'                 => 'required|date',
            'turno'                => 'required|in:manha,tarde,noite,integral',
            'hora_inicio'          => 'nullable|date_format:H:i',
            'hora_fim'             => 'nullable|date_format:H:i',
            'km_inicial'           => 'nullable|numeric|min:0',
            'km_final'             => 'nullable|numeric|min:0',
            'sentido'              => 'nullable|string|max:20',
            'lado'                 => 'nullable|string|max:20',
            'quantidade_executada' => 'required|numeric|min:0',
            'unidade'              => 'required|string|max:10',
            'observacoes'          => 'nullable|string',
        ]);

        $data['status'] = 'rascunho';
        $data['responsavel_id'] = Auth::id();

        $apontamento = ApontamentoProducao::create($data);
        return response()->json($apontamento->load(['contrato', 'equipe', 'atividade']), 201);
    }

    public function show(ApontamentoProducao $apontamento)
    {
        return response()->json(
            $apontamento->load(['contrato', 'equipe', 'atividade', 'trecho.rodovia', 'responsavel', 'fotos'])
        );
    }

    public function update(Request $request, ApontamentoProducao $apontamento)
    {
        if ($apontamento->status !== 'rascunho') {
            return response()->json(['message' => 'Só é possível editar apontamentos em rascunho.'], 422);
        }

        $data = $request->validate([
            'atividade_id'         => 'nullable|exists:atividades,id',
            'item_contratual_id'   => 'nullable|exists:itens_contratuais,id',
            'trecho_id'            => 'nullable|exists:trechos,id',
            'data'                 => 'sometimes|date',
            'turno'                => 'sometimes|in:manha,tarde,noite,integral',
            'hora_inicio'          => 'nullable|date_format:H:i',
            'hora_fim'             => 'nullable|date_format:H:i',
            'km_inicial'           => 'nullable|numeric|min:0',
            'km_final'             => 'nullable|numeric|min:0',
            'sentido'              => 'nullable|string|max:20',
            'lado'                 => 'nullable|string|max:20',
            'quantidade_executada' => 'sometimes|numeric|min:0',
            'observacoes'          => 'nullable|string',
        ]);

        $apontamento->update($data);
        return response()->json($apontamento->load(['contrato', 'equipe', 'atividade']));
    }

    public function destroy(ApontamentoProducao $apontamento)
    {
        $apontamento->delete();
        return response()->json(null, 204);
    }

    public function enviar(ApontamentoProducao $apontamento)
    {
        if ($apontamento->status !== 'rascunho') {
            return response()->json(['message' => 'Apenas rascunhos podem ser enviados.'], 422);
        }
        $apontamento->update(['status' => 'enviado']);
        return response()->json($apontamento);
    }

    public function validar(Request $request, ApontamentoProducao $apontamento)
    {
        if ($apontamento->status !== 'enviado') {
            return response()->json(['message' => 'Apenas apontamentos enviados podem ser validados.'], 422);
        }
        $apontamento->update([
            'status'      => 'validado',
            'validado_por' => Auth::id(),
            'validado_em' => now(),
        ]);
        return response()->json($apontamento);
    }

    public function rejeitar(Request $request, ApontamentoProducao $apontamento)
    {
        $request->validate(['motivo_rejeicao' => 'required|string']);

        if ($apontamento->status !== 'enviado') {
            return response()->json(['message' => 'Apenas apontamentos enviados podem ser rejeitados.'], 422);
        }
        $apontamento->update([
            'status'          => 'rejeitado',
            'motivo_rejeicao' => $request->motivo_rejeicao,
        ]);
        return response()->json($apontamento);
    }
}

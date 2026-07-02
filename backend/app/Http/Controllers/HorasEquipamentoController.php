<?php

namespace App\Http\Controllers;

use App\Models\HorasEquipamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HorasEquipamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = HorasEquipamento::with(['equipamento', 'contrato', 'operador', 'motivoParada', 'registradoPor'])
            ->orderBy('data', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->contrato_id) {
            $query->where('contrato_id', $request->contrato_id);
        }
        if ($request->equipamento_id) {
            $query->where('equipamento_id', $request->equipamento_id);
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
            'codigo'              => 'required|string|max:20|unique:horas_equipamento,codigo',
            'equipamento_id'      => 'required|exists:equipamentos,id',
            'contrato_id'         => 'nullable|exists:contratos,id',
            'operador_id'         => 'nullable|exists:colaboradores,id',
            'apontamento_id'      => 'nullable|exists:apontamentos_producao,id',
            'data'                => 'required|date',
            'hora_inicio'         => 'required|date_format:H:i',
            'hora_fim'            => 'required|date_format:H:i',
            'horimetro_inicial'   => 'nullable|numeric|min:0',
            'horimetro_final'     => 'nullable|numeric|min:0',
            'hodometro_inicial'   => 'nullable|numeric|min:0',
            'hodometro_final'     => 'nullable|numeric|min:0',
            'horas_produtivas'    => 'required|numeric|min:0',
            'horas_improdutivas'  => 'nullable|numeric|min:0',
            'horas_paradas'       => 'nullable|numeric|min:0',
            'motivo_parada_id'    => 'nullable|exists:motivos_parada,id',
            'observacoes'         => 'nullable|string',
        ]);

        $data['status'] = 'rascunho';
        $data['registrado_por'] = Auth::id();

        $horas = HorasEquipamento::create($data);
        return response()->json($horas->load(['equipamento', 'contrato', 'operador']), 201);
    }

    public function show(HorasEquipamento $horasEquipamento)
    {
        return response()->json(
            $horasEquipamento->load(['equipamento', 'contrato', 'operador', 'motivoParada', 'registradoPor'])
        );
    }

    public function update(Request $request, HorasEquipamento $horasEquipamento)
    {
        if ($horasEquipamento->status !== 'rascunho') {
            return response()->json(['message' => 'Só é possível editar registros em rascunho.'], 422);
        }

        $data = $request->validate([
            'operador_id'         => 'nullable|exists:colaboradores,id',
            'hora_inicio'         => 'sometimes|date_format:H:i',
            'hora_fim'            => 'sometimes|date_format:H:i',
            'horimetro_inicial'   => 'nullable|numeric|min:0',
            'horimetro_final'     => 'nullable|numeric|min:0',
            'hodometro_inicial'   => 'nullable|numeric|min:0',
            'hodometro_final'     => 'nullable|numeric|min:0',
            'horas_produtivas'    => 'sometimes|numeric|min:0',
            'horas_improdutivas'  => 'nullable|numeric|min:0',
            'horas_paradas'       => 'nullable|numeric|min:0',
            'motivo_parada_id'    => 'nullable|exists:motivos_parada,id',
            'observacoes'         => 'nullable|string',
        ]);

        $horasEquipamento->update($data);
        return response()->json($horasEquipamento->load(['equipamento', 'contrato', 'operador']));
    }

    public function destroy(HorasEquipamento $horasEquipamento)
    {
        $horasEquipamento->delete();
        return response()->json(null, 204);
    }

    public function enviar(HorasEquipamento $horasEquipamento)
    {
        if ($horasEquipamento->status !== 'rascunho') {
            return response()->json(['message' => 'Apenas rascunhos podem ser enviados.'], 422);
        }
        $horasEquipamento->update(['status' => 'enviado']);
        return response()->json($horasEquipamento);
    }

    public function validar(Request $request, HorasEquipamento $horasEquipamento)
    {
        if ($horasEquipamento->status !== 'enviado') {
            return response()->json(['message' => 'Apenas registros enviados podem ser validados.'], 422);
        }
        $horasEquipamento->update(['status' => 'validado']);
        return response()->json($horasEquipamento);
    }
}

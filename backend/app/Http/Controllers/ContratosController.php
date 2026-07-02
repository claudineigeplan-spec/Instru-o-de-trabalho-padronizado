<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use App\Models\ItemContratual;
use Illuminate\Http\Request;

class ContratosController extends Controller
{
    public function index(Request $request)
    {
        $query = Contrato::with(['centroCusto', 'itensContratuais'])
            ->orderBy('data_inicio', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }
        if ($request->busca) {
            $b = $request->busca;
            $query->where(fn($q) => $q->where('numero', 'like', "%$b%")
                ->orWhere('objeto', 'like', "%$b%")
                ->orWhere('cliente', 'like', "%$b%"));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero'           => 'required|string|unique:contratos,numero',
            'objeto'           => 'required|string',
            'cliente'          => 'required|string|max:255',
            'orgao_contratante'=> 'nullable|string|max:255',
            'tipo'             => 'required|in:conserva,obra,terraplenagem,pavimentacao,outros',
            'data_inicio'      => 'required|date',
            'data_fim'         => 'required|date|after:data_inicio',
            'valor_inicial'    => 'required|numeric|min:0',
            'valor_atualizado' => 'nullable|numeric|min:0',
            'status'           => 'nullable|in:ativo,suspenso,encerrado,cancelado',
            'centro_custo_id'  => 'nullable|exists:centros_custo,id',
            'observacoes'      => 'nullable|string',
        ]);

        $data['valor_atualizado'] ??= $data['valor_inicial'];
        $data['status'] ??= 'ativo';

        $contrato = Contrato::create($data);
        return response()->json($contrato->load('itensContratuais'), 201);
    }

    public function show(Contrato $contrato)
    {
        return response()->json(
            $contrato->load(['centroCusto', 'itensContratuais', 'trechos.rodovia'])
        );
    }

    public function update(Request $request, Contrato $contrato)
    {
        $data = $request->validate([
            'objeto'           => 'sometimes|string',
            'cliente'          => 'sometimes|string|max:255',
            'orgao_contratante'=> 'nullable|string|max:255',
            'tipo'             => 'sometimes|in:conserva,obra,terraplenagem,pavimentacao,outros',
            'data_inicio'      => 'sometimes|date',
            'data_fim'         => 'sometimes|date',
            'valor_inicial'    => 'sometimes|numeric|min:0',
            'valor_atualizado' => 'nullable|numeric|min:0',
            'status'           => 'sometimes|in:ativo,suspenso,encerrado,cancelado',
            'centro_custo_id'  => 'nullable|exists:centros_custo,id',
            'observacoes'      => 'nullable|string',
        ]);

        $contrato->update($data);
        return response()->json($contrato->load('itensContratuais'));
    }

    public function destroy(Contrato $contrato)
    {
        $contrato->delete();
        return response()->json(null, 204);
    }

    /* ── Itens contratuais ────────────────────────────────── */

    public function itens(Contrato $contrato)
    {
        return response()->json($contrato->itensContratuais()->orderBy('codigo_item')->get());
    }

    public function storeItem(Request $request, Contrato $contrato)
    {
        $data = $request->validate([
            'codigo'          => 'required|string|max:20',
            'descricao'       => 'required|string',
            'unidade'         => 'required|string|max:10',
            'quantidade'      => 'required|numeric|min:0',
            'preco_unitario'  => 'required|numeric|min:0',
        ]);

        $item = $contrato->itensContratuais()->create($data);
        return response()->json($item, 201);
    }

    public function updateItem(Request $request, Contrato $contrato, ItemContratual $item)
    {
        $data = $request->validate([
            'codigo'              => 'sometimes|string|max:20',
            'descricao'           => 'sometimes|string',
            'unidade'             => 'sometimes|string|max:10',
            'quantidade'          => 'sometimes|numeric|min:0',
            'preco_unitario'      => 'sometimes|numeric|min:0',
            'quantidade_medida'   => 'sometimes|numeric|min:0',
        ]);

        $item->update($data);
        return response()->json($item);
    }

    public function destroyItem(Contrato $contrato, ItemContratual $item)
    {
        $item->delete();
        return response()->json(null, 204);
    }
}

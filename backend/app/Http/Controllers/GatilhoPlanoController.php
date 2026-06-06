<?php

namespace App\Http\Controllers;

use App\Models\GatilhoPlano;
use App\Models\PlanoManutencao;
use Illuminate\Http\Request;

class GatilhoPlanoController extends Controller
{
    public function index(PlanoManutencao $plano)
    {
        return response()->json($plano->gatilhos);
    }

    public function store(Request $request, PlanoManutencao $plano)
    {
        $data = $request->validate([
            'tipo' => 'required|in:km,horas,ciclos,periodicidade_dias,data_fixa',
            'valor_intervalo' => 'required|numeric|min:1',
            'antecedencia_alerta' => 'nullable|numeric|min:0',
            'ultimo_valor_executado' => 'nullable|numeric|min:0',
            'proxima_data_execucao' => 'nullable|date',
        ]);

        $gatilho = $plano->gatilhos()->create($data);
        return response()->json($gatilho, 201);
    }

    public function show(GatilhoPlano $gatilho)
    {
        return response()->json($gatilho);
    }

    public function update(Request $request, GatilhoPlano $gatilho)
    {
        $data = $request->validate([
            'tipo' => 'sometimes|in:km,horas,ciclos,periodicidade_dias,data_fixa',
            'valor_intervalo' => 'sometimes|numeric|min:1',
            'antecedencia_alerta' => 'nullable|numeric|min:0',
            'ultimo_valor_executado' => 'nullable|numeric|min:0',
            'proxima_data_execucao' => 'nullable|date',
        ]);

        $gatilho->update($data);
        return response()->json($gatilho);
    }

    public function destroy(GatilhoPlano $gatilho)
    {
        $gatilho->delete();
        return response()->json(null, 204);
    }
}

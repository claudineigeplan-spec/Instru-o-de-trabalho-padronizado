<?php

namespace App\Http\Controllers;

use App\Models\Equipamento;
use App\Models\RegistroUso;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class EquipamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipamento::query();

        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'tipo' => 'required|in:veiculo_leve,caminhao,maquina_pesada,utilitario,reboque,veiculo,maquina,eletrico_hidraulico',
            'modelo' => 'nullable|string',
            'fabricante' => 'nullable|string',
            'ano' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'placa_serie' => 'nullable|string',
            'hodometro_atual' => 'nullable|numeric|min:0',
            'horimetro_atual' => 'nullable|numeric|min:0',
        ]);

        $equipamento = Equipamento::create($data);
        return response()->json($equipamento, 201);
    }

    public function show(Equipamento $equipamento)
    {
        return response()->json($equipamento->load(['planosManutencao.gatilhos', 'alertas' => fn($q) => $q->where('status', 'novo')]));
    }

    public function update(Request $request, Equipamento $equipamento)
    {
        $data = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'tipo' => 'sometimes|in:veiculo_leve,caminhao,maquina_pesada,utilitario,reboque,veiculo,maquina,eletrico_hidraulico',
            'modelo' => 'nullable|string',
            'fabricante' => 'nullable|string',
            'ano' => 'nullable|integer',
            'placa_serie' => 'nullable|string',
            'status' => 'sometimes|in:ativo,inativo,em_manutencao',
            'hodometro_atual' => 'nullable|numeric|min:0',
            'horimetro_atual' => 'nullable|numeric|min:0',
        ]);

        $equipamento->update($data);
        return response()->json($equipamento);
    }

    public function destroy(Equipamento $equipamento)
    {
        $equipamento->delete();
        return response()->json(null, 204);
    }

    public function registrarUso(Request $request, Equipamento $equipamento)
    {
        $data = $request->validate([
            'km_atual' => 'nullable|numeric|min:0',
            'horas_atual' => 'nullable|numeric|min:0',
            'data' => 'required|date',
            'observacao' => 'nullable|string',
        ]);

        RegistroUso::create([
            'equipamento_id' => $equipamento->id,
            'usuario_id' => $request->user()->id,
            'data' => $data['data'],
            'km_anterior' => $equipamento->hodometro_atual,
            'km_atual' => $data['km_atual'] ?? $equipamento->hodometro_atual,
            'horas_anterior' => $equipamento->horimetro_atual,
            'horas_atual' => $data['horas_atual'] ?? $equipamento->horimetro_atual,
            'observacao' => $data['observacao'] ?? null,
        ]);

        $equipamento->update([
            'hodometro_atual' => $data['km_atual'] ?? $equipamento->hodometro_atual,
            'horimetro_atual' => $data['horas_atual'] ?? $equipamento->horimetro_atual,
        ]);

        return response()->json(['message' => 'Uso registrado com sucesso.']);
    }

    public function historico(Equipamento $equipamento)
    {
        return response()->json([
            'registros_uso' => $equipamento->registrosUso()->with('usuario:id,name')->latest('data')->limit(30)->get(),
            'ordens_servico' => $equipamento->ordensServico()->with('tecnico:id,name')->latest()->limit(20)->get(),
        ]);
    }

    public function qrcode(Request $request, Equipamento $equipamento)
    {
        $appUrl = config('app.url', 'http://localhost:8080');
        $frontendUrl = str_replace(':8080', ':5173', $appUrl);
        $url = "{$frontendUrl}/equipamentos?scan={$equipamento->placa_serie}";

        $svg = QrCode::format('svg')
            ->size(300)
            ->margin(2)
            ->generate($url);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}

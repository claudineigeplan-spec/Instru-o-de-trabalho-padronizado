<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use Illuminate\Http\Request;

class AlertaController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $naoLidos = Alerta::whereJsonContains('perfis_destinatarios', $user->role)
            ->where('status', 'novo')
            ->count();

        if ($request->boolean('apenas_count')) {
            return response()->json(['count' => $naoLidos]);
        }

        $alertas = Alerta::where(function ($q) use ($user) {
            $q->whereJsonContains('perfis_destinatarios', $user->role);
        })
            ->with('equipamento:id,nome')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('created_at')
            ->paginate(30);

        return response()->json([
            'alertas'   => $alertas,
            'nao_lidos' => $naoLidos,
        ]);
    }

    public function marcarLido(Request $request, Alerta $alerta)
    {
        $alerta->update(['status' => 'lido']);
        return response()->json($alerta);
    }

    public function marcarTodosLidos(Request $request)
    {
        $user = $request->user();

        Alerta::whereJsonContains('perfis_destinatarios', $user->role)
            ->where('status', 'novo')
            ->update(['status' => 'lido']);

        return response()->json(['message' => 'Todos os alertas foram marcados como lidos.']);
    }
}

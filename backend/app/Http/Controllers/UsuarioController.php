<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(User::orderBy('name')->get(['id', 'name', 'email', 'role', 'setor', 'ativo']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:gestor,lider_campo,mecanico,operador',
            'setor' => 'nullable|string',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'setor', 'ativo']), 201);
    }

    public function show(User $usuario)
    {
        return response()->json($usuario->only(['id', 'name', 'email', 'role', 'setor', 'ativo']));
    }

    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $usuario->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:gestor,lider_campo,mecanico,operador',
            'setor' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);
        return response()->json($usuario->only(['id', 'name', 'email', 'role', 'setor', 'ativo']));
    }

    public function destroy(User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return response()->json(['message' => 'Não é possível excluir o próprio usuário.'], 422);
        }
        $usuario->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RegistroUso extends Model
{
    use HasFactory;

    protected $table = 'registros_uso';

    protected $fillable = [
        'equipamento_id', 'usuario_id', 'data',
        'km_anterior', 'km_atual', 'horas_anterior', 'horas_atual', 'observacao',
    ];

    protected $casts = [
        'data' => 'date',
        'km_anterior' => 'float',
        'km_atual' => 'float',
        'horas_anterior' => 'float',
        'horas_atual' => 'float',
    ];

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

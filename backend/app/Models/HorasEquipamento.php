<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HorasEquipamento extends Model
{
    use SoftDeletes;

    protected $table = 'horas_equipamento';

    protected $fillable = [
        'codigo', 'equipamento_id', 'contrato_id', 'operador_id', 'apontamento_id',
        'data', 'hora_inicio', 'hora_fim',
        'horimetro_inicial', 'horimetro_final',
        'hodometro_inicial', 'hodometro_final',
        'horas_produtivas', 'horas_improdutivas', 'horas_paradas',
        'motivo_parada_id', 'observacoes', 'status', 'registrado_por',
    ];

    protected $casts = ['data' => 'date'];

    public function equipamento() { return $this->belongsTo(Equipamento::class); }
    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function operador() { return $this->belongsTo(Colaborador::class, 'operador_id'); }
    public function apontamento() { return $this->belongsTo(ApontamentoProducao::class); }
    public function motivoParada() { return $this->belongsTo(MotivoParada::class); }
    public function registradoPor() { return $this->belongsTo(User::class, 'registrado_por'); }
}

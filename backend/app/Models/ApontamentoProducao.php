<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApontamentoProducao extends Model
{
    use SoftDeletes;

    protected $table = 'apontamentos_producao';

    protected $fillable = [
        'codigo', 'contrato_id', 'equipe_id', 'atividade_id',
        'item_contratual_id', 'trecho_id', 'programacao_id', 'responsavel_id',
        'data', 'turno', 'hora_inicio', 'hora_fim',
        'km_inicial', 'km_final', 'sentido', 'lado',
        'quantidade_executada', 'unidade',
        'clima', 'condicao_local', 'observacoes', 'interferencias',
        'status', 'validado_por', 'validado_em', 'motivo_rejeicao',
    ];

    protected $casts = [
        'data' => 'date',
        'validado_em' => 'datetime',
        'quantidade_executada' => 'decimal:3',
        'km_inicial' => 'decimal:3',
        'km_final' => 'decimal:3',
    ];

    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function equipe() { return $this->belongsTo(EquipeCampo::class, 'equipe_id'); }
    public function atividade() { return $this->belongsTo(Atividade::class); }
    public function trecho() { return $this->belongsTo(Trecho::class); }
    public function responsavel() { return $this->belongsTo(User::class, 'responsavel_id'); }
    public function validadoPor() { return $this->belongsTo(User::class, 'validado_por'); }
    public function fotos() { return $this->hasMany(ApontamentoFoto::class, 'apontamento_id'); }
    public function horasEquipamento() { return $this->hasMany(HorasEquipamento::class, 'apontamento_id'); }
}

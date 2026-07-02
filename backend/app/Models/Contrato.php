<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contrato extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'empresa_id', 'centro_custo_id', 'numero', 'objeto',
        'cliente', 'orgao_contratante', 'tipo',
        'data_inicio', 'data_fim', 'valor_inicial', 'valor_atualizado',
        'status', 'observacoes',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'valor_inicial' => 'decimal:2',
        'valor_atualizado' => 'decimal:2',
    ];

    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function centroCusto() { return $this->belongsTo(CentroCusto::class); }
    public function trechos() { return $this->hasMany(Trecho::class); }
    public function itensContratuais() { return $this->hasMany(ItemContratual::class); }
    public function programacoes() { return $this->hasMany(Programacao::class); }
    public function apontamentos() { return $this->hasMany(ApontamentoProducao::class); }
}

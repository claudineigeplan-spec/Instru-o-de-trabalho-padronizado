<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramacaoItem extends Model
{
    protected $table = 'programacao_itens';

    protected $fillable = [
        'programacao_id', 'atividade_id', 'item_contratual_id',
        'quantidade_prevista', 'quantidade_executada', 'unidade', 'observacoes',
    ];

    protected $casts = [
        'quantidade_prevista' => 'decimal:3',
        'quantidade_executada' => 'decimal:3',
    ];

    public function programacao() { return $this->belongsTo(Programacao::class); }
    public function atividade() { return $this->belongsTo(Atividade::class); }
    public function itemContratual() { return $this->belongsTo(ItemContratual::class); }
}

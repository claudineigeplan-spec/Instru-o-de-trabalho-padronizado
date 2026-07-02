<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ItemContratual extends Model
{
    use SoftDeletes;

    protected $table = 'itens_contratuais';

    protected $fillable = [
        'contrato_id', 'atividade_id', 'codigo_item', 'descricao',
        'unidade', 'quantidade_contratada', 'quantidade_medida', 'preco_unitario',
    ];

    protected $casts = [
        'quantidade_contratada' => 'decimal:3',
        'quantidade_medida' => 'decimal:3',
        'preco_unitario' => 'decimal:4',
    ];

    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function atividade() { return $this->belongsTo(Atividade::class); }

    public function getSaldoAttribute(): float
    {
        return (float) $this->quantidade_contratada - (float) $this->quantidade_medida;
    }

    public function getValorMedidoAttribute(): float
    {
        return (float) $this->quantidade_medida * (float) $this->preco_unitario;
    }
}

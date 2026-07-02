<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trecho extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contrato_id', 'rodovia_id', 'descricao',
        'km_inicial', 'km_final', 'municipio', 'ativo',
    ];

    protected $casts = [
        'km_inicial' => 'decimal:3',
        'km_final' => 'decimal:3',
        'ativo' => 'boolean',
    ];

    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function rodovia() { return $this->belongsTo(Rodovia::class); }
}

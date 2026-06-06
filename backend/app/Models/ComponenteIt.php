<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComponenteIt extends Model
{
    use HasFactory;

    protected $table = 'componentes_it';

    protected $fillable = [
        'instrucao_trabalho_id', 'item_estoque_id', 'quantidade', 'obrigatorio',
    ];

    protected $casts = [
        'quantidade' => 'float',
        'obrigatorio' => 'boolean',
    ];

    public function instrucao()
    {
        return $this->belongsTo(InstrucaoTrabalho::class, 'instrucao_trabalho_id');
    }

    public function item()
    {
        return $this->belongsTo(ItemEstoque::class, 'item_estoque_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemEstoque extends Model
{
    use HasFactory;

    protected $table = 'itens_estoque';

    protected $fillable = ['codigo', 'nome', 'tipo', 'unidade', 'estoque_minimo'];

    protected $casts = ['estoque_minimo' => 'integer'];

    const TIPOS = ['peca', 'oleo', 'filtro', 'outros'];

    public function previsoes()
    {
        return $this->hasMany(PrevisaoReposicao::class, 'item_estoque_id');
    }
}

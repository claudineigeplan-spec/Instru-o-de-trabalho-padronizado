<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Atividade extends Model
{
    use SoftDeletes;

    protected $fillable = ['codigo', 'nome', 'categoria', 'unidade_medida', 'ativo'];

    protected $casts = ['ativo' => 'boolean'];

    public function itensContratuais() { return $this->hasMany(ItemContratual::class); }
    public function programacaoItens() { return $this->hasMany(ProgramacaoItem::class); }
    public function apontamentos() { return $this->hasMany(ApontamentoProducao::class); }
}

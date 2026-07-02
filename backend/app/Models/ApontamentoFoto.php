<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApontamentoFoto extends Model
{
    protected $table = 'apontamento_fotos';
    protected $fillable = ['apontamento_id', 'path', 'momento', 'descricao'];
    public function apontamento() { return $this->belongsTo(ApontamentoProducao::class); }
}

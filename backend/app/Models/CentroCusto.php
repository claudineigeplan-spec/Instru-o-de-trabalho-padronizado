<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CentroCusto extends Model
{
    use SoftDeletes;

    protected $table = 'centros_custo';

    protected $fillable = ['empresa_id', 'codigo', 'nome', 'descricao', 'ativo'];

    protected $casts = ['ativo' => 'boolean'];

    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function contratos() { return $this->hasMany(Contrato::class); }
}

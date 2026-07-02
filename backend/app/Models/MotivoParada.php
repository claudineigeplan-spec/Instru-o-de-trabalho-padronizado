<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotivoParada extends Model
{
    protected $table = 'motivos_parada';
    protected $fillable = ['codigo', 'descricao', 'categoria', 'ativo'];
    protected $casts = ['ativo' => 'boolean'];
    public function horasEquipamento() { return $this->hasMany(HorasEquipamento::class); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EquipeCampo extends Model
{
    use SoftDeletes;

    protected $table = 'equipes_campo';

    protected $fillable = ['empresa_id', 'contrato_id', 'lider_id', 'nome', 'tipo', 'ativo'];

    protected $casts = ['ativo' => 'boolean'];

    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function lider() { return $this->belongsTo(Colaborador::class, 'lider_id'); }
    public function colaboradores() { return $this->belongsToMany(Colaborador::class, 'equipe_colaborador', 'equipe_id', 'colaborador_id')->withPivot('funcao_na_equipe', 'ativo'); }
    public function programacoes() { return $this->hasMany(Programacao::class, 'equipe_id'); }
}

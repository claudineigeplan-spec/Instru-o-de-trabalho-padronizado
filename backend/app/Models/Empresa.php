<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empresa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'razao_social', 'nome_fantasia', 'cnpj', 'endereco',
        'cidade', 'uf', 'telefone', 'email', 'ativo',
    ];

    protected $casts = ['ativo' => 'boolean'];

    public function contratos() { return $this->hasMany(Contrato::class); }
    public function centrosCusto() { return $this->hasMany(CentroCusto::class); }
    public function colaboradores() { return $this->hasMany(Colaborador::class); }
    public function equipes() { return $this->hasMany(EquipeCampo::class); }
}

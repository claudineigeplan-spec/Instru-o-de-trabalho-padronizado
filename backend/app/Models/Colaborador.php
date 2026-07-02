<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Colaborador extends Model
{
    use SoftDeletes;

    protected $table = 'colaboradores';

    protected $fillable = [
        'empresa_id', 'user_id', 'matricula', 'nome', 'cpf',
        'funcao', 'cargo', 'setor', 'data_admissao',
        'vinculo', 'status', 'telefone',
        'cnh_categoria', 'cnh_validade', 'aso_validade',
    ];

    protected $casts = [
        'data_admissao' => 'date',
        'cnh_validade' => 'date',
        'aso_validade' => 'date',
    ];

    public function empresa() { return $this->belongsTo(Empresa::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function equipes() { return $this->belongsToMany(EquipeCampo::class, 'equipe_colaborador', 'colaborador_id', 'equipe_id'); }
}

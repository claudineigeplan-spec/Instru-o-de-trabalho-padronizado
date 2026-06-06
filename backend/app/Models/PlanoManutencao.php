<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlanoManutencao extends Model
{
    use HasFactory;

    protected $table = 'planos_manutencao';

    protected $fillable = ['equipamento_id', 'nome', 'descricao', 'ativo'];

    protected $casts = ['ativo' => 'boolean'];

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function gatilhos()
    {
        return $this->hasMany(GatilhoPlano::class, 'plano_id');
    }

    public function instrucaoTrabalho()
    {
        return $this->hasOne(InstrucaoTrabalho::class, 'plano_manutencao_id');
    }

    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class, 'plano_id');
    }
}

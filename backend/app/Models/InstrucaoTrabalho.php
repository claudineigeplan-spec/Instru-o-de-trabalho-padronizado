<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstrucaoTrabalho extends Model
{
    use HasFactory;

    protected $table = 'instrucoes_trabalho';

    protected $fillable = [
        'plano_manutencao_id', 'titulo', 'descricao', 'tempo_estimado_min',
        'tipo', 'prioridade', 'responsavel', 'status',
    ];

    protected $casts = ['tempo_estimado_min' => 'integer'];

    public function plano()
    {
        return $this->belongsTo(PlanoManutencao::class, 'plano_manutencao_id');
    }

    public function passos()
    {
        return $this->hasMany(PassoIt::class, 'instrucao_trabalho_id')->orderBy('ordem');
    }

    public function componentes()
    {
        return $this->hasMany(ComponenteIt::class, 'instrucao_trabalho_id');
    }
}

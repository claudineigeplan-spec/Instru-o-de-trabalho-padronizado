<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Equipamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome', 'tipo', 'modelo', 'fabricante', 'ano',
        'placa_serie', 'imagem', 'status',
        'hodometro_atual', 'horimetro_atual',
    ];

    protected $casts = [
        'hodometro_atual' => 'float',
        'horimetro_atual' => 'float',
    ];

    const TIPOS = ['veiculo', 'maquina', 'eletrico_hidraulico'];
    const STATUS = ['ativo', 'inativo', 'em_manutencao'];

    public function planosManutencao()
    {
        return $this->hasMany(PlanoManutencao::class);
    }

    public function modelosChecklist()
    {
        return $this->hasMany(ModeloChecklist::class);
    }

    public function execucoesChecklist()
    {
        return $this->hasMany(ExecucaoChecklist::class);
    }

    public function ordensServico()
    {
        return $this->hasMany(OrdemServico::class);
    }

    public function registrosUso()
    {
        return $this->hasMany(RegistroUso::class);
    }

    public function alertas()
    {
        return $this->hasMany(Alerta::class);
    }
}

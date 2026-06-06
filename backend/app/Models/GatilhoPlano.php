<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GatilhoPlano extends Model
{
    use HasFactory;

    protected $table = 'gatilhos_plano';

    protected $fillable = [
        'plano_id', 'tipo', 'valor_intervalo',
        'ultimo_valor_executado', 'proxima_data_execucao',
        'antecedencia_alerta',
    ];

    protected $casts = [
        'valor_intervalo' => 'float',
        'ultimo_valor_executado' => 'float',
        'proxima_data_execucao' => 'date',
        'antecedencia_alerta' => 'float',
    ];

    const TIPOS = ['km', 'horas', 'ciclos', 'periodicidade_dias', 'data_fixa'];

    public function plano()
    {
        return $this->belongsTo(PlanoManutencao::class, 'plano_id');
    }

    public function proximoValor(): float
    {
        return ($this->ultimo_valor_executado ?? 0) + $this->valor_intervalo;
    }

    public function valorAlerta(): float
    {
        return $this->proximoValor() - $this->antecedencia_alerta;
    }
}

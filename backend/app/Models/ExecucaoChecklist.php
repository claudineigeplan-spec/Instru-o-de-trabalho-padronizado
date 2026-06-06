<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExecucaoChecklist extends Model
{
    use HasFactory;

    protected $table = 'execucoes_checklist';

    protected $fillable = [
        'modelo_id', 'equipamento_id', 'operador_id',
        'data_hora', 'status', 'km_atual', 'horas_atual', 'observacao',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
        'km_atual' => 'float',
        'horas_atual' => 'float',
    ];

    const STATUS = ['concluido', 'com_anomalia'];

    public function modelo()
    {
        return $this->belongsTo(ModeloChecklist::class, 'modelo_id');
    }

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function operador()
    {
        return $this->belongsTo(User::class, 'operador_id');
    }

    public function respostas()
    {
        return $this->hasMany(RespostaChecklist::class, 'execucao_id');
    }
}

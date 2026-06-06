<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrdemServico extends Model
{
    use HasFactory;

    protected $table = 'ordens_servico';

    protected $fillable = [
        'codigo', 'equipamento_id', 'plano_id', 'tipo', 'titulo', 'descricao',
        'prioridade', 'status', 'solicitante_id', 'tecnico_id', 'supervisor_id',
        'data_abertura', 'data_prevista', 'data_conclusao',
        'km_execucao', 'horas_execucao',
    ];

    protected $casts = [
        'data_abertura' => 'datetime',
        'data_prevista' => 'date',
        'data_conclusao' => 'datetime',
        'km_execucao' => 'float',
        'horas_execucao' => 'float',
    ];

    const TIPOS = ['preventiva', 'corretiva', 'preditiva'];
    const PRIORIDADES = ['baixa', 'media', 'alta', 'urgente'];
    const STATUS = ['aberta', 'aprovada', 'em_andamento', 'concluida', 'cancelada'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($os) {
            $os->codigo = 'OS-' . str_pad(static::withTrashed()->count() + 1, 4, '0', STR_PAD_LEFT);
        });
    }

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function plano()
    {
        return $this->belongsTo(PlanoManutencao::class, 'plano_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function execucoes()
    {
        return $this->hasMany(ExecucaoOs::class, 'os_id');
    }
}

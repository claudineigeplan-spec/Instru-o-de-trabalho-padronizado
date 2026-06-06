<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Alerta extends Model
{
    use HasFactory;

    protected $table = 'alertas';

    public $timestamps = false;

    protected $fillable = [
        'tipo', 'equipamento_id', 'referencia_id', 'referencia_tipo',
        'mensagem', 'perfis_destinatarios', 'status',
    ];

    protected $casts = [
        'perfis_destinatarios' => 'array',
        'created_at' => 'datetime',
    ];

    const TIPOS = [
        'manutencao_vencendo',
        'manutencao_vencida',
        'checklist_anomalia',
        'reposicao_peca',
        'os_aberta',
        'os_vencida',
    ];

    const STATUS = ['novo', 'lido', 'resolvido'];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn($m) => $m->created_at = now());
    }

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function referencia()
    {
        return $this->morphTo();
    }
}

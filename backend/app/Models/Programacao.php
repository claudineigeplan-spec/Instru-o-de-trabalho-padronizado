<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Programacao extends Model
{
    use SoftDeletes;

    protected $table = 'programacoes';

    protected $fillable = [
        'contrato_id', 'equipe_id', 'lider_id', 'trecho_id',
        'data_programada', 'tipo', 'turno', 'observacoes', 'status',
        'criado_por', 'aprovado_por', 'aprovado_em',
    ];

    protected $casts = [
        'data_programada' => 'date',
        'aprovado_em' => 'datetime',
    ];

    public function contrato() { return $this->belongsTo(Contrato::class); }
    public function equipe() { return $this->belongsTo(EquipeCampo::class, 'equipe_id'); }
    public function lider() { return $this->belongsTo(Colaborador::class, 'lider_id'); }
    public function trecho() { return $this->belongsTo(Trecho::class); }
    public function itens() { return $this->hasMany(ProgramacaoItem::class); }
    public function criadoPor() { return $this->belongsTo(User::class, 'criado_por'); }
    public function aprovadoPor() { return $this->belongsTo(User::class, 'aprovado_por'); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ModeloChecklist extends Model
{
    use HasFactory;

    protected $table = 'modelos_checklist';

    protected $fillable = [
        'nome', 'equipamento_id', 'tipo_equipamento', 'periodicidade', 'ativo',
    ];

    protected $casts = ['ativo' => 'boolean'];

    const PERIODICIDADES = ['diario', 'semanal', 'mensal'];

    public function equipamento()
    {
        return $this->belongsTo(Equipamento::class);
    }

    public function itens()
    {
        return $this->hasMany(ItemChecklist::class, 'modelo_id')->orderBy('ordem');
    }

    public function execucoes()
    {
        return $this->hasMany(ExecucaoChecklist::class, 'modelo_id');
    }
}

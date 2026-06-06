<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RespostaChecklist extends Model
{
    use HasFactory;

    protected $table = 'respostas_checklist';

    protected $fillable = ['execucao_id', 'item_id', 'resposta', 'observacao', 'foto'];

    public function execucao()
    {
        return $this->belongsTo(ExecucaoChecklist::class, 'execucao_id');
    }

    public function item()
    {
        return $this->belongsTo(ItemChecklist::class, 'item_id');
    }
}

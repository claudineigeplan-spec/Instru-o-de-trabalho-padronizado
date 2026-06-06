<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PassoExecutado extends Model
{
    use HasFactory;

    protected $table = 'passos_executados';

    protected $fillable = ['execucao_os_id', 'passo_id', 'concluido', 'observacao', 'foto'];

    protected $casts = ['concluido' => 'boolean'];

    public function execucaoOs()
    {
        return $this->belongsTo(ExecucaoOs::class, 'execucao_os_id');
    }

    public function passo()
    {
        return $this->belongsTo(PassoIt::class, 'passo_id');
    }
}

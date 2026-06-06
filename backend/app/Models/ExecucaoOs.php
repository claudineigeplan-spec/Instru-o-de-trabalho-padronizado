<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExecucaoOs extends Model
{
    use HasFactory;

    protected $table = 'execucoes_os';

    protected $fillable = ['os_id', 'instrucao_trabalho_id'];

    public function os()
    {
        return $this->belongsTo(OrdemServico::class, 'os_id');
    }

    public function instrucao()
    {
        return $this->belongsTo(InstrucaoTrabalho::class, 'instrucao_trabalho_id');
    }

    public function passosExecutados()
    {
        return $this->hasMany(PassoExecutado::class, 'execucao_os_id');
    }
}

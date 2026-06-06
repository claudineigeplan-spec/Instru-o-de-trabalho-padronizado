<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PassoIt extends Model
{
    use HasFactory;

    protected $table = 'passos_it';

    protected $fillable = [
        'instrucao_trabalho_id', 'ordem', 'titulo',
        'descricao', 'imagem', 'alerta_seguranca',
    ];

    protected $casts = ['ordem' => 'integer'];

    public function instrucao()
    {
        return $this->belongsTo(InstrucaoTrabalho::class, 'instrucao_trabalho_id');
    }
}

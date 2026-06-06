<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemChecklist extends Model
{
    use HasFactory;

    protected $table = 'itens_checklist';

    protected $fillable = [
        'modelo_id', 'descricao', 'tipo_resposta', 'critico', 'ordem',
    ];

    protected $casts = [
        'critico' => 'boolean',
        'ordem' => 'integer',
    ];

    const TIPOS_RESPOSTA = ['ok_nok', 'valor_numerico', 'texto'];

    public function modelo()
    {
        return $this->belongsTo(ModeloChecklist::class, 'modelo_id');
    }
}

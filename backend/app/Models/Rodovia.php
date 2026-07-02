<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rodovia extends Model
{
    use SoftDeletes;

    protected $fillable = ['codigo', 'nome', 'municipio', 'uf'];

    public function trechos() { return $this->hasMany(Trecho::class); }
}

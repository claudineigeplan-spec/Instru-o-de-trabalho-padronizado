<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM(
            'gestor','lider_campo','mecanico','operador',
            'diretor','engenheiro','pcp','apontador','encarregado',
            'motorista','almoxarife','comprador','rh','qualidade',
            'seguranca_trabalho','financeiro','visitante_consulta'
        ) NOT NULL DEFAULT 'operador'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM(
            'gestor','lider_campo','mecanico','operador'
        ) NOT NULL DEFAULT 'operador'");
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('instrucoes_trabalho', function (Blueprint $table) {
            $table->enum('tipo', ['preventiva', 'corretiva', 'preditiva', 'inspecao'])->default('preventiva')->after('titulo');
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media')->after('tipo');
            $table->string('responsavel')->nullable()->after('prioridade');
            $table->enum('status', ['rascunho', 'publicada', 'arquivada'])->default('rascunho')->after('responsavel');
        });
    }

    public function down(): void
    {
        Schema::table('instrucoes_trabalho', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'prioridade', 'responsavel', 'status']);
        });
    }
};

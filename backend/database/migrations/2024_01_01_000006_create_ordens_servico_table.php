<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ordens_servico', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->foreignId('equipamento_id')->constrained('equipamentos');
            $table->foreignId('plano_id')->nullable()->constrained('planos_manutencao')->onDelete('set null');
            $table->enum('tipo', ['preventiva', 'corretiva', 'preditiva'])->default('preventiva');
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->enum('prioridade', ['baixa', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('status', ['aberta', 'aprovada', 'em_andamento', 'concluida', 'cancelada'])->default('aberta');
            $table->foreignId('solicitante_id')->constrained('users');
            $table->foreignId('tecnico_id')->nullable()->constrained('users');
            $table->foreignId('supervisor_id')->nullable()->constrained('users');
            $table->dateTime('data_abertura');
            $table->date('data_prevista')->nullable();
            $table->dateTime('data_conclusao')->nullable();
            $table->float('km_execucao')->nullable();
            $table->float('horas_execucao')->nullable();
            $table->timestamps();
        });

        Schema::create('execucoes_os', function (Blueprint $table) {
            $table->id();
            $table->foreignId('os_id')->constrained('ordens_servico')->onDelete('cascade');
            $table->foreignId('instrucao_trabalho_id')->nullable()->constrained('instrucoes_trabalho')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('passos_executados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('execucao_os_id')->constrained('execucoes_os')->onDelete('cascade');
            $table->foreignId('passo_id')->constrained('passos_it');
            $table->boolean('concluido')->default(false);
            $table->text('observacao')->nullable();
            $table->string('foto')->nullable();
            $table->timestamps();
        });

        Schema::create('registros_uso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipamento_id')->constrained('equipamentos');
            $table->foreignId('usuario_id')->constrained('users');
            $table->date('data');
            $table->float('km_anterior')->default(0);
            $table->float('km_atual')->default(0);
            $table->float('horas_anterior')->default(0);
            $table->float('horas_atual')->default(0);
            $table->text('observacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_uso');
        Schema::dropIfExists('passos_executados');
        Schema::dropIfExists('execucoes_os');
        Schema::dropIfExists('ordens_servico');
    }
};

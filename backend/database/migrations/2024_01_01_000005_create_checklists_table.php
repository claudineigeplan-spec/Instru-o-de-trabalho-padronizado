<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('modelos_checklist', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->foreignId('equipamento_id')->nullable()->constrained('equipamentos')->onDelete('cascade');
            $table->enum('tipo_equipamento', ['veiculo', 'maquina', 'eletrico_hidraulico'])->nullable();
            $table->enum('periodicidade', ['diario', 'semanal', 'mensal'])->default('diario');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::create('itens_checklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modelo_id')->constrained('modelos_checklist')->onDelete('cascade');
            $table->string('descricao');
            $table->enum('tipo_resposta', ['ok_nok', 'valor_numerico', 'texto'])->default('ok_nok');
            $table->boolean('critico')->default(false);
            $table->integer('ordem')->default(1);
            $table->timestamps();
        });

        Schema::create('execucoes_checklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modelo_id')->constrained('modelos_checklist');
            $table->foreignId('equipamento_id')->constrained('equipamentos');
            $table->foreignId('operador_id')->constrained('users');
            $table->dateTime('data_hora');
            $table->enum('status', ['concluido', 'com_anomalia'])->default('concluido');
            $table->float('km_atual')->nullable();
            $table->float('horas_atual')->nullable();
            $table->text('observacao')->nullable();
            $table->timestamps();
        });

        Schema::create('respostas_checklist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('execucao_id')->constrained('execucoes_checklist')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('itens_checklist');
            $table->string('resposta')->nullable();
            $table->text('observacao')->nullable();
            $table->string('foto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respostas_checklist');
        Schema::dropIfExists('execucoes_checklist');
        Schema::dropIfExists('itens_checklist');
        Schema::dropIfExists('modelos_checklist');
    }
};

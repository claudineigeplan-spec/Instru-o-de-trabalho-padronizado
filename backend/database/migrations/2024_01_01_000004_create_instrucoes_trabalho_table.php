<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('instrucoes_trabalho', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_manutencao_id')->nullable()->constrained('planos_manutencao')->onDelete('set null');
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->integer('tempo_estimado_min')->default(0);
            $table->timestamps();
        });

        Schema::create('passos_it', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instrucao_trabalho_id')->constrained('instrucoes_trabalho')->onDelete('cascade');
            $table->integer('ordem')->default(1);
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('imagem')->nullable();
            $table->text('alerta_seguranca')->nullable();
            $table->timestamps();
        });

        Schema::create('itens_estoque', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nome');
            $table->enum('tipo', ['peca', 'oleo', 'filtro', 'outros'])->default('outros');
            $table->string('unidade')->default('un');
            $table->integer('estoque_minimo')->default(0);
            $table->timestamps();
        });

        Schema::create('componentes_it', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instrucao_trabalho_id')->constrained('instrucoes_trabalho')->onDelete('cascade');
            $table->foreignId('item_estoque_id')->constrained('itens_estoque')->onDelete('restrict');
            $table->float('quantidade')->default(1);
            $table->boolean('obrigatorio')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('componentes_it');
        Schema::dropIfExists('itens_estoque');
        Schema::dropIfExists('passos_it');
        Schema::dropIfExists('instrucoes_trabalho');
    }
};

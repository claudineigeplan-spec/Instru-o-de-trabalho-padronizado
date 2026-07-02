<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── Motivos de Parada ─────────────────────────────────────────────
        Schema::create('motivos_parada', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique();
            $table->string('descricao');
            $table->enum('categoria', ['mecanica', 'operacional', 'clima', 'logistica', 'outros'])->default('outros');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        // ── Programações PCP ──────────────────────────────────────────────
        Schema::create('programacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('equipe_id')->nullable()->constrained('equipes_campo')->nullOnDelete();
            $table->foreignId('lider_id')->nullable()->constrained('colaboradores')->nullOnDelete();
            $table->foreignId('trecho_id')->nullable()->constrained('trechos')->nullOnDelete();
            $table->date('data_programada');
            $table->enum('tipo', ['mensal', 'semanal', 'diario'])->default('diario');
            $table->string('turno')->default('integral'); // manha, tarde, noite, integral
            $table->text('observacoes')->nullable();
            $table->enum('status', [
                'rascunho', 'planejado', 'aprovado', 'em_execucao',
                'executado', 'parcialmente_executado', 'cancelado', 'reprogramado'
            ])->default('rascunho');
            $table->foreignId('criado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('aprovado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('aprovado_em')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Itens da Programação ──────────────────────────────────────────
        Schema::create('programacao_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programacao_id')->constrained('programacoes')->onDelete('cascade');
            $table->foreignId('atividade_id')->constrained('atividades')->onDelete('cascade');
            $table->foreignId('item_contratual_id')->nullable()->constrained('itens_contratuais')->nullOnDelete();
            $table->decimal('quantidade_prevista', 12, 3)->default(0);
            $table->decimal('quantidade_executada', 12, 3)->default(0);
            $table->string('unidade', 20);
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });

        // ── Apontamentos de Produção ──────────────────────────────────────
        Schema::create('apontamentos_producao', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('equipe_id')->nullable()->constrained('equipes_campo')->nullOnDelete();
            $table->foreignId('atividade_id')->constrained('atividades')->onDelete('cascade');
            $table->foreignId('item_contratual_id')->nullable()->constrained('itens_contratuais')->nullOnDelete();
            $table->foreignId('trecho_id')->nullable()->constrained('trechos')->nullOnDelete();
            $table->foreignId('programacao_id')->nullable()->constrained('programacoes')->nullOnDelete();
            $table->foreignId('responsavel_id')->constrained('users')->onDelete('cascade');
            $table->date('data');
            $table->enum('turno', ['manha', 'tarde', 'noite', 'integral'])->default('integral');
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fim')->nullable();
            $table->decimal('km_inicial', 8, 3)->nullable();
            $table->decimal('km_final', 8, 3)->nullable();
            $table->string('sentido')->nullable(); // crescente, decrescente
            $table->string('lado')->nullable(); // direito, esquerdo, ambos
            $table->decimal('quantidade_executada', 12, 3)->default(0);
            $table->string('unidade', 20);
            $table->string('clima')->nullable(); // sol, nublado, chuva
            $table->text('condicao_local')->nullable();
            $table->text('observacoes')->nullable();
            $table->text('interferencias')->nullable();
            $table->enum('status', ['rascunho', 'enviado', 'validado', 'rejeitado'])->default('rascunho');
            $table->foreignId('validado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validado_em')->nullable();
            $table->text('motivo_rejeicao')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Fotos dos Apontamentos ────────────────────────────────────────
        Schema::create('apontamento_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apontamento_id')->constrained('apontamentos_producao')->onDelete('cascade');
            $table->string('path');
            $table->enum('momento', ['antes', 'durante', 'depois'])->default('durante');
            $table->string('descricao')->nullable();
            $table->timestamps();
        });

        // ── Horas de Equipamento ──────────────────────────────────────────
        Schema::create('horas_equipamento', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('equipamento_id')->constrained('equipamentos')->onDelete('cascade');
            $table->foreignId('contrato_id')->nullable()->constrained('contratos')->nullOnDelete();
            $table->foreignId('operador_id')->nullable()->constrained('colaboradores')->nullOnDelete();
            $table->foreignId('apontamento_id')->nullable()->constrained('apontamentos_producao')->nullOnDelete();
            $table->date('data');
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->float('horimetro_inicial')->nullable();
            $table->float('horimetro_final')->nullable();
            $table->float('hodometro_inicial')->nullable();
            $table->float('hodometro_final')->nullable();
            $table->float('horas_produtivas')->default(0);
            $table->float('horas_improdutivas')->default(0);
            $table->float('horas_paradas')->default(0);
            $table->foreignId('motivo_parada_id')->nullable()->constrained('motivos_parada')->nullOnDelete();
            $table->text('observacoes')->nullable();
            $table->enum('status', ['rascunho', 'enviado', 'validado'])->default('rascunho');
            $table->foreignId('registrado_por')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horas_equipamento');
        Schema::dropIfExists('apontamento_fotos');
        Schema::dropIfExists('apontamentos_producao');
        Schema::dropIfExists('programacao_itens');
        Schema::dropIfExists('programacoes');
        Schema::dropIfExists('motivos_parada');
    }
};

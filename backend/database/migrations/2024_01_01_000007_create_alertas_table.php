<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('alertas', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', [
                'manutencao_vencendo', 'manutencao_vencida',
                'checklist_anomalia', 'reposicao_peca',
                'os_aberta', 'os_vencida',
            ]);
            $table->foreignId('equipamento_id')->nullable()->constrained('equipamentos')->onDelete('cascade');
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('referencia_tipo')->nullable();
            $table->text('mensagem');
            $table->json('perfis_destinatarios');
            $table->enum('status', ['novo', 'lido', 'resolvido'])->default('novo');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['status', 'created_at']);
        });

        Schema::create('previsoes_reposicao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipamento_id')->constrained('equipamentos')->onDelete('cascade');
            $table->foreignId('item_estoque_id')->constrained('itens_estoque');
            $table->foreignId('plano_id')->nullable()->constrained('planos_manutencao')->onDelete('set null');
            $table->date('data_prevista');
            $table->float('quantidade')->default(1);
            $table->enum('status', ['pendente', 'solicitado', 'atendido'])->default('pendente');
            $table->boolean('alerta_enviado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('previsoes_reposicao');
        Schema::dropIfExists('alertas');
    }
};

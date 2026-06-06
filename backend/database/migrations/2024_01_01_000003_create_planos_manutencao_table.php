<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('planos_manutencao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipamento_id')->constrained('equipamentos')->onDelete('cascade');
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::create('gatilhos_plano', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_id')->constrained('planos_manutencao')->onDelete('cascade');
            $table->enum('tipo', ['km', 'horas', 'ciclos', 'periodicidade_dias', 'data_fixa']);
            $table->float('valor_intervalo');
            $table->float('ultimo_valor_executado')->default(0);
            $table->date('proxima_data_execucao')->nullable();
            $table->float('antecedencia_alerta')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gatilhos_plano');
        Schema::dropIfExists('planos_manutencao');
    }
};

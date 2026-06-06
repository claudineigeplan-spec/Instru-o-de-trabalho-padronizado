<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('equipamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->enum('tipo', ['veiculo', 'maquina', 'eletrico_hidraulico']);
            $table->string('modelo')->nullable();
            $table->string('fabricante')->nullable();
            $table->year('ano')->nullable();
            $table->string('placa_serie')->nullable();
            $table->string('imagem')->nullable();
            $table->enum('status', ['ativo', 'inativo', 'em_manutencao'])->default('ativo');
            $table->float('hodometro_atual')->default(0);
            $table->float('horimetro_atual')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipamentos');
    }
};

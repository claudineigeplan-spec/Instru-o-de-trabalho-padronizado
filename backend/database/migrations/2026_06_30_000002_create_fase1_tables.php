<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── Empresas ──────────────────────────────────────────────────────
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('razao_social');
            $table->string('nome_fantasia')->nullable();
            $table->string('cnpj', 18)->unique()->nullable();
            $table->string('endereco')->nullable();
            $table->string('cidade')->nullable();
            $table->string('uf', 2)->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Centros de Custo ──────────────────────────────────────────────
        Schema::create('centros_custo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->string('codigo', 20)->unique();
            $table->string('nome');
            $table->string('descricao')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Contratos ─────────────────────────────────────────────────────
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('centro_custo_id')->nullable()->constrained('centros_custo')->nullOnDelete();
            $table->string('numero', 50)->unique();
            $table->string('objeto');
            $table->string('cliente');
            $table->string('orgao_contratante')->nullable();
            $table->string('tipo')->default('conserva'); // conserva, obra, terraplenagem, pavimentacao
            $table->date('data_inicio');
            $table->date('data_fim');
            $table->decimal('valor_inicial', 15, 2)->default(0);
            $table->decimal('valor_atualizado', 15, 2)->default(0);
            $table->enum('status', ['ativo', 'suspenso', 'encerrado', 'cancelado'])->default('ativo');
            $table->text('observacoes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Rodovias ──────────────────────────────────────────────────────
        Schema::create('rodovias', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20); // SP-310, SP-127, etc.
            $table->string('nome');
            $table->string('municipio')->nullable();
            $table->string('uf', 2)->default('SP');
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Trechos ───────────────────────────────────────────────────────
        Schema::create('trechos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('rodovia_id')->nullable()->constrained('rodovias')->nullOnDelete();
            $table->string('descricao');
            $table->decimal('km_inicial', 8, 3)->nullable();
            $table->decimal('km_final', 8, 3)->nullable();
            $table->string('municipio')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Atividades ────────────────────────────────────────────────────
        Schema::create('atividades', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->string('nome');
            $table->string('categoria'); // pavimentacao, terraplenagem, drenagem, sinalizacao, manutencao
            $table->string('unidade_medida', 20); // m², m³, m, un, h, km
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Itens Contratuais ─────────────────────────────────────────────
        Schema::create('itens_contratuais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('atividade_id')->nullable()->constrained('atividades')->nullOnDelete();
            $table->string('codigo_item', 20);
            $table->string('descricao');
            $table->string('unidade', 20);
            $table->decimal('quantidade_contratada', 12, 3)->default(0);
            $table->decimal('quantidade_medida', 12, 3)->default(0);
            $table->decimal('preco_unitario', 10, 4)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Colaboradores ─────────────────────────────────────────────────
        Schema::create('colaboradores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('matricula', 20)->unique()->nullable();
            $table->string('nome');
            $table->string('cpf', 14)->unique()->nullable();
            $table->string('funcao');
            $table->string('cargo')->nullable();
            $table->string('setor')->nullable();
            $table->date('data_admissao')->nullable();
            $table->enum('vinculo', ['clt', 'pj', 'terceirizado', 'estagio'])->default('clt');
            $table->enum('status', ['ativo', 'afastado', 'ferias', 'demitido'])->default('ativo');
            $table->string('telefone')->nullable();
            $table->string('cnh_categoria')->nullable();
            $table->date('cnh_validade')->nullable();
            $table->date('aso_validade')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Equipes de Campo ──────────────────────────────────────────────
        Schema::create('equipes_campo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('contrato_id')->nullable()->constrained('contratos')->nullOnDelete();
            $table->foreignId('lider_id')->nullable()->constrained('colaboradores')->nullOnDelete();
            $table->string('nome');
            $table->string('tipo'); // pavimentacao, terraplanagem, drenagem, conserva, manutencao
            $table->boolean('ativo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Membros de Equipe ─────────────────────────────────────────────
        Schema::create('equipe_colaborador', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipe_id')->constrained('equipes_campo')->onDelete('cascade');
            $table->foreignId('colaborador_id')->constrained('colaboradores')->onDelete('cascade');
            $table->string('funcao_na_equipe')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipe_colaborador');
        Schema::dropIfExists('equipes_campo');
        Schema::dropIfExists('colaboradores');
        Schema::dropIfExists('itens_contratuais');
        Schema::dropIfExists('atividades');
        Schema::dropIfExists('trechos');
        Schema::dropIfExists('rodovias');
        Schema::dropIfExists('contratos');
        Schema::dropIfExists('centros_custo');
        Schema::dropIfExists('empresas');
    }
};

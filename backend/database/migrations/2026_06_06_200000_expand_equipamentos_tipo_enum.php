<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE equipamentos MODIFY tipo ENUM(
            'veiculo_leve',
            'caminhao',
            'maquina_pesada',
            'utilitario',
            'reboque',
            'veiculo',
            'maquina',
            'eletrico_hidraulico'
        ) NOT NULL DEFAULT 'caminhao'");

        DB::statement("ALTER TABLE modelos_checklist MODIFY tipo_equipamento ENUM(
            'veiculo_leve',
            'caminhao',
            'maquina_pesada',
            'utilitario',
            'reboque',
            'veiculo',
            'maquina',
            'eletrico_hidraulico'
        ) NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE equipamentos MODIFY tipo ENUM(
            'veiculo',
            'maquina',
            'eletrico_hidraulico'
        ) NOT NULL DEFAULT 'veiculo'");

        DB::statement("ALTER TABLE modelos_checklist MODIFY tipo_equipamento ENUM(
            'veiculo',
            'maquina',
            'eletrico_hidraulico'
        ) NULL");
    }
};

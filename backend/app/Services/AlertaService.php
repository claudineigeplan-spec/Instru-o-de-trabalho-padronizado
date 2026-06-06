<?php

namespace App\Services;

use App\Models\Alerta;
use App\Models\Equipamento;
use App\Models\GatilhoPlano;
use App\Models\ExecucaoChecklist;
use App\Models\OrdemServico;
use Carbon\Carbon;

class AlertaService
{
    public function processarAlertasDiarios(): void
    {
        $equipamentos = Equipamento::where('status', 'ativo')
            ->with(['planosManutencao' => fn($q) => $q->where('ativo', true)->with('gatilhos')])
            ->get();

        foreach ($equipamentos as $equipamento) {
            foreach ($equipamento->planosManutencao as $plano) {
                foreach ($plano->gatilhos as $gatilho) {
                    $this->verificarGatilho($equipamento, $plano, $gatilho);
                }
            }
        }

        $this->verificarOsVencidas();
    }

    private function verificarGatilho(Equipamento $equipamento, $plano, GatilhoPlano $gatilho): void
    {
        $alertaExistente = Alerta::where('referencia_id', $gatilho->id)
            ->where('referencia_tipo', GatilhoPlano::class)
            ->where('status', 'novo')
            ->exists();

        if ($alertaExistente) {
            return;
        }

        $vencido = false;
        $vencendo = false;

        switch ($gatilho->tipo) {
            case 'km':
                $valorAtual = $equipamento->hodometro_atual;
                $limiteAlerta = $gatilho->valorAlerta();
                $limiteVencimento = $gatilho->proximoValor();
                $vencido = $valorAtual >= $limiteVencimento;
                $vencendo = !$vencido && $valorAtual >= $limiteAlerta;
                break;

            case 'horas':
                $valorAtual = $equipamento->horimetro_atual;
                $limiteAlerta = $gatilho->valorAlerta();
                $limiteVencimento = $gatilho->proximoValor();
                $vencido = $valorAtual >= $limiteVencimento;
                $vencendo = !$vencido && $valorAtual >= $limiteAlerta;
                break;

            case 'periodicidade_dias':
            case 'data_fixa':
                if ($gatilho->proxima_data_execucao) {
                    $dataVencimento = Carbon::parse($gatilho->proxima_data_execucao);
                    $dataAlerta = $dataVencimento->copy()->subDays($gatilho->antecedencia_alerta ?? 0);
                    $vencido = now()->greaterThanOrEqualTo($dataVencimento);
                    $vencendo = !$vencido && now()->greaterThanOrEqualTo($dataAlerta);
                }
                break;
        }

        if ($vencido) {
            $this->criarAlerta(
                'manutencao_vencida',
                $equipamento->id,
                $gatilho->id,
                GatilhoPlano::class,
                "Manutenção VENCIDA: {$plano->nome} — {$equipamento->nome}",
                ['lider_campo', 'mecanico']
            );
        } elseif ($vencendo) {
            $this->criarAlerta(
                'manutencao_vencendo',
                $equipamento->id,
                $gatilho->id,
                GatilhoPlano::class,
                "Manutenção próxima do vencimento: {$plano->nome} — {$equipamento->nome}",
                ['lider_campo', 'mecanico']
            );
        }
    }

    private function verificarOsVencidas(): void
    {
        $osVencidas = OrdemServico::whereNotIn('status', ['concluida', 'cancelada'])
            ->whereNotNull('data_prevista')
            ->where('data_prevista', '<', now())
            ->whereNotExists(fn($q) => $q->from('alertas')
                ->where('tipo', 'os_vencida')
                ->whereColumn('referencia_id', 'ordens_servico.id')
                ->where('status', 'novo'))
            ->get();

        foreach ($osVencidas as $os) {
            $this->criarAlerta(
                'os_vencida',
                $os->equipamento_id,
                $os->id,
                OrdemServico::class,
                "OS #{$os->codigo} vencida: {$os->titulo}",
                ['lider_campo']
            );
        }
    }

    public function criarAlertaOsAtribuida(\App\Models\OrdemServico $os): void
    {
        $this->criarAlerta(
            'os_aberta',
            $os->equipamento_id,
            $os->id,
            \App\Models\OrdemServico::class,
            "Ordem #{$os->codigo} atribuída a você: {$os->titulo} — " . ($os->equipamento->nome ?? ''),
            ['mecanico']
        );
    }

    public function criarAlertaStatusOS(\App\Models\OrdemServico $os, string $novoStatus): void
    {
        $mensagens = [
            'aprovada'    => "Ordem #{$os->codigo} aprovada: {$os->titulo}",
            'em_andamento'=> "Ordem #{$os->codigo} em andamento: {$os->titulo}",
            'concluida'   => "Ordem #{$os->codigo} concluída: {$os->titulo}",
            'cancelada'   => "Ordem #{$os->codigo} cancelada: {$os->titulo}",
        ];

        $perfis = match ($novoStatus) {
            'aprovada'     => ['mecanico'],
            'em_andamento' => ['lider_campo'],
            'concluida'    => ['gestor', 'lider_campo'],
            'cancelada'    => ['gestor', 'lider_campo'],
            default        => [],
        };

        if (empty($perfis)) {
            return;
        }

        $this->criarAlerta(
            'os_aberta',
            $os->equipamento_id,
            $os->id,
            \App\Models\OrdemServico::class,
            $mensagens[$novoStatus] ?? "OS #{$os->codigo} atualizada",
            $perfis
        );
    }

    public function criarAlertaChecklistAnomalia(ExecucaoChecklist $execucao): void
    {
        $this->criarAlerta(
            'checklist_anomalia',
            $execucao->equipamento_id,
            $execucao->id,
            ExecucaoChecklist::class,
            "Anomalia no checklist de {$execucao->equipamento->nome} — verificar OS corretiva.",
            ['lider_campo', 'mecanico']
        );
    }

    private function criarAlerta(
        string $tipo,
        ?int $equipamentoId,
        ?int $referenciaId,
        ?string $referenciaTipo,
        string $mensagem,
        array $perfis
    ): void {
        Alerta::create([
            'tipo' => $tipo,
            'equipamento_id' => $equipamentoId,
            'referencia_id' => $referenciaId,
            'referencia_tipo' => $referenciaTipo,
            'mensagem' => $mensagem,
            'perfis_destinatarios' => $perfis,
            'status' => 'novo',
        ]);
    }
}

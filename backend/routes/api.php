<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EquipamentoController;
use App\Http\Controllers\PlanoManutencaoController;
use App\Http\Controllers\GatilhoPlanoController;
use App\Http\Controllers\InstrucaoTrabalhoController;
use App\Http\Controllers\PassoItController;
use App\Http\Controllers\ModeloChecklistController;
use App\Http\Controllers\ItemChecklistController;
use App\Http\Controllers\ExecucaoChecklistController;
use App\Http\Controllers\OrdemServicoController;
use App\Http\Controllers\AlertaController;
use App\Http\Controllers\ItemEstoqueController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RelatorioController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Mecânicos disponíveis para atribuição de OS
    Route::get('/mecanicos', fn() => response()->json(
        \App\Models\User::where('role', 'mecanico')->where('ativo', true)
            ->orderBy('name')->get(['id', 'name'])
    ));

    // Equipamentos — leitura: todos; escrita: gestor/lider_campo
    Route::get('equipamentos', [EquipamentoController::class, 'index']);
    Route::get('equipamentos/{equipamento}', [EquipamentoController::class, 'show']);
    Route::get('equipamentos/{equipamento}/historico', [EquipamentoController::class, 'historico']);
    Route::get('equipamentos/{equipamento}/checklist-hoje', [ExecucaoChecklistController::class, 'hoje']);
    Route::get('equipamentos/{equipamento}/qrcode', [EquipamentoController::class, 'qrcode']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::post('equipamentos', [EquipamentoController::class, 'store']);
        Route::put('equipamentos/{equipamento}', [EquipamentoController::class, 'update']);
        Route::delete('equipamentos/{equipamento}', [EquipamentoController::class, 'destroy']);
        Route::post('equipamentos/{equipamento}/uso', [EquipamentoController::class, 'registrarUso']);
    });

    // Planos de manutenção — leitura: todos; escrita: gestor/lider_campo
    Route::get('planos', [PlanoManutencaoController::class, 'index']);
    Route::get('planos/{plano}', [PlanoManutencaoController::class, 'show']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::post('planos', [PlanoManutencaoController::class, 'store']);
        Route::put('planos/{plano}', [PlanoManutencaoController::class, 'update']);
        Route::delete('planos/{plano}', [PlanoManutencaoController::class, 'destroy']);
        Route::apiResource('planos.gatilhos', GatilhoPlanoController::class)->shallow()->except(['index', 'show']);
    });
    Route::get('planos/{plano}/gatilhos', [GatilhoPlanoController::class, 'index']);

    // Instruções de trabalho — leitura: todos; escrita: gestor/lider_campo
    Route::get('instrucoes', [InstrucaoTrabalhoController::class, 'index']);
    Route::get('instrucoes/{instrucao}', [InstrucaoTrabalhoController::class, 'show']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::post('instrucoes', [InstrucaoTrabalhoController::class, 'store']);
        Route::put('instrucoes/{instrucao}', [InstrucaoTrabalhoController::class, 'update']);
        Route::delete('instrucoes/{instrucao}', [InstrucaoTrabalhoController::class, 'destroy']);
        Route::apiResource('instrucoes.passos', PassoItController::class)->shallow()->except(['index', 'show']);
        Route::put('instrucoes/{instrucao}/passos/reordenar', [PassoItController::class, 'reordenar']);
    });
    Route::get('instrucoes/{instrucao}/passos', [PassoItController::class, 'index']);

    // Modelos de checklist — leitura: todos; escrita: gestor
    Route::get('modelos-checklist', [ModeloChecklistController::class, 'index']);
    Route::get('modelos-checklist/{modeloChecklist}', [ModeloChecklistController::class, 'show']);
    Route::middleware('role:gestor')->group(function () {
        Route::post('modelos-checklist', [ModeloChecklistController::class, 'store']);
        Route::put('modelos-checklist/{modeloChecklist}', [ModeloChecklistController::class, 'update']);
        Route::delete('modelos-checklist/{modeloChecklist}', [ModeloChecklistController::class, 'destroy']);
        Route::apiResource('modelos-checklist.itens', ItemChecklistController::class)->shallow()->except(['index', 'show']);
    });

    // Checklists — execução: todos; histórico: todos
    Route::post('checklists/executar', [ExecucaoChecklistController::class, 'store']);
    Route::get('checklists', [ExecucaoChecklistController::class, 'index']);
    Route::get('checklists/{execucao}', [ExecucaoChecklistController::class, 'show']);

    // Ordens de serviço
    Route::get('ordens-servico', [OrdemServicoController::class, 'index']);
    Route::get('ordens-servico/{os}', [OrdemServicoController::class, 'show']);
    Route::post('ordens-servico', [OrdemServicoController::class, 'store']);
    Route::put('ordens-servico/{os}', [OrdemServicoController::class, 'update']);
    Route::put('ordens-servico/{os}/status', [OrdemServicoController::class, 'atualizarStatus']);
    Route::put('ordens-servico/{os}/passos/{passo}', [OrdemServicoController::class, 'concluirPasso']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::delete('ordens-servico/{os}', [OrdemServicoController::class, 'destroy']);
    });

    // Alertas
    Route::get('alertas', [AlertaController::class, 'index']);
    Route::put('alertas/{alerta}/lido', [AlertaController::class, 'marcarLido']);
    Route::put('alertas/marcar-todos-lidos', [AlertaController::class, 'marcarTodosLidos']);

    // Estoque — leitura: todos; escrita: gestor/lider_campo
    Route::get('estoque', [ItemEstoqueController::class, 'index']);
    Route::get('estoque/{estoque}', [ItemEstoqueController::class, 'show']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::post('estoque', [ItemEstoqueController::class, 'store']);
        Route::put('estoque/{estoque}', [ItemEstoqueController::class, 'update']);
        Route::delete('estoque/{estoque}', [ItemEstoqueController::class, 'destroy']);
    });

    // Gestão administrativa — apenas gestor
    Route::middleware('role:gestor')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::get('relatorios', [RelatorioController::class, 'index']);
    });
});

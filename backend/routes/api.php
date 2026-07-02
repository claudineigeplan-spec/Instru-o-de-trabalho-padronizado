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
use App\Http\Controllers\ContratosController;
use App\Http\Controllers\ColaboradoresController;
use App\Http\Controllers\EquipesController;
use App\Http\Controllers\ApontamentosController;
use App\Http\Controllers\HorasEquipamentoController;
use App\Http\Controllers\ProgramacoesController;
use App\Http\Controllers\CentrosCustoController;
use App\Http\Controllers\RodoviasController;
use App\Http\Controllers\AtividadesController;

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

    // Motivos de parada — catálogo de leitura para horas de equipamento
    Route::get('/motivos-parada', fn() => response()->json(
        \App\Models\MotivoParada::where('ativo', true)->orderBy('descricao')->get()
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

    /* ── Fase 1 / 2 ───────────────────────────────────────────────────────── */

    // Atividades — catálogo de serviços
    Route::get('atividades', [AtividadesController::class, 'index']);
    Route::get('atividades/{atividade}', [AtividadesController::class, 'show']);
    Route::middleware('role:gestor,lider_campo,engenheiro,pcp')->group(function () {
        Route::post('atividades', [AtividadesController::class, 'store']);
        Route::put('atividades/{atividade}', [AtividadesController::class, 'update']);
        Route::delete('atividades/{atividade}', [AtividadesController::class, 'destroy']);
    });

    // Rodovias e trechos
    Route::get('rodovias', [RodoviasController::class, 'index']);
    Route::get('rodovias/{rodovia}', [RodoviasController::class, 'show']);
    Route::get('rodovias/{rodovia}/trechos', [RodoviasController::class, 'trechos']);
    Route::middleware('role:gestor,engenheiro')->group(function () {
        Route::post('rodovias', [RodoviasController::class, 'store']);
        Route::put('rodovias/{rodovia}', [RodoviasController::class, 'update']);
        Route::delete('rodovias/{rodovia}', [RodoviasController::class, 'destroy']);
        Route::post('rodovias/{rodovia}/trechos', [RodoviasController::class, 'storeTrecho']);
        Route::put('rodovias/{rodovia}/trechos/{trecho}', [RodoviasController::class, 'updateTrecho']);
        Route::delete('rodovias/{rodovia}/trechos/{trecho}', [RodoviasController::class, 'destroyTrecho']);
    });

    // Centros de custo
    Route::get('centros-custo', [CentrosCustoController::class, 'index']);
    Route::get('centros-custo/{centroCusto}', [CentrosCustoController::class, 'show']);
    Route::middleware('role:gestor,financeiro')->group(function () {
        Route::post('centros-custo', [CentrosCustoController::class, 'store']);
        Route::put('centros-custo/{centroCusto}', [CentrosCustoController::class, 'update']);
        Route::delete('centros-custo/{centroCusto}', [CentrosCustoController::class, 'destroy']);
    });

    // Contratos e itens contratuais
    Route::get('contratos', [ContratosController::class, 'index']);
    Route::get('contratos/{contrato}', [ContratosController::class, 'show']);
    Route::get('contratos/{contrato}/itens', [ContratosController::class, 'itens']);
    Route::middleware('role:gestor,financeiro,engenheiro')->group(function () {
        Route::post('contratos', [ContratosController::class, 'store']);
        Route::put('contratos/{contrato}', [ContratosController::class, 'update']);
        Route::delete('contratos/{contrato}', [ContratosController::class, 'destroy']);
        Route::post('contratos/{contrato}/itens', [ContratosController::class, 'storeItem']);
        Route::put('contratos/{contrato}/itens/{item}', [ContratosController::class, 'updateItem']);
        Route::delete('contratos/{contrato}/itens/{item}', [ContratosController::class, 'destroyItem']);
    });

    // Colaboradores
    Route::get('colaboradores', [ColaboradoresController::class, 'index']);
    Route::get('colaboradores/{colaborador}', [ColaboradoresController::class, 'show']);
    Route::middleware('role:gestor,rh,lider_campo')->group(function () {
        Route::post('colaboradores', [ColaboradoresController::class, 'store']);
        Route::put('colaboradores/{colaborador}', [ColaboradoresController::class, 'update']);
        Route::delete('colaboradores/{colaborador}', [ColaboradoresController::class, 'destroy']);
    });

    // Equipes de campo
    Route::get('equipes', [EquipesController::class, 'index']);
    Route::get('equipes/{equipe}', [EquipesController::class, 'show']);
    Route::middleware('role:gestor,lider_campo')->group(function () {
        Route::post('equipes', [EquipesController::class, 'store']);
        Route::put('equipes/{equipe}', [EquipesController::class, 'update']);
        Route::delete('equipes/{equipe}', [EquipesController::class, 'destroy']);
        Route::post('equipes/{equipe}/membros', [EquipesController::class, 'adicionarMembro']);
        Route::delete('equipes/{equipe}/membros/{colaboradorId}', [EquipesController::class, 'removerMembro']);
    });

    // Apontamentos de produção
    Route::get('apontamentos', [ApontamentosController::class, 'index']);
    Route::get('apontamentos/{apontamento}', [ApontamentosController::class, 'show']);
    Route::post('apontamentos', [ApontamentosController::class, 'store']);
    Route::put('apontamentos/{apontamento}', [ApontamentosController::class, 'update']);
    Route::post('apontamentos/{apontamento}/enviar', [ApontamentosController::class, 'enviar']);
    Route::middleware('role:gestor,lider_campo,engenheiro,pcp')->group(function () {
        Route::post('apontamentos/{apontamento}/validar', [ApontamentosController::class, 'validar']);
        Route::post('apontamentos/{apontamento}/rejeitar', [ApontamentosController::class, 'rejeitar']);
        Route::delete('apontamentos/{apontamento}', [ApontamentosController::class, 'destroy']);
    });

    // Horas de equipamento
    Route::get('horas-equipamento', [HorasEquipamentoController::class, 'index']);
    Route::get('horas-equipamento/{horasEquipamento}', [HorasEquipamentoController::class, 'show']);
    Route::post('horas-equipamento', [HorasEquipamentoController::class, 'store']);
    Route::put('horas-equipamento/{horasEquipamento}', [HorasEquipamentoController::class, 'update']);
    Route::post('horas-equipamento/{horasEquipamento}/enviar', [HorasEquipamentoController::class, 'enviar']);
    Route::middleware('role:gestor,lider_campo,pcp')->group(function () {
        Route::post('horas-equipamento/{horasEquipamento}/validar', [HorasEquipamentoController::class, 'validar']);
        Route::delete('horas-equipamento/{horasEquipamento}', [HorasEquipamentoController::class, 'destroy']);
    });

    // Programações semanais (PCP)
    Route::get('programacoes', [ProgramacoesController::class, 'index']);
    Route::get('programacoes/{programacao}', [ProgramacoesController::class, 'show']);
    Route::middleware('role:gestor,lider_campo,pcp,engenheiro')->group(function () {
        Route::post('programacoes', [ProgramacoesController::class, 'store']);
        Route::put('programacoes/{programacao}', [ProgramacoesController::class, 'update']);
        Route::delete('programacoes/{programacao}', [ProgramacoesController::class, 'destroy']);
        Route::post('programacoes/{programacao}/itens', [ProgramacoesController::class, 'storeItem']);
        Route::put('programacoes/{programacao}/itens/{item}', [ProgramacoesController::class, 'updateItem']);
        Route::delete('programacoes/{programacao}/itens/{item}', [ProgramacoesController::class, 'destroyItem']);
    });
});

// ─── Perfis ───────────────────────────────────────────────────────────────────
export type Role =
  | "gestor"
  | "lider_campo"
  | "mecanico"
  | "operador"
  | "diretor"
  | "engenheiro"
  | "pcp"
  | "apontador"
  | "encarregado"
  | "motorista"
  | "almoxarife"
  | "comprador"
  | "rh"
  | "qualidade"
  | "seguranca_trabalho"
  | "financeiro"
  | "visitante_consulta";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  setor: string | null;
  ativo: boolean;
}

// ─── Empresa / Estrutura ──────────────────────────────────────────────────────
export interface Empresa {
  id: number;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export interface CentroCusto {
  id: number;
  empresa_id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export type StatusContrato = "ativo" | "suspenso" | "encerrado" | "cancelado";
export type TipoContrato =
  "conserva" | "obra" | "terraplenagem" | "pavimentacao" | "outros";

export interface Contrato {
  id: number;
  empresa_id: number;
  centro_custo_id: number | null;
  numero: string;
  objeto: string;
  cliente: string;
  orgao_contratante: string | null;
  tipo: TipoContrato;
  data_inicio: string;
  data_fim: string;
  valor_inicial: number;
  valor_atualizado: number;
  status: StatusContrato;
  observacoes: string | null;
  empresa?: Pick<Empresa, "id" | "nome_fantasia" | "razao_social">;
  centro_custo?: Pick<CentroCusto, "id" | "codigo" | "nome">;
  itens_contratuais?: ItemContratual[];
}

export interface Rodovia {
  id: number;
  codigo: string;
  nome: string;
  municipio: string | null;
  uf: string;
  trechos_count?: number;
  trechos?: Trecho[];
}

export interface Trecho {
  id: number;
  contrato_id: number;
  rodovia_id: number | null;
  descricao: string;
  km_inicial: number | null;
  km_final: number | null;
  municipio: string | null;
  ativo: boolean;
  rodovia?: Pick<Rodovia, "id" | "codigo" | "nome">;
  contrato?: Pick<Contrato, "id" | "numero">;
}

export interface Atividade {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  ativo: boolean;
}

export interface ItemContratual {
  id: number;
  contrato_id: number;
  atividade_id: number | null;
  codigo_item: string;
  descricao: string;
  unidade: string;
  quantidade_contratada: number;
  quantidade_medida: number;
  preco_unitario: number;
  saldo?: number;
  valor_medido?: number;
  atividade?: Pick<Atividade, "id" | "codigo" | "nome">;
}

// ─── Colaboradores / Equipes ──────────────────────────────────────────────────
export type StatusColaborador = "ativo" | "afastado" | "ferias" | "demitido";
export type VinculoColaborador = "clt" | "pj" | "terceirizado" | "estagio";

export interface Colaborador {
  id: number;
  empresa_id: number;
  user_id: number | null;
  matricula: string | null;
  nome: string;
  cpf: string | null;
  funcao: string;
  cargo: string | null;
  setor: string | null;
  data_admissao: string | null;
  vinculo: VinculoColaborador;
  status: StatusColaborador;
  telefone: string | null;
  cnh_categoria: string | null;
  cnh_validade: string | null;
  aso_validade: string | null;
  equipes?: Pick<EquipeCampo, "id" | "nome">[];
}

export interface EquipeCampo {
  id: number;
  empresa_id: number;
  contrato_id: number | null;
  lider_id: number | null;
  nome: string;
  tipo: string;
  ativo: boolean;
  lider?: Pick<Colaborador, "id" | "nome">;
  contrato?: Pick<Contrato, "id" | "numero" | "objeto">;
  colaboradores?: (Colaborador & {
    pivot: { funcao_na_equipe: string | null; ativo: boolean };
  })[];
}

// ─── PCP / Programação ────────────────────────────────────────────────────────
export type StatusProgramacao =
  | "rascunho"
  | "planejado"
  | "aprovado"
  | "em_execucao"
  | "executado"
  | "parcialmente_executado"
  | "cancelado"
  | "reprogramado";

export interface ProgramacaoItem {
  id: number;
  programacao_id: number;
  atividade_id: number;
  item_contratual_id: number | null;
  quantidade_prevista: number;
  quantidade_executada: number;
  unidade: string;
  observacoes: string | null;
  atividade?: Pick<Atividade, "id" | "codigo" | "nome">;
}

export interface Programacao {
  id: number;
  contrato_id: number;
  equipe_id: number | null;
  lider_id: number | null;
  trecho_id: number | null;
  data_programada: string;
  tipo: "mensal" | "semanal" | "diario";
  turno: string;
  observacoes: string | null;
  status: StatusProgramacao;
  criado_por: number | null;
  aprovado_por: number | null;
  aprovado_em: string | null;
  contrato?: Pick<Contrato, "id" | "numero" | "objeto">;
  equipe?: Pick<EquipeCampo, "id" | "nome">;
  itens?: ProgramacaoItem[];
}

// ─── Apontamento de Produção ──────────────────────────────────────────────────
export type StatusApontamento =
  "rascunho" | "enviado" | "validado" | "rejeitado";
export type TurnoTrabalho = "manha" | "tarde" | "noite" | "integral";

export interface ApontamentoProducao {
  id: number;
  codigo: string;
  contrato_id: number;
  equipe_id: number | null;
  atividade_id: number;
  item_contratual_id: number | null;
  trecho_id: number | null;
  programacao_id: number | null;
  responsavel_id: number;
  data: string;
  turno: TurnoTrabalho;
  hora_inicio: string | null;
  hora_fim: string | null;
  km_inicial: number | null;
  km_final: number | null;
  sentido: string | null;
  lado: string | null;
  quantidade_executada: number;
  unidade: string;
  clima: string | null;
  condicao_local: string | null;
  observacoes: string | null;
  interferencias: string | null;
  status: StatusApontamento;
  validado_por: number | null;
  validado_em: string | null;
  motivo_rejeicao: string | null;
  contrato?: Pick<Contrato, "id" | "numero">;
  equipe?: Pick<EquipeCampo, "id" | "nome">;
  atividade?: Pick<Atividade, "id" | "codigo" | "nome" | "unidade_medida">;
  responsavel?: Pick<User, "id" | "name">;
}

// ─── Horas de Equipamento ─────────────────────────────────────────────────────
export interface MotivoParada {
  id: number;
  codigo: string;
  descricao: string;
  categoria: "mecanica" | "operacional" | "clima" | "logistica" | "outros";
  ativo: boolean;
}

export interface HorasEquipamento {
  id: number;
  codigo: string;
  equipamento_id: number;
  contrato_id: number | null;
  operador_id: number | null;
  apontamento_id: number | null;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  horimetro_inicial: number | null;
  horimetro_final: number | null;
  hodometro_inicial: number | null;
  hodometro_final: number | null;
  horas_produtivas: number;
  horas_improdutivas: number;
  horas_paradas: number;
  motivo_parada_id: number | null;
  observacoes: string | null;
  status: "rascunho" | "enviado" | "validado";
  registrado_por: number;
  equipamento?: Pick<Equipamento, "id" | "nome" | "tipo">;
  operador?: Pick<Colaborador, "id" | "nome">;
  motivo_parada?: Pick<MotivoParada, "id" | "descricao">;
}

// ─── Equipamentos ─────────────────────────────────────────────────────────────
export type TipoEquipamento =
  | "veiculo_leve"
  | "caminhao"
  | "maquina_pesada"
  | "utilitario"
  | "reboque"
  | "veiculo"
  | "maquina"
  | "eletrico_hidraulico";
export type StatusEquipamento = "ativo" | "inativo" | "em_manutencao";

export interface Equipamento {
  id: number;
  nome: string;
  tipo: TipoEquipamento;
  modelo: string | null;
  fabricante: string | null;
  ano: number | null;
  placa_serie: string | null;
  imagem: string | null;
  status: StatusEquipamento;
  hodometro_atual: number;
  horimetro_atual: number;
  created_at: string;
  updated_at: string;
}

// ─── Manutenção ───────────────────────────────────────────────────────────────
export interface GatilhoPlano {
  id: number;
  plano_id: number;
  tipo: "km" | "horas" | "ciclos" | "periodicidade_dias" | "data_fixa";
  valor_intervalo: number;
  ultimo_valor_executado: number;
  proxima_data_execucao: string | null;
  antecedencia_alerta: number;
}

export interface PlanoManutencao {
  id: number;
  equipamento_id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  gatilhos: GatilhoPlano[];
  equipamento?: Pick<Equipamento, "id" | "nome">;
}

export interface PassoIt {
  id: number;
  instrucao_trabalho_id: number;
  ordem: number;
  titulo: string;
  descricao: string | null;
  imagem: string | null;
  alerta_seguranca: string | null;
}

export type TipoIT = "preventiva" | "corretiva" | "preditiva" | "inspecao";
export type StatusIT = "rascunho" | "publicada" | "arquivada";

export interface InstrucaoTrabalho {
  id: number;
  plano_manutencao_id: number | null;
  titulo: string;
  descricao: string | null;
  tempo_estimado_min: number;
  tipo: TipoIT;
  prioridade: PrioridadeOS;
  responsavel: string | null;
  status: StatusIT;
  passos: PassoIt[];
}

export interface ItemChecklist {
  id: number;
  modelo_id: number;
  descricao: string;
  tipo_resposta: "ok_nok" | "valor_numerico" | "texto";
  critico: boolean;
  ordem: number;
}

export interface ModeloChecklist {
  id: number;
  nome: string;
  equipamento_id: number | null;
  tipo_equipamento: TipoEquipamento | null;
  periodicidade: "diario" | "semanal" | "mensal";
  ativo: boolean;
  itens: ItemChecklist[];
  equipamento?: Pick<Equipamento, "id" | "nome">;
}

export type StatusOS =
  | "aberta"
  | "triagem"
  | "aprovada"
  | "aguardando_pecas"
  | "em_andamento"
  | "pausada"
  | "concluida"
  | "cancelada";
export type PrioridadeOS = "baixa" | "media" | "alta" | "urgente";

export interface PassoExecutado {
  id: number;
  execucao_os_id: number;
  passo_id: number;
  concluido: boolean;
  observacao: string | null;
  passo?: PassoIt;
}

export interface ExecucaoOs {
  id: number;
  os_id: number;
  instrucao_trabalho_id: number;
  instrucao?: InstrucaoTrabalho;
  passosExecutados?: PassoExecutado[];
}

export interface OrdemServico {
  id: number;
  codigo: string;
  equipamento_id: number;
  plano_id: number | null;
  tipo: "preventiva" | "corretiva" | "preditiva";
  titulo: string;
  descricao: string | null;
  prioridade: PrioridadeOS;
  status: StatusOS;
  solicitante_id: number;
  tecnico_id: number | null;
  supervisor_id: number | null;
  data_abertura: string;
  data_prevista: string | null;
  data_conclusao: string | null;
  km_execucao: number | null;
  horas_execucao: number | null;
  equipamento?: Pick<Equipamento, "id" | "nome" | "tipo">;
  tecnico?: Pick<User, "id" | "name">;
  solicitante?: Pick<User, "id" | "name">;
  execucoes?: ExecucaoOs[];
}

// ─── Alertas / Estoque ────────────────────────────────────────────────────────
export type TipoAlerta =
  | "manutencao_vencendo"
  | "manutencao_vencida"
  | "checklist_anomalia"
  | "reposicao_peca"
  | "os_aberta"
  | "os_vencida";

export interface Alerta {
  id: number;
  tipo: TipoAlerta;
  equipamento_id: number | null;
  mensagem: string;
  perfis_destinatarios: Role[];
  status: "novo" | "lido" | "resolvido";
  created_at: string;
  equipamento?: Pick<Equipamento, "id" | "nome">;
}

export interface ItemEstoque {
  id: number;
  codigo: string;
  nome: string;
  tipo: "peca" | "oleo" | "filtro" | "outros";
  unidade: string;
  estoque_minimo: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  equipamentos: {
    total: number;
    ativos: number;
    em_manutencao: number;
    inativos: number;
  };
  ordens: {
    abertas: number;
    em_andamento: number;
    concluidas_mes: number;
    vencidas: number;
  };
  alertas_count: number;
  checklists_hoje: number;
  os_recentes: OrdemServico[];
  alertas_recentes: Alerta[];
}

// ─── Paginação ────────────────────────────────────────────────────────────────
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type Role = "gestor" | "lider_campo" | "mecanico" | "operador";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  setor: string | null;
  ativo: boolean;
}

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
  "aberta" | "aprovada" | "em_andamento" | "concluida" | "cancelada";
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

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTipoEquipamento(tipo: string): string {
  const map: Record<string, string> = {
    veiculo_leve: "Veículo Leve",
    caminhao: "Caminhão",
    maquina_pesada: "Máquina Pesada",
    utilitario: "Utilitário",
    reboque: "Reboque",
    veiculo: "Veículo",
    maquina: "Máquina",
    eletrico_hidraulico: "Elétrico/Hidráulico",
  };
  return map[tipo] ?? tipo;
}

export function formatRole(role: string): string {
  const map: Record<string, string> = {
    gestor: "Gestor / Diretoria",
    lider_campo: "Gestão / PCP",
    mecanico: "Mecânico",
    operador: "Operador / Motorista",
  };
  return map[role] ?? role;
}

export function formatStatusOS(status: string): string {
  const map: Record<string, string> = {
    aberta: "Aberta",
    aprovada: "Aprovada",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };
  return map[status] ?? status;
}

export function formatPrioridade(prioridade: string): string {
  const map: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };
  return map[prioridade] ?? prioridade;
}

export function formatTipoGatilho(tipo: string): string {
  const map: Record<string, string> = {
    km: "Quilômetros",
    horas: "Horas",
    ciclos: "Ciclos",
    periodicidade_dias: "Dias",
    data_fixa: "Data Fixa",
  };
  return map[tipo] ?? tipo;
}

interface Props {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  ativo: "bg-green-500/20 text-green-400 border border-green-500/30",
  inativo: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  em_manutencao: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  aberta: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  aprovada: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  em_andamento: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  concluida: "bg-green-500/20 text-green-400 border border-green-500/30",
  cancelada: "bg-red-500/20 text-red-400 border border-red-500/30",
  urgente: "bg-red-500/20 text-red-400 border border-red-500/30",
  alta: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  media: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  baixa: "bg-green-500/20 text-green-400 border border-green-500/30",
  novo: "bg-red-500/20 text-red-400 border border-red-500/30",
  lido: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  resolvido: "bg-green-500/20 text-green-400 border border-green-500/30",
  preventiva: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  corretiva: "bg-red-500/20 text-red-300 border border-red-500/30",
  preditiva: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  inspecao: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  rascunho: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  publicada: "bg-green-500/20 text-green-400 border border-green-500/30",
  arquivada: "bg-gray-700/40 text-gray-500 border border-gray-600/30",
};

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  em_manutencao: "Em Manutenção",
  aberta: "Aberta",
  aprovada: "Aprovada",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
  urgente: "Urgente",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  novo: "Novo",
  lido: "Lido",
  resolvido: "Resolvido",
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  preditiva: "Preditiva",
  inspecao: "Inspeção",
  rascunho: "Rascunho",
  publicada: "Publicada",
  arquivada: "Arquivada",
};

export default function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] ?? "bg-gray-500/20 text-gray-400"} ${className}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

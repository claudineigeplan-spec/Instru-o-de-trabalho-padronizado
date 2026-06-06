import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { ordensService } from "../services/ordens";
import { equipamentosService } from "../services/equipamentos";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { resolveErrorMessage } from "../services/api";
import { formatDate, formatStatusOS, formatPrioridade } from "../utils/format";
import api from "../services/api";
import type {
  OrdemServico,
  Equipamento,
  StatusOS,
  InstrucaoTrabalho,
} from "../types";

interface Mecanico {
  id: number;
  name: string;
}

const FORM_VAZIO = {
  equipamento_id: "",
  tipo: "corretiva",
  titulo: "",
  descricao: "",
  prioridade: "media",
  data_prevista: "",
  tecnico_id: "",
  instrucao_trabalho_id: "",
};

export default function OrdensServico() {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [instrucoes, setInstrucoes] = useState<InstrucaoTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNova, setModalNova] = useState(false);
  const [osDetalhe, setOsDetalhe] = useState<OrdemServico | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const toast = useToast();

  const [form, setForm] = useState({ ...FORM_VAZIO });

  const podeAtribuir = user?.role === "gestor" || user?.role === "lider_campo";
  const podeCriar = user?.role !== "mecanico";

  async function carregar(p = pagina) {
    const params: Record<string, string> = { page: String(p) };
    if (filtroStatus) params.status = filtroStatus;
    const data = await ordensService.listar(params);
    setOrdens(data.data);
    setTotalPaginas(data.last_page);
    setLoading(false);
  }

  useEffect(() => {
    setPagina(1);
    carregar(1);
  }, [filtroStatus]);

  useEffect(() => {
    equipamentosService.listar().then(setEquipamentos);
    if (podeAtribuir) {
      api
        .get<Mecanico[]>("/mecanicos")
        .then((r) => setMecanicos(r.data))
        .catch(() => {});
      api
        .get<InstrucaoTrabalho[]>("/instrucoes?status=publicada")
        .then((r) => setInstrucoes(r.data))
        .catch(() => {});
    }
  }, []);

  async function criar() {
    try {
      await ordensService.criar({
        ...form,
        equipamento_id: Number(form.equipamento_id) as never,
        tecnico_id: form.tecnico_id ? Number(form.tecnico_id) : undefined,
        instrucao_trabalho_id: form.instrucao_trabalho_id
          ? Number(form.instrucao_trabalho_id)
          : undefined,
      } as never);
      toast.success("Ordem criada com sucesso.");
      setModalNova(false);
      setForm({ ...FORM_VAZIO });
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function atualizarStatus(os: OrdemServico, status: StatusOS) {
    try {
      await ordensService.atualizarStatus(os.id, status);
      toast.success(`Status atualizado: ${formatStatusOS(status)}`);
      carregar();
      if (osDetalhe?.id === os.id) {
        const atualizada = await ordensService.buscar(os.id);
        setOsDetalhe(atualizada);
      }
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function concluirPasso(
    osId: number,
    passoId: number,
    concluido: boolean,
  ) {
    try {
      await ordensService.concluirPasso(osId, passoId, { concluido });
      const atualizada = await ordensService.buscar(osId);
      setOsDetalhe(atualizada);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function abrirDetalhe(os: OrdemServico) {
    const completa = await ordensService.buscar(os.id);
    setOsDetalhe(completa);
  }

  async function excluirOS(os: OrdemServico) {
    if (
      !confirm(
        `Excluir a ordem ${os.codigo}? Só é possível para OS abertas ou canceladas.`,
      )
    )
      return;
    try {
      await api.delete(`/ordens-servico/${os.id}`);
      toast.success("Ordem excluída.");
      setOsDetalhe(null);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  // Define próximo status e quem pode executar a ação
  function acoesPorRole(
    os: OrdemServico,
  ): { label: string; status: StatusOS }[] {
    const role = user?.role;
    const acoes: { label: string; status: StatusOS }[] = [];

    if (
      os.status === "aberta" &&
      (role === "gestor" || role === "lider_campo")
    ) {
      acoes.push({ label: "Aprovar", status: "aprovada" });
      acoes.push({ label: "Cancelar", status: "cancelada" });
    }
    if (
      os.status === "aprovada" &&
      (role === "mecanico" || role === "gestor" || role === "lider_campo")
    ) {
      acoes.push({ label: "Iniciar Execução", status: "em_andamento" });
    }
    if (
      os.status === "aprovada" &&
      (role === "gestor" || role === "lider_campo")
    ) {
      acoes.push({ label: "Cancelar", status: "cancelada" });
    }
    if (
      os.status === "em_andamento" &&
      (role === "mecanico" || role === "gestor")
    ) {
      acoes.push({ label: "Concluir", status: "concluida" });
    }
    return acoes;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ordens de Manutenção</h1>
        {podeCriar && (
          <button
            onClick={() => {
              setForm({ ...FORM_VAZIO });
              setModalNova(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Nova Ordem
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "",
            "aberta",
            "aprovada",
            "em_andamento",
            "concluida",
            "cancelada",
          ] as const
        ).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              filtroStatus === s
                ? "bg-[#f97316] text-white font-medium"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {s ? formatStatusOS(s) : "Todas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : ordens.length === 0 ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Nenhuma ordem encontrada.</div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {ordens.map((os) => {
            const acoes = acoesPorRole(os);
            return (
              <GlassCard
                key={os.id}
                onClick={() => abrirDetalhe(os)}
                className="cursor-pointer hover:border-[#f97316]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-400 text-xs font-mono">
                        {os.codigo}
                      </span>
                      <StatusBadge status={os.tipo} />
                      <StatusBadge status={os.prioridade} />
                    </div>
                    <div className="text-white font-medium mt-1">
                      {os.titulo}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      🌿 {os.equipamento?.nome}
                      {os.data_prevista &&
                        ` · Prazo: ${formatDate(os.data_prevista)}`}
                    </div>
                    {os.tecnico && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        🔧 Mecânico: {os.tecnico.name}
                      </div>
                    )}
                  </div>
                  <div
                    className="flex flex-col items-end gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusBadge status={os.status} />
                    {acoes.slice(0, 1).map((a) => (
                      <button
                        key={a.status}
                        onClick={() => atualizarStatus(os, a.status)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          a.status === "cancelada"
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => {
              const p = pagina - 1;
              setPagina(p);
              carregar(p);
            }}
            disabled={pagina === 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:text-white disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-xs text-gray-500">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => {
              const p = pagina + 1;
              setPagina(p);
              carregar(p);
            }}
            disabled={pagina === totalPaginas}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:text-white disabled:opacity-30"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Modal: Nova OS */}
      <GlassModal
        open={modalNova}
        onClose={() => setModalNova(false)}
        title="Nova Ordem de Manutenção"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Equipamento *
            </label>
            <select
              value={form.equipamento_id}
              onChange={(e) =>
                setForm({ ...form, equipamento_id: e.target.value })
              }
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Selecione...</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="preditiva">Preditiva</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Prioridade *
              </label>
              <select
                value={form.prioridade}
                onChange={(e) =>
                  setForm({ ...form, prioridade: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Título *</label>
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>

          {podeAtribuir && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Mecânico responsável
                </label>
                <select
                  value={form.tecnico_id}
                  onChange={(e) =>
                    setForm({ ...form, tecnico_id: e.target.value })
                  }
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Sem atribuição</option>
                  {mecanicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Instrução de Trabalho
                </label>
                <select
                  value={form.instrucao_trabalho_id}
                  onChange={(e) =>
                    setForm({ ...form, instrucao_trabalho_id: e.target.value })
                  }
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Nenhuma</option>
                  {instrucoes.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Data prevista
            </label>
            <input
              type="date"
              value={form.data_prevista}
              onChange={(e) =>
                setForm({ ...form, data_prevista: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalNova(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={criar}
              disabled={!form.equipamento_id || !form.titulo}
              className="bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-40 text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Criar Ordem
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Modal: Detalhe da OS */}
      <GlassModal
        open={!!osDetalhe}
        onClose={() => setOsDetalhe(null)}
        title={osDetalhe ? `${osDetalhe.codigo} — ${osDetalhe.titulo}` : ""}
        size="xl"
      >
        {osDetalhe && (
          <div className="space-y-5">
            {/* Cabeçalho */}
            <div className="flex flex-wrap gap-2 items-center">
              <StatusBadge status={osDetalhe.status} />
              <StatusBadge status={osDetalhe.tipo} />
              <StatusBadge status={osDetalhe.prioridade} />
              {osDetalhe.data_prevista && (
                <span className="text-xs text-gray-500">
                  Prazo: {formatDate(osDetalhe.data_prevista)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Equipamento</span>
                <div className="text-white">
                  {osDetalhe.equipamento?.nome ?? "—"}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Mecânico</span>
                <div className="text-white">
                  {osDetalhe.tecnico?.name ?? "Não atribuído"}
                </div>
              </div>
            </div>

            {osDetalhe.descricao && (
              <p className="text-gray-400 text-sm">{osDetalhe.descricao}</p>
            )}

            {/* Passos da IT */}
            {osDetalhe.execucoes && osDetalhe.execucoes.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">
                  📋{" "}
                  {osDetalhe.execucoes[0].instrucao?.titulo ??
                    "Instrução de Trabalho"}
                </h3>
                <div className="space-y-2">
                  {osDetalhe.execucoes[0].passosExecutados?.map((pe, i) => {
                    const podeConcluirPasso =
                      osDetalhe.status === "em_andamento" &&
                      (user?.role === "mecanico" || user?.role === "gestor");
                    return (
                      <div
                        key={pe.id ?? i}
                        className={`flex gap-3 rounded-lg p-3 transition-colors ${
                          pe.concluido
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                            pe.concluido
                              ? "bg-green-500 text-white"
                              : "bg-[#f97316] text-white"
                          }`}
                        >
                          {pe.concluido ? "✓" : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">
                            {pe.passo?.titulo}
                          </div>
                          {pe.passo?.descricao && (
                            <div className="text-gray-400 text-xs mt-0.5">
                              {pe.passo.descricao}
                            </div>
                          )}
                          {pe.passo?.alerta_seguranca && (
                            <div className="text-yellow-400 text-xs mt-1">
                              ⚠ {pe.passo.alerta_seguranca}
                            </div>
                          )}
                        </div>
                        {podeConcluirPasso && !pe.concluido && (
                          <button
                            onClick={() =>
                              concluirPasso(osDetalhe.id, pe.passo!.id, true)
                            }
                            className="text-xs text-green-400 hover:text-green-300 shrink-0"
                          >
                            Concluir
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ações */}
            {(acoesPorRole(osDetalhe).length > 0 ||
              (podeAtribuir &&
                ["aberta", "cancelada"].includes(osDetalhe.status))) && (
              <div className="flex gap-3 pt-2 border-t border-white/10 flex-wrap">
                {acoesPorRole(osDetalhe).map((a) => (
                  <button
                    key={a.status}
                    onClick={() => atualizarStatus(osDetalhe, a.status)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      a.status === "cancelada"
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-[#f97316] hover:bg-[#ea580c] text-white"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
                {podeAtribuir &&
                  ["aberta", "cancelada"].includes(osDetalhe.status) && (
                    <button
                      onClick={() => excluirOS(osDetalhe)}
                      className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-auto"
                    >
                      Excluir OS
                    </button>
                  )}
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
}

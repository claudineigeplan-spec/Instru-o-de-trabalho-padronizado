import { useEffect, useState } from "react";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { resolveErrorMessage } from "../services/api";
import type { InstrucaoTrabalho, PassoIt, TipoIT, StatusIT } from "../types";

const TIPO_LABEL: Record<TipoIT, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  preditiva: "Preditiva",
  inspecao: "Inspeção",
};

const STATUS_LABEL: Record<StatusIT, string> = {
  rascunho: "Rascunho",
  publicada: "Publicada",
  arquivada: "Arquivada",
};

const STATUS_COLOR: Record<StatusIT, string> = {
  rascunho: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  publicada: "text-green-400 bg-green-500/10 border-green-500/20",
  arquivada: "text-gray-500 bg-gray-500/10 border-gray-500/20",
};

const TIPO_COLOR: Record<TipoIT, string> = {
  preventiva: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  corretiva: "text-red-400 bg-red-500/10 border-red-500/20",
  preditiva: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  inspecao: "text-[#f97316] bg-orange-500/10 border-orange-500/20",
};

const FORM_VAZIO = {
  titulo: "",
  descricao: "",
  tempo_estimado_min: "",
  tipo: "preventiva" as TipoIT,
  prioridade: "media",
  responsavel: "",
  status: "rascunho" as StatusIT,
};

export default function InstrucoesTrabalho() {
  const { user } = useAuth();
  const [instrucoes, setInstrucoes] = useState<InstrucaoTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIT, setModalIT] = useState(false);
  const [modalPassos, setModalPassos] = useState(false);
  const [itSelecionada, setItSelecionada] = useState<InstrucaoTrabalho | null>(
    null,
  );
  const [editando, setEditando] = useState<InstrucaoTrabalho | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const toast = useToast();

  const [formIT, setFormIT] = useState({ ...FORM_VAZIO });
  const [formPasso, setFormPasso] = useState({
    titulo: "",
    descricao: "",
    alerta_seguranca: "",
  });

  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  async function carregar() {
    const params: Record<string, string> = {};
    if (filtroTipo) params.tipo = filtroTipo;
    const data = await api
      .get<InstrucaoTrabalho[]>("/instrucoes", { params })
      .then((r) => r.data);
    setInstrucoes(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [filtroTipo]);

  function abrirModal(it?: InstrucaoTrabalho) {
    if (it) {
      setEditando(it);
      setFormIT({
        titulo: it.titulo,
        descricao: it.descricao ?? "",
        tempo_estimado_min: String(it.tempo_estimado_min),
        tipo: it.tipo,
        prioridade: it.prioridade,
        responsavel: it.responsavel ?? "",
        status: it.status,
      });
    } else {
      setEditando(null);
      setFormIT({ ...FORM_VAZIO });
    }
    setModalIT(true);
  }

  async function salvarIT() {
    try {
      const payload = {
        ...formIT,
        tempo_estimado_min: Number(formIT.tempo_estimado_min) || 0,
      };
      if (editando) {
        await api.put(`/instrucoes/${editando.id}`, payload);
        toast.success("Instrução atualizada.");
      } else {
        await api.post("/instrucoes", payload);
        toast.success("Instrução criada.");
      }
      setModalIT(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluirIT(it: InstrucaoTrabalho) {
    if (!confirm(`Excluir a instrução "${it.titulo}"?`)) return;
    try {
      await api.delete(`/instrucoes/${it.id}`);
      toast.success("Instrução excluída.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function publicar(it: InstrucaoTrabalho) {
    try {
      await api.put(`/instrucoes/${it.id}`, { status: "publicada" });
      toast.success("Instrução publicada.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function arquivar(it: InstrucaoTrabalho) {
    try {
      await api.put(`/instrucoes/${it.id}`, { status: "arquivada" });
      toast.success("Instrução arquivada.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function salvarPasso() {
    if (!itSelecionada) return;
    try {
      await api.post(`/instrucoes/${itSelecionada.id}/passos`, formPasso);
      toast.success("Passo adicionado.");
      setFormPasso({ titulo: "", descricao: "", alerta_seguranca: "" });
      const data = await api
        .get<InstrucaoTrabalho>(`/instrucoes/${itSelecionada.id}`)
        .then((r) => r.data);
      setItSelecionada(data);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluirPasso(passoId: number) {
    if (!podeEditar) return;
    try {
      await api.delete(`/passos/${passoId}`);
      const data = await api
        .get<InstrucaoTrabalho>(`/instrucoes/${itSelecionada!.id}`)
        .then((r) => r.data);
      setItSelecionada(data);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  function abrirPassos(it: InstrucaoTrabalho) {
    api.get<InstrucaoTrabalho>(`/instrucoes/${it.id}`).then((r) => {
      setItSelecionada(r.data);
      setModalPassos(true);
    });
  }

  const instrucoesVisiveis =
    user?.role === "mecanico"
      ? instrucoes.filter((it) => it.status === "publicada")
      : instrucoes;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">
          Instruções de Trabalho
        </h1>
        {podeEditar && (
          <button
            onClick={() => abrirModal()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Nova IT
          </button>
        )}
      </div>

      {/* Filtros por tipo */}
      <div className="flex gap-2 flex-wrap">
        {(
          ["", "preventiva", "corretiva", "preditiva", "inspecao"] as const
        ).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              filtroTipo === t
                ? "bg-[#f97316] text-white font-medium"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {t ? TIPO_LABEL[t] : "Todas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : instrucoesVisiveis.length === 0 ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Nenhuma instrução encontrada.</div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {instrucoesVisiveis.map((it) => (
            <GlassCard key={it.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${TIPO_COLOR[it.tipo] ?? "text-gray-400"}`}
                    >
                      {TIPO_LABEL[it.tipo] ?? it.tipo}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[it.status] ?? "text-gray-400"}`}
                    >
                      {STATUS_LABEL[it.status] ?? it.status}
                    </span>
                    <StatusBadge status={it.prioridade} />
                  </div>
                  <div className="text-white font-medium">{it.titulo}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {it.tempo_estimado_min > 0 && (
                      <span>⏱ {it.tempo_estimado_min} min</span>
                    )}
                    {it.responsavel && <span>👤 {it.responsavel}</span>}
                    <span>📋 {it.passos?.length ?? 0} passos</span>
                  </div>
                  {it.descricao && (
                    <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                      {it.descricao}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => abrirPassos(it)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg"
                  >
                    Ver Passos
                  </button>
                  {podeEditar && it.status === "rascunho" && (
                    <button
                      onClick={() => publicar(it)}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      Publicar
                    </button>
                  )}
                  {podeEditar && it.status === "publicada" && (
                    <button
                      onClick={() => arquivar(it)}
                      className="text-xs text-gray-500 hover:text-gray-400"
                    >
                      Arquivar
                    </button>
                  )}
                  {podeEditar && (
                    <div className="flex gap-2 border-t border-white/10 pt-1 mt-0.5">
                      <button
                        onClick={() => abrirModal(it)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirIT(it)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal: Nova / Editar IT */}
      <GlassModal
        open={modalIT}
        onClose={() => setModalIT(false)}
        title={
          editando
            ? "Editar Instrução de Trabalho"
            : "Nova Instrução de Trabalho"
        }
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título *</label>
            <input
              value={formIT.titulo}
              onChange={(e) => setFormIT({ ...formIT, titulo: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select
                value={formIT.tipo}
                onChange={(e) =>
                  setFormIT({ ...formIT, tipo: e.target.value as TipoIT })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="preditiva">Preditiva</option>
                <option value="inspecao">Inspeção</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Prioridade
              </label>
              <select
                value={formIT.prioridade}
                onChange={(e) =>
                  setFormIT({ ...formIT, prioridade: e.target.value })
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Responsável
              </label>
              <input
                value={formIT.responsavel}
                onChange={(e) =>
                  setFormIT({ ...formIT, responsavel: e.target.value })
                }
                placeholder="Ex: Mecânico"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tempo estimado (min)
              </label>
              <input
                type="number"
                value={formIT.tempo_estimado_min}
                onChange={(e) =>
                  setFormIT({ ...formIT, tempo_estimado_min: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Descrição
            </label>
            <textarea
              value={formIT.descricao}
              onChange={(e) =>
                setFormIT({ ...formIT, descricao: e.target.value })
              }
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalIT(false)}
              className="px-4 py-2 text-sm text-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={salvarIT}
              disabled={!formIT.titulo}
              className="bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-40 text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Modal: Passos */}
      <GlassModal
        open={modalPassos}
        onClose={() => setModalPassos(false)}
        title={itSelecionada?.titulo ?? ""}
        size="lg"
      >
        {itSelecionada && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${TIPO_COLOR[itSelecionada.tipo]}`}
              >
                {TIPO_LABEL[itSelecionada.tipo]}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[itSelecionada.status]}`}
              >
                {STATUS_LABEL[itSelecionada.status]}
              </span>
              {itSelecionada.tempo_estimado_min > 0 && (
                <span className="text-xs text-gray-500">
                  ⏱ {itSelecionada.tempo_estimado_min} min
                </span>
              )}
            </div>

            {itSelecionada.descricao && (
              <p className="text-gray-400 text-sm">{itSelecionada.descricao}</p>
            )}

            <div className="space-y-2">
              {itSelecionada.passos.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-4">
                  Nenhum passo cadastrado.
                </div>
              )}
              {itSelecionada.passos.map((passo: PassoIt, i: number) => (
                <div
                  key={passo.id}
                  className="flex gap-3 bg-white/5 rounded-lg p-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[#f97316] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {passo.titulo}
                    </div>
                    {passo.descricao && (
                      <div className="text-gray-400 text-xs mt-0.5">
                        {passo.descricao}
                      </div>
                    )}
                    {passo.alerta_seguranca && (
                      <div className="text-yellow-400 text-xs mt-1">
                        ⚠ {passo.alerta_seguranca}
                      </div>
                    )}
                  </div>
                  {podeEditar && (
                    <button
                      onClick={() => excluirPasso(passo.id)}
                      className="text-red-400 text-xs hover:text-red-300 shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {podeEditar && (
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-300 font-medium mb-3">
                  Adicionar passo
                </div>
                <div className="space-y-2">
                  <input
                    value={formPasso.titulo}
                    onChange={(e) =>
                      setFormPasso({ ...formPasso, titulo: e.target.value })
                    }
                    placeholder="Título do passo"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <textarea
                    value={formPasso.descricao}
                    onChange={(e) =>
                      setFormPasso({ ...formPasso, descricao: e.target.value })
                    }
                    placeholder="Descrição detalhada"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  />
                  <input
                    value={formPasso.alerta_seguranca}
                    onChange={(e) =>
                      setFormPasso({
                        ...formPasso,
                        alerta_seguranca: e.target.value,
                      })
                    }
                    placeholder="⚠ Alerta de segurança (opcional)"
                    className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-yellow-100 text-sm"
                  />
                  <button
                    onClick={salvarPasso}
                    disabled={!formPasso.titulo}
                    className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white py-2 rounded-lg text-sm transition-colors"
                  >
                    + Adicionar Passo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
}

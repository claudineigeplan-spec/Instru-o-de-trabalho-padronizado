import { useEffect, useState } from "react";
import GlassModal from "../components/ui/GlassModal";
import GlassCard from "../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { programacoesService } from "../services/programacoes";
import { equipesService } from "../services/equipes";
import { atividadesService } from "../services/atividades";
import { resolveErrorMessage } from "../services/api";
import type {
  Programacao,
  ProgramacaoItem,
  EquipeCampo,
  Atividade,
  StatusProgramacao,
} from "../types";

const STATUS_LABEL: Record<StatusProgramacao, string> = {
  rascunho: "Rascunho",
  planejado: "Planejado",
  aprovado: "Aprovado",
  em_execucao: "Em Execução",
  executado: "Executado",
  parcialmente_executado: "Parcial",
  cancelado: "Cancelado",
  reprogramado: "Reprogramado",
};
const STATUS_COR: Record<StatusProgramacao, string> = {
  rascunho: "#64748b",
  planejado: "#3b82f6",
  aprovado: "#06b6d4",
  em_execucao: "#f97316",
  executado: "#10b981",
  parcialmente_executado: "#f97316",
  cancelado: "#ef4444",
  reprogramado: "#8b5cf6",
};

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function fmtBR(s: string) {
  return s.slice(8, 10) + "/" + s.slice(5, 7);
}
function getSegunda(ref: Date) {
  const d = new Date(ref);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function semana(segunda: Date) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(d.getDate() + i);
    return fmt(d);
  });
}
const DIAS_NOME = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Linha {
  programacao: Programacao;
  item: ProgramacaoItem;
}

const FORM_VAZIO = {
  equipe_id: "",
  atividade_id: "",
  data: fmt(new Date()),
  quantidade_prevista: "",
  unidade: "m²",
  status: "planejado" as StatusProgramacao,
};

export default function PCP() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar =
    user?.role === "gestor" ||
    user?.role === "lider_campo" ||
    user?.role === "pcp";

  const [programacoes, setProgramacoes] = useState<Programacao[]>([]);
  const [equipes, setEquipes] = useState<EquipeCampo[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  const [segunda, setSegunda] = useState(getSegunda(new Date()));
  const [visualizacao, setVisualizacao] = useState<"semanal" | "lista">(
    "semanal",
  );
  const [filtroEquipe, setFiltroEquipe] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Linha | null>(null);
  const [form, setForm] = useState({ ...FORM_VAZIO });

  function carregar() {
    setLoading(true);
    Promise.all([
      programacoesService.listar(),
      equipesService.listar(),
      atividadesService.listar(),
    ])
      .then(([p, e, a]) => {
        setProgramacoes(p);
        setEquipes(e);
        setAtividades(a);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const linhas: Linha[] = programacoes.flatMap((p) =>
    (p.itens ?? []).map((item) => ({ programacao: p, item })),
  );

  const equipesComContrato = equipes.filter((e) => e.contrato_id);

  const dias = semana(segunda);
  const proximaSegunda = new Date(segunda);
  proximaSegunda.setDate(proximaSegunda.getDate() + 7);
  const segundaAnterior = new Date(segunda);
  segundaAnterior.setDate(segundaAnterior.getDate() - 7);

  const linhasSemana = linhas.filter((l) =>
    dias.includes(l.programacao.data_programada.slice(0, 10)),
  );
  const linhasVisiveis = filtroEquipe
    ? linhasSemana.filter(
        (l) => String(l.programacao.equipe_id) === filtroEquipe,
      )
    : linhasSemana;

  const executados = linhas.filter(
    (l) => l.programacao.status === "executado",
  ).length;
  const planejados = linhas.filter(
    (l) =>
      l.programacao.status === "planejado" ||
      l.programacao.status === "aprovado",
  ).length;
  const parciais = linhas.filter(
    (l) =>
      l.programacao.status === "parcialmente_executado" ||
      l.programacao.status === "em_execucao",
  ).length;

  function abrirNovo(data?: string) {
    setEditando(null);
    setForm({
      ...FORM_VAZIO,
      equipe_id: filtroEquipe || String(equipesComContrato[0]?.id ?? ""),
      data: data ?? fmt(new Date()),
    });
    setModal(true);
  }

  function abrirEditar(linha: Linha) {
    setEditando(linha);
    setForm({
      equipe_id: String(linha.programacao.equipe_id ?? ""),
      atividade_id: String(linha.item.atividade_id),
      data: linha.programacao.data_programada.slice(0, 10),
      quantidade_prevista: String(linha.item.quantidade_prevista),
      unidade: linha.item.unidade,
      status: linha.programacao.status,
    });
    setModal(true);
  }

  async function salvar() {
    const equipe = equipes.find((e) => e.id === Number(form.equipe_id));
    if (!equipe?.contrato_id || !form.atividade_id) {
      toast.error("Selecione equipe (com contrato) e atividade.");
      return;
    }
    try {
      if (editando) {
        await programacoesService.atualizar(editando.programacao.id, {
          data_programada: form.data,
          status: form.status,
        });
        await programacoesService.atualizarItem(
          editando.programacao.id,
          editando.item.id,
          {
            atividade_id: Number(form.atividade_id),
            quantidade_prevista: Number(form.quantidade_prevista) || 0,
            unidade: form.unidade,
          },
        );
        toast.success("Programação atualizada.");
      } else {
        await programacoesService.criar({
          contrato_id: equipe.contrato_id,
          equipe_id: equipe.id,
          data_programada: form.data,
          status: form.status,
          itens: [
            {
              atividade_id: Number(form.atividade_id),
              quantidade_prevista: Number(form.quantidade_prevista) || 0,
              unidade: form.unidade,
            },
          ],
        });
        toast.success("Programação criada.");
      }
      setModal(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluir(linha: Linha) {
    if (!confirm("Remover este item de programação?")) return;
    try {
      await programacoesService.excluirItem(
        linha.programacao.id,
        linha.item.id,
      );
      toast.success("Item removido.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">PCP — Planejamento</h1>
        {podeEditar && (
          <button
            onClick={() => abrirNovo()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Item de Programação
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total Programado</div>
          <div className="text-3xl font-bold text-white">{linhas.length}</div>
          <div className="text-xs text-gray-400 mt-1">itens</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Executados</div>
          <div className="text-3xl font-bold text-green-400">{executados}</div>
          <div className="text-xs text-gray-400 mt-1">concluídos</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">
            Planejados / Aprovados
          </div>
          <div className="text-3xl font-bold text-blue-400">{planejados}</div>
          <div className="text-xs text-gray-400 mt-1">a executar</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">
            Em Execução / Parciais
          </div>
          <div className="text-3xl font-bold text-[#f97316]">{parciais}</div>
          <div className="text-xs text-gray-400 mt-1">em andamento</div>
        </GlassCard>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(["semanal", "lista"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisualizacao(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                visualizacao === v
                  ? "bg-[#f97316] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {v === "semanal" ? "Semana" : "Lista"}
            </button>
          ))}
        </div>

        {visualizacao === "semanal" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSegunda(segundaAnterior)}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ‹
            </button>
            <span className="text-white text-sm font-medium min-w-40 text-center">
              {fmtBR(dias[0])} — {fmtBR(dias[5])}
            </span>
            <button
              onClick={() => setSegunda(proximaSegunda)}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              ›
            </button>
          </div>
        )}

        <select
          value={filtroEquipe}
          onChange={(e) => setFiltroEquipe(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
        >
          <option value="">Todas as equipes</option>
          {equipes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando programações...
        </p>
      ) : (
        <>
          {visualizacao === "semanal" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4 w-44">
                      Equipe
                    </th>
                    {dias.map((d, i) => (
                      <th
                        key={d}
                        className="text-center text-xs text-gray-400 font-medium pb-2 px-1"
                      >
                        <div>{DIAS_NOME[i]}</div>
                        <div className="text-white">{fmtBR(d)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(filtroEquipe
                    ? equipes.filter((e) => String(e.id) === filtroEquipe)
                    : equipesComContrato
                  ).map((equipe) => (
                    <tr key={equipe.id} className="border-t border-white/5">
                      <td className="py-2 pr-4 text-xs text-gray-300 align-top font-medium leading-tight">
                        {equipe.nome.split(" — ")[0]}
                        <br />
                        <span className="text-gray-500 font-normal">
                          {equipe.nome.split(" — ")[1]}
                        </span>
                      </td>
                      {dias.map((d) => {
                        const cell = linhasVisiveis.filter(
                          (l) =>
                            l.programacao.equipe_id === equipe.id &&
                            l.programacao.data_programada.slice(0, 10) === d,
                        );
                        return (
                          <td key={d} className="py-2 px-1 align-top">
                            <div className="space-y-1 min-h-[40px]">
                              {cell.map((l) => (
                                <div
                                  key={l.item.id}
                                  onClick={() => podeEditar && abrirEditar(l)}
                                  className="text-xs rounded-md px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: `${STATUS_COR[l.programacao.status]}20`,
                                    borderLeft: `2px solid ${STATUS_COR[l.programacao.status]}`,
                                  }}
                                  title={`${l.item.atividade?.nome} — ${l.item.quantidade_prevista} ${l.item.unidade}`}
                                >
                                  <div className="text-white truncate">
                                    {l.item.atividade?.nome}
                                  </div>
                                  <div className="text-gray-400">
                                    {l.item.quantidade_prevista}{" "}
                                    {l.item.unidade}
                                  </div>
                                </div>
                              ))}
                              {podeEditar && (
                                <button
                                  onClick={() => abrirNovo(d)}
                                  className="w-full text-gray-600 hover:text-gray-400 text-xs text-center py-0.5 hover:bg-white/5 rounded transition-colors"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visualizacao === "lista" && (
            <div className="space-y-2">
              {linhas
                .filter(
                  (l) =>
                    !filtroEquipe ||
                    String(l.programacao.equipe_id) === filtroEquipe,
                )
                .sort((a, b) =>
                  a.programacao.data_programada.localeCompare(
                    b.programacao.data_programada,
                  ),
                )
                .map((l) => (
                  <div
                    key={l.item.id}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4"
                    style={{
                      borderLeftColor: STATUS_COR[l.programacao.status],
                      borderLeftWidth: 2,
                    }}
                  >
                    <div className="text-gray-400 text-xs font-mono w-14 shrink-0">
                      {fmtBR(l.programacao.data_programada.slice(0, 10))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">
                        {l.item.atividade?.nome}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {l.programacao.equipe?.nome ?? "—"} ·{" "}
                        {l.programacao.contrato?.numero ?? "—"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-white text-sm">
                        {l.item.quantidade_prevista} {l.item.unidade}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_COR[l.programacao.status],
                          backgroundColor: `${STATUS_COR[l.programacao.status]}20`,
                        }}
                      >
                        {STATUS_LABEL[l.programacao.status]}
                      </span>
                    </div>
                    {podeEditar && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => abrirEditar(l)}
                          className="text-xs text-gray-400 hover:text-white px-2 py-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(l)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <GlassModal
        open={modal}
        onClose={() => setModal(false)}
        title={
          editando ? "Editar Item de Programação" : "Novo Item de Programação"
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as StatusProgramacao,
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {(Object.keys(STATUS_LABEL) as StatusProgramacao[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Equipe *</label>
            <select
              value={form.equipe_id}
              onChange={(e) => setForm({ ...form, equipe_id: e.target.value })}
              disabled={!!editando}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
            >
              <option value="">Selecione...</option>
              {equipesComContrato.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome} — {e.contrato?.numero}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Atividade *
            </label>
            <select
              value={form.atividade_id}
              onChange={(e) => {
                const at = atividades.find(
                  (a) => a.id === Number(e.target.value),
                );
                setForm({
                  ...form,
                  atividade_id: e.target.value,
                  unidade: at?.unidade_medida ?? form.unidade,
                });
              }}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Selecione...</option>
              {atividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} — {a.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Quantidade Prevista
              </label>
              <input
                type="number"
                value={form.quantidade_prevista}
                onChange={(e) =>
                  setForm({ ...form, quantidade_prevista: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Unidade
              </label>
              <input
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                placeholder="m², m³, t, km..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!form.equipe_id || !form.atividade_id}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

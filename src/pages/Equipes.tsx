import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { equipesService } from "../services/equipes";
import { colaboradoresService } from "../services/colaboradores";
import { resolveErrorMessage } from "../services/api";
import type { EquipeCampo, Colaborador } from "../types";

const TIPO_LABEL: Record<string, string> = {
  pavimentacao: "Pavimentação",
  terraplenagem: "Terraplenagem",
  drenagem: "Drenagem",
  conserva: "Conserva Rodoviária",
  manutencao: "Manutenção",
};
const TIPO_COR: Record<string, string> = {
  pavimentacao: "#f97316",
  terraplenagem: "#8b5cf6",
  drenagem: "#3b82f6",
  conserva: "#10b981",
  manutencao: "#ef4444",
};
const corDoTipo = (tipo: string) => TIPO_COR[tipo] ?? "#64748b";
const labelDoTipo = (tipo: string) => TIPO_LABEL[tipo] ?? tipo;

export default function Equipes() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [equipes, setEquipes] = useState<EquipeCampo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"" | "true" | "false">("");
  const [detalhe, setDetalhe] = useState<EquipeCampo | null>(null);
  const [modalMembro, setModalMembro] = useState<EquipeCampo | null>(null);
  const [formMembro, setFormMembro] = useState({
    colaborador_id: "",
    funcao_equipe: "",
  });

  function carregar() {
    setLoading(true);
    Promise.all([equipesService.listar(), colaboradoresService.listar()])
      .then(([e, c]) => {
        setEquipes(e);
        setColaboradores(c);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrada = equipes.filter((e) => {
    const st = !filtroAtivo || String(e.ativo) === filtroAtivo;
    const b = busca.toLowerCase();
    const bk =
      !b ||
      e.nome.toLowerCase().includes(b) ||
      (e.lider?.nome ?? "").toLowerCase().includes(b) ||
      e.tipo.toLowerCase().includes(b);
    return st && bk;
  });

  const ativas = equipes.filter((e) => e.ativo).length;
  const totalMembros = equipes.reduce(
    (s, e) => s + (e.colaboradores?.length ?? 0),
    0,
  );
  const membrosAtivos = equipes
    .filter((e) => e.ativo)
    .reduce((s, e) => s + (e.colaboradores?.length ?? 0), 0);
  const contratosAtivos = new Set(
    equipes.filter((e) => e.ativo && e.contrato_id).map((e) => e.contrato_id),
  ).size;
  const maiorEquipe = equipes.length
    ? Math.max(...equipes.map((e) => e.colaboradores?.length ?? 0))
    : 0;

  async function adicionarMembro() {
    if (!modalMembro || !formMembro.colaborador_id) {
      toast.error("Selecione um colaborador.");
      return;
    }
    try {
      await equipesService.adicionarMembro(modalMembro.id, {
        colaborador_id: Number(formMembro.colaborador_id),
        funcao_equipe: formMembro.funcao_equipe || undefined,
      });
      toast.success("Membro adicionado.");
      setModalMembro(null);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function removerMembro(equipeId: number, colaboradorId: number) {
    if (!confirm("Remover membro da equipe?")) return;
    try {
      await equipesService.removerMembro(equipeId, colaboradorId);
      toast.success("Membro removido.");
      setDetalhe(null);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function alterarAtivo(id: number, ativo: boolean) {
    try {
      await equipesService.atualizar(id, { ativo });
      toast.success(`Equipe marcada como: ${ativo ? "Ativa" : "Inativa"}`);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Equipes de Campo</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Equipes Ativas</div>
          <div className="text-3xl font-bold text-green-400">{ativas}</div>
          <div className="text-xs text-gray-400 mt-1">
            de {equipes.length} cadastradas
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Colaboradores</div>
          <div className="text-3xl font-bold text-white">{totalMembros}</div>
          <div className="text-xs text-green-400 mt-1">
            {membrosAtivos} em campo hoje
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Contratos Ativos</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {contratosAtivos}
          </div>
          <div className="text-xs text-gray-400 mt-1">frentes abertas</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Maior Equipe</div>
          <div className="text-3xl font-bold text-blue-400">{maiorEquipe}</div>
          <div className="text-xs text-gray-400 mt-1">
            membros na equipe maior
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar equipe ou líder..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <div className="flex gap-1">
          {(
            [
              { v: "", label: "Todas" },
              { v: "true", label: "Ativas" },
              { v: "false", label: "Inativas" },
            ] as const
          ).map((s) => (
            <button
              key={s.v}
              onClick={() => setFiltroAtivo(s.v)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroAtivo === s.v ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando equipes...
        </p>
      ) : filtrada.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhuma equipe encontrada.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtrada.map((eq) => {
            const cor = corDoTipo(eq.tipo);
            const membros = eq.colaboradores ?? [];
            return (
              <div
                key={eq.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                style={{ borderTopColor: cor, borderTopWidth: 3 }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">
                          {eq.nome}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            color: eq.ativo ? "#10b981" : "#64748b",
                            backgroundColor: eq.ativo
                              ? "#10b98120"
                              : "#64748b20",
                          }}
                        >
                          {eq.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: cor }}>
                        {labelDoTipo(eq.tipo)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {membros.length}
                      </div>
                      <div className="text-gray-400 text-xs">membros</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-20 shrink-0">Líder</span>
                      <span className="text-white">
                        {eq.lider?.nome ?? "—"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-20 shrink-0">
                        Contrato
                      </span>
                      <span className="text-white">
                        {eq.contrato?.numero ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {membros.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        title={`${m.nome} — ${m.funcao}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          backgroundColor: `${cor}40`,
                          border: `1px solid ${cor}60`,
                        }}
                      >
                        {m.nome
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    ))}
                    {membros.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
                        +{membros.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-4 flex gap-2 border-t border-white/10 pt-3">
                  <button
                    onClick={() => setDetalhe(eq)}
                    className="flex-1 text-xs text-gray-400 hover:text-white py-1.5 border border-white/10 rounded-lg transition-colors"
                  >
                    Ver Membros
                  </button>
                  {podeEditar && (
                    <button
                      onClick={() => {
                        setModalMembro(eq);
                        setFormMembro({
                          colaborador_id: "",
                          funcao_equipe: "",
                        });
                      }}
                      className="flex-1 text-xs text-[#f97316] hover:text-orange-400 py-1.5 border border-[#f97316]/30 rounded-lg transition-colors"
                    >
                      + Membro
                    </button>
                  )}
                  {podeEditar && (
                    <select
                      value={String(eq.ativo)}
                      onChange={(e) =>
                        alterarAtivo(eq.id, e.target.value === "true")
                      }
                      className="text-xs bg-transparent border border-white/10 rounded-lg px-2 text-gray-400"
                    >
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detalhe — membros */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.nome} — Membros` : ""}
      >
        {detalhe && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">Tipo:</span>
              <span style={{ color: corDoTipo(detalhe.tipo) }}>
                {labelDoTipo(detalhe.tipo)}
              </span>
              <span className="text-gray-400 ml-2">Líder:</span>
              <span className="text-white">{detalhe.lider?.nome ?? "—"}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {["Matrícula", "Nome", "Função", "Função na Equipe"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-xs text-gray-400 font-medium pb-2 pr-3"
                        >
                          {h}
                        </th>
                      ),
                    )}
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {(detalhe.colaboradores ?? []).map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-gray-400">
                        {m.matricula ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-white">{m.nome}</td>
                      <td className="py-2 pr-3 text-gray-300 text-xs">
                        {m.funcao}
                      </td>
                      <td className="py-2 pr-3 text-gray-400 text-xs">
                        {m.pivot.funcao_na_equipe ?? "—"}
                      </td>
                      {podeEditar && (
                        <td className="py-2">
                          <button
                            onClick={() => removerMembro(detalhe.id, m.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Modal adicionar membro */}
      <GlassModal
        open={!!modalMembro}
        onClose={() => setModalMembro(null)}
        title={`Adicionar Membro — ${modalMembro?.nome ?? ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Colaborador *
            </label>
            <select
              value={formMembro.colaborador_id}
              onChange={(e) =>
                setFormMembro({ ...formMembro, colaborador_id: e.target.value })
              }
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Selecione...</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.funcao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Função na Equipe
            </label>
            <input
              value={formMembro.funcao_equipe}
              onChange={(e) =>
                setFormMembro({ ...formMembro, funcao_equipe: e.target.value })
              }
              placeholder="Operador, Servente, Encarregado..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalMembro(null)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={adicionarMembro}
              disabled={!formMembro.colaborador_id}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Adicionar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

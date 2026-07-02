import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useToast } from "../hooks/useToast";
import { colaboradoresService } from "../services/colaboradores";
import { equipesService } from "../services/equipes";
import { resolveErrorMessage } from "../services/api";
import type {
  StatusColaborador,
  VinculoColaborador,
  Colaborador,
} from "../types";

const STATUS_LABEL: Record<StatusColaborador, string> = {
  ativo: "Ativo",
  afastado: "Afastado",
  ferias: "Férias",
  demitido: "Desligado",
};
const STATUS_COR: Record<StatusColaborador, string> = {
  ativo: "#10b981",
  afastado: "#f97316",
  ferias: "#3b82f6",
  demitido: "#ef4444",
};
const VINCULO_LABEL: Record<VinculoColaborador, string> = {
  clt: "CLT",
  pj: "PJ",
  terceirizado: "Terceirizado",
  estagio: "Estágio",
};

function asoStatus(validade: string | null) {
  if (!validade) return null;
  const d = new Date(validade);
  const hoje = new Date();
  const dias = Math.floor((d.getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return { label: "Vencido", cor: "#ef4444" };
  if (dias < 60) return { label: `Vence em ${dias}d`, cor: "#f97316" };
  return { label: "Regular", cor: "#10b981" };
}

export default function Colaboradores() {
  const toast = useToast();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [totalEquipes, setTotalEquipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroSetor, setFiltroSetor] = useState("todos");
  const [selecionado, setSelecionado] = useState<Colaborador | null>(null);

  useEffect(() => {
    Promise.all([colaboradoresService.listar(), equipesService.listar()])
      .then(([c, e]) => {
        setColaboradores(c);
        setTotalEquipes(e.length);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const setores = [
    "todos",
    ...Array.from(
      new Set(
        colaboradores.map((c) => c.setor).filter((s): s is string => !!s),
      ),
    ),
  ];

  const lista = colaboradores.filter((c) => {
    const okStatus = filtroStatus === "todos" || c.status === filtroStatus;
    const okSetor = filtroSetor === "todos" || c.setor === filtroSetor;
    const b = busca.toLowerCase();
    return (
      okStatus &&
      okSetor &&
      (!b ||
        c.nome.toLowerCase().includes(b) ||
        c.funcao.toLowerCase().includes(b) ||
        (c.matricula ?? "").toLowerCase().includes(b))
    );
  });

  const ativos = colaboradores.filter((c) => c.status === "ativo").length;
  const afastados = colaboradores.filter(
    (c) => c.status === "afastado" || c.status === "ferias",
  ).length;
  const asoAlert = colaboradores.filter((c) => {
    if (!c.aso_validade) return false;
    const dias = Math.floor(
      (new Date(c.aso_validade).getTime() - Date.now()) / 86400000,
    );
    return dias < 60;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Colaboradores</h1>
          <p className="text-gray-400 text-sm mt-1">
            {colaboradores.length} colaboradores cadastrados
          </p>
        </div>
        <button
          onClick={() =>
            toast.info("Cadastro de colaborador disponível em breve.")
          }
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Colaborador
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ativos em Campo", valor: ativos, cor: "#10b981" },
          { label: "Afastados / Férias", valor: afastados, cor: "#f97316" },
          { label: "ASO Vencendo (60d)", valor: asoAlert, cor: "#ef4444" },
          { label: "Total de Equipes", valor: totalEquipes, cor: "#3b82f6" },
        ].map((c) => (
          <GlassCard key={c.label} className="p-4">
            <p className="text-gray-400 text-xs">{c.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: c.cor }}>
              {c.valor}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nome, função ou matrícula..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="afastado">Afastado</option>
            <option value="ferias">Férias</option>
            <option value="demitido">Desligado</option>
          </select>
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
          >
            {setores.map((s) => (
              <option key={s} value={s}>
                {s === "todos" ? "Todos os setores" : s}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando colaboradores...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhum colaborador encontrado.
        </p>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-gray-400 text-xs">
                  <th className="text-left p-4">Matrícula</th>
                  <th className="text-left p-4">Nome / Função</th>
                  <th className="text-left p-4">Setor</th>
                  <th className="text-left p-4">Equipe</th>
                  <th className="text-left p-4">CNH</th>
                  <th className="text-left p-4">ASO</th>
                  <th className="text-left p-4">Vínculo</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => {
                  const aso = asoStatus(c.aso_validade);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelecionado(c)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono text-orange-400 text-xs">
                        {c.matricula ?? "—"}
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{c.nome}</p>
                        <p className="text-gray-500 text-xs">{c.funcao}</p>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {c.setor ?? "—"}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {c.equipes?.map((e) => e.nome).join(", ") || "—"}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {c.cnh_categoria ?? "—"}
                      </td>
                      <td className="p-4">
                        {aso ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: aso.cor + "33",
                              color: aso.cor,
                            }}
                          >
                            {aso.label}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {VINCULO_LABEL[c.vinculo]}
                      </td>
                      <td className="p-4">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: STATUS_COR[c.status] + "33",
                            color: STATUS_COR[c.status],
                          }}
                        >
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <GlassModal
        open={!!selecionado}
        onClose={() => setSelecionado(null)}
        title={selecionado?.nome ?? ""}
      >
        {selecionado && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Matrícula</p>
                <p className="text-white font-mono">
                  {selecionado.matricula ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Função</p>
                <p className="text-white">{selecionado.funcao}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Setor</p>
                <p className="text-white">{selecionado.setor ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Equipe</p>
                <p className="text-white">
                  {selecionado.equipes?.map((e) => e.nome).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Vínculo</p>
                <p className="text-white">
                  {VINCULO_LABEL[selecionado.vinculo]}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Admissão</p>
                <p className="text-white">
                  {selecionado.data_admissao
                    ? new Date(selecionado.data_admissao).toLocaleDateString(
                        "pt-BR",
                      )
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">CNH</p>
                <p className="text-white">
                  {selecionado.cnh_categoria ?? "Não habilitado"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Validade ASO</p>
                <p className="text-white">
                  {selecionado.aso_validade
                    ? new Date(selecionado.aso_validade).toLocaleDateString(
                        "pt-BR",
                      )
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Telefone</p>
                <p className="text-white">{selecionado.telefone ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Status</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_COR[selecionado.status] + "33",
                    color: STATUS_COR[selecionado.status],
                  }}
                >
                  {STATUS_LABEL[selecionado.status]}
                </span>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

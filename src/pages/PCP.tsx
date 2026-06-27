import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type StatusItem = "planejado" | "executado" | "parcial" | "cancelado";

interface ItemPlanejamento {
  id: number;
  equipe: string;
  frente: string;
  servico: string;
  contrato: string;
  data: string;
  quantidade: number;
  unidade: string;
  status: StatusItem;
  responsavel: string;
}

const STATUS_LABEL: Record<StatusItem, string> = {
  planejado: "Planejado",
  executado: "Executado",
  parcial: "Parcial",
  cancelado: "Cancelado",
};
const STATUS_COR: Record<StatusItem, string> = {
  planejado: "#3b82f6",
  executado: "#10b981",
  parcial: "#f97316",
  cancelado: "#ef4444",
};

const EQUIPES = [
  "Equipe A — Pavimentação",
  "Equipe B — Terraplanagem",
  "Equipe C — Drenagem",
  "Equipe D — Manutenção",
];

const hoje = new Date();
function getSegunda(ref: Date) {
  const d = new Date(ref);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function fmtBR(s: string) {
  return s.slice(8, 10) + "/" + s.slice(5, 7);
}

function semana(segunda: Date) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(d.getDate() + i);
    return fmt(d);
  });
}

const DIAS_NOME = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DADOS_INICIAIS: ItemPlanejamento[] = [
  {
    id: 1,
    equipe: "Equipe A — Pavimentação",
    frente: "KM 45–50",
    servico: "Lançamento CBUQ",
    contrato: "CON-2024-001",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 1,
      ),
    ),
    quantidade: 800,
    unidade: "t",
    status: "executado",
    responsavel: "Ricardo",
  },
  {
    id: 2,
    equipe: "Equipe A — Pavimentação",
    frente: "KM 50–55",
    servico: "Imprimação betuminosa",
    contrato: "CON-2024-001",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 2,
      ),
    ),
    quantidade: 5000,
    unidade: "m²",
    status: "executado",
    responsavel: "Ricardo",
  },
  {
    id: 3,
    equipe: "Equipe A — Pavimentação",
    frente: "KM 55–58",
    servico: "Lançamento CBUQ",
    contrato: "CON-2024-001",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 3,
      ),
    ),
    quantidade: 600,
    unidade: "t",
    status: "parcial",
    responsavel: "Ricardo",
  },
  {
    id: 4,
    equipe: "Equipe B — Terraplanagem",
    frente: "Acesso Norte",
    servico: "Corte e aterro",
    contrato: "CON-2024-002",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 1,
      ),
    ),
    quantidade: 2400,
    unidade: "m³",
    status: "executado",
    responsavel: "Ana",
  },
  {
    id: 5,
    equipe: "Equipe B — Terraplanagem",
    frente: "Acesso Norte",
    servico: "Compactação",
    contrato: "CON-2024-002",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 2,
      ),
    ),
    quantidade: 3000,
    unidade: "m²",
    status: "executado",
    responsavel: "Ana",
  },
  {
    id: 6,
    equipe: "Equipe B — Terraplanagem",
    frente: "Acesso Sul",
    servico: "Corte e aterro",
    contrato: "CON-2024-002",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 4,
      ),
    ),
    quantidade: 1800,
    unidade: "m³",
    status: "planejado",
    responsavel: "Ana",
  },
  {
    id: 7,
    equipe: "Equipe C — Drenagem",
    frente: "Rua das Flores",
    servico: "Escavação de vala",
    contrato: "CON-2024-003",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 1,
      ),
    ),
    quantidade: 120,
    unidade: "m",
    status: "executado",
    responsavel: "Fernanda",
  },
  {
    id: 8,
    equipe: "Equipe C — Drenagem",
    frente: "Rua das Flores",
    servico: "Assentamento galerias",
    contrato: "CON-2024-003",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 3,
      ),
    ),
    quantidade: 80,
    unidade: "m",
    status: "planejado",
    responsavel: "Fernanda",
  },
  {
    id: 9,
    equipe: "Equipe D — Manutenção",
    frente: "BR-163 Lote 8",
    servico: "Tapa-buracos",
    contrato: "CON-2024-006",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 2,
      ),
    ),
    quantidade: 45,
    unidade: "m²",
    status: "executado",
    responsavel: "Carlos",
  },
  {
    id: 10,
    equipe: "Equipe D — Manutenção",
    frente: "MT-208 KM 12",
    servico: "Roçada e limpeza",
    contrato: "CON-2024-006",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 5,
      ),
    ),
    quantidade: 8,
    unidade: "km",
    status: "planejado",
    responsavel: "Carlos",
  },
  {
    id: 11,
    equipe: "Equipe A — Pavimentação",
    frente: "KM 58–60",
    servico: "Lançamento CBUQ",
    contrato: "CON-2024-001",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 4,
      ),
    ),
    quantidade: 400,
    unidade: "t",
    status: "planejado",
    responsavel: "Ricardo",
  },
  {
    id: 12,
    equipe: "Equipe C — Drenagem",
    frente: "Rua Ipê",
    servico: "Escavação de vala",
    contrato: "CON-2024-003",
    data: fmt(
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - hoje.getDay() + 5,
      ),
    ),
    quantidade: 60,
    unidade: "m",
    status: "planejado",
    responsavel: "Fernanda",
  },
];

const FORM_VAZIO = {
  equipe: EQUIPES[0],
  frente: "",
  servico: "",
  contrato: "CON-2024-001",
  data: fmt(hoje),
  quantidade: "",
  unidade: "m²",
  status: "planejado" as StatusItem,
  responsavel: "",
};

export default function PCP() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [itens, setItens] = useState<ItemPlanejamento[]>(DADOS_INICIAIS);
  const [segunda, setSegunda] = useState(getSegunda(hoje));
  const [visualizacao, setVisualizacao] = useState<"semanal" | "lista">(
    "semanal",
  );
  const [filtroEquipe, setFiltroEquipe] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<ItemPlanejamento | null>(null);
  const [form, setForm] = useState({ ...FORM_VAZIO });

  const dias = semana(segunda);
  const proximaSegunda = new Date(segunda);
  proximaSegunda.setDate(proximaSegunda.getDate() + 7);
  const segundaAnterior = new Date(segunda);
  segundaAnterior.setDate(segundaAnterior.getDate() - 7);

  const itensSemana = itens.filter((i) => dias.includes(i.data));
  const itensVisiveis = filtroEquipe
    ? itensSemana.filter((i) => i.equipe === filtroEquipe)
    : itensSemana;

  const executados = itens.filter((i) => i.status === "executado").length;
  const planejados = itens.filter((i) => i.status === "planejado").length;
  const parciais = itens.filter((i) => i.status === "parcial").length;

  function abrirNovo(data?: string) {
    setEditando(null);
    setForm({ ...FORM_VAZIO, data: data ?? fmt(hoje) });
    setModal(true);
  }

  function abrirEditar(item: ItemPlanejamento) {
    setEditando(item);
    setForm({
      equipe: item.equipe,
      frente: item.frente,
      servico: item.servico,
      contrato: item.contrato,
      data: item.data,
      quantidade: String(item.quantidade),
      unidade: item.unidade,
      status: item.status,
      responsavel: item.responsavel,
    });
    setModal(true);
  }

  function salvar() {
    if (!form.frente || !form.servico) {
      toast.error("Preencha frente e serviço.");
      return;
    }
    if (editando) {
      setItens((prev) =>
        prev.map((i) =>
          i.id === editando.id
            ? { ...i, ...form, quantidade: Number(form.quantidade) || 0 }
            : i,
        ),
      );
      toast.success("Apontamento atualizado.");
    } else {
      setItens((prev) => [
        ...prev,
        { id: Date.now(), ...form, quantidade: Number(form.quantidade) || 0 },
      ]);
      toast.success("Apontamento registrado.");
    }
    setModal(false);
  }

  function excluir(id: number) {
    if (!confirm("Remover este apontamento?")) return;
    setItens((prev) => prev.filter((i) => i.id !== id));
    toast.success("Apontamento removido.");
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">PCP — Planejamento</h1>
        {podeEditar && (
          <button
            onClick={() => abrirNovo()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Apontamento
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total Programado</div>
          <div className="text-3xl font-bold text-white">{itens.length}</div>
          <div className="text-xs text-gray-400 mt-1">apontamentos</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Executados</div>
          <div className="text-3xl font-bold text-green-400">{executados}</div>
          <div className="text-xs text-gray-400 mt-1">concluídos</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Planejados</div>
          <div className="text-3xl font-bold text-blue-400">{planejados}</div>
          <div className="text-xs text-gray-400 mt-1">a executar</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Parciais</div>
          <div className="text-3xl font-bold text-[#f97316]">{parciais}</div>
          <div className="text-xs text-gray-400 mt-1">em andamento</div>
        </GlassCard>
      </div>

      {/* Controles */}
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
          {EQUIPES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Grade semanal */}
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
              {(filtroEquipe ? [filtroEquipe] : EQUIPES).map((equipe) => (
                <tr key={equipe} className="border-t border-white/5">
                  <td className="py-2 pr-4 text-xs text-gray-300 align-top font-medium leading-tight">
                    {equipe.split(" — ")[0]}
                    <br />
                    <span className="text-gray-500 font-normal">
                      {equipe.split(" — ")[1]}
                    </span>
                  </td>
                  {dias.map((d) => {
                    const cell = itensVisiveis.filter(
                      (i) => i.equipe === equipe && i.data === d,
                    );
                    return (
                      <td key={d} className="py-2 px-1 align-top">
                        <div className="space-y-1 min-h-[40px]">
                          {cell.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => podeEditar && abrirEditar(item)}
                              className="text-xs rounded-md px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: `${STATUS_COR[item.status]}20`,
                                borderLeft: `2px solid ${STATUS_COR[item.status]}`,
                              }}
                              title={`${item.servico} — ${item.quantidade} ${item.unidade}`}
                            >
                              <div className="text-white truncate">
                                {item.servico}
                              </div>
                              <div className="text-gray-400">
                                {item.quantidade} {item.unidade}
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

      {/* Lista */}
      {visualizacao === "lista" && (
        <div className="space-y-2">
          {itens
            .filter((i) => !filtroEquipe || i.equipe === filtroEquipe)
            .sort((a, b) => a.data.localeCompare(b.data))
            .map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4"
                style={{
                  borderLeftColor: STATUS_COR[item.status],
                  borderLeftWidth: 2,
                }}
              >
                <div className="text-gray-400 text-xs font-mono w-14 shrink-0">
                  {fmtBR(item.data)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">
                    {item.servico}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {item.equipe.split(" — ")[0]} · {item.frente} ·{" "}
                    {item.contrato}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white text-sm">
                    {item.quantidade} {item.unidade}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: STATUS_COR[item.status],
                      backgroundColor: `${STATUS_COR[item.status]}20`,
                    }}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                {podeEditar && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => abrirEditar(item)}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(item.id)}
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

      {/* Modal */}
      <GlassModal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? "Editar Apontamento" : "Novo Apontamento"}
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
                  setForm({ ...form, status: e.target.value as StatusItem })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="planejado">Planejado</option>
                <option value="executado">Executado</option>
                <option value="parcial">Parcial</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Equipe</label>
            <select
              value={form.equipe}
              onChange={(e) => setForm({ ...form, equipe: e.target.value })}
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              {EQUIPES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Frente / Local *
              </label>
              <input
                value={form.frente}
                onChange={(e) => setForm({ ...form, frente: e.target.value })}
                placeholder="KM 45–50, Rua A..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Contrato
              </label>
              <input
                value={form.contrato}
                onChange={(e) => setForm({ ...form, contrato: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Serviço *
            </label>
            <input
              value={form.servico}
              onChange={(e) => setForm({ ...form, servico: e.target.value })}
              placeholder="Lançamento CBUQ, Terraplenagem..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={form.quantidade}
                onChange={(e) =>
                  setForm({ ...form, quantidade: e.target.value })
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
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Responsável
            </label>
            <input
              value={form.responsavel}
              onChange={(e) =>
                setForm({ ...form, responsavel: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
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
              disabled={!form.frente || !form.servico}
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

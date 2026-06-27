import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type StatusBM =
  "preparacao" | "enviado" | "em_analise" | "aprovado" | "faturado" | "glosado";

interface ItemMedicao {
  id: number;
  composicao: string;
  descricao: string;
  unidade: string;
  quantidade_contrato: number;
  quantidade_acumulada: number;
  quantidade_periodo: number;
  preco_unitario: number;
}

interface BoletimMedicao {
  id: number;
  codigo: string;
  numero: number;
  contrato: string;
  contrato_codigo: string;
  periodo_inicio: string;
  periodo_fim: string;
  data_envio: string;
  responsavel: string;
  status: StatusBM;
  itens: ItemMedicao[];
  glosa: number;
  observacoes: string;
}

/* ── Labels e cores ─────────────────────────────────────── */

const STATUS_LABEL: Record<StatusBM, string> = {
  preparacao: "Em Preparação",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  faturado: "Faturado",
  glosado: "Glosado",
};
const STATUS_COR: Record<StatusBM, string> = {
  preparacao: "#64748b",
  enviado: "#3b82f6",
  em_analise: "#f97316",
  aprovado: "#10b981",
  faturado: "#8b5cf6",
  glosado: "#ef4444",
};

/* ── Dados fictícios ────────────────────────────────────── */

const boletins: BoletimMedicao[] = [
  {
    id: 1,
    codigo: "BM-2024-001-01",
    numero: 1,
    contrato: "Pavimentação BR-163 — Lote 3 (Sinop/MT)",
    contrato_codigo: "CON-2024-001",
    periodo_inicio: "2024-04-01",
    periodo_fim: "2024-04-30",
    data_envio: "2024-05-05",
    responsavel: "Ricardo",
    status: "faturado",
    glosa: 0,
    observacoes: "Aprovado sem ressalvas. NF 00421 emitida em 08/05/2024.",
    itens: [
      {
        id: 1,
        composicao: "COMP-003",
        descricao: "Corte e aterro — 1ª categoria",
        unidade: "m³",
        quantidade_contrato: 180000,
        quantidade_acumulada: 24800,
        quantidade_periodo: 24800,
        preco_unitario: 18.5,
      },
      {
        id: 2,
        composicao: "COMP-004",
        descricao: "Compactação de aterro — 95% Proctor",
        unidade: "m²",
        quantidade_contrato: 420000,
        quantidade_acumulada: 62000,
        quantidade_periodo: 62000,
        preco_unitario: 3.2,
      },
      {
        id: 3,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa CM-30",
        unidade: "m²",
        quantidade_contrato: 240000,
        quantidade_acumulada: 0,
        quantidade_periodo: 0,
        preco_unitario: 4.8,
      },
    ],
  },
  {
    id: 2,
    codigo: "BM-2024-001-02",
    numero: 2,
    contrato: "Pavimentação BR-163 — Lote 3 (Sinop/MT)",
    contrato_codigo: "CON-2024-001",
    periodo_inicio: "2024-05-01",
    periodo_fim: "2024-05-31",
    data_envio: "2024-06-04",
    responsavel: "Ricardo",
    status: "aprovado",
    glosa: 0,
    observacoes: "Aprovado em 12/06. Aguardando emissão de NF.",
    itens: [
      {
        id: 1,
        composicao: "COMP-003",
        descricao: "Corte e aterro — 1ª categoria",
        unidade: "m³",
        quantidade_contrato: 180000,
        quantidade_acumulada: 61200,
        quantidade_periodo: 36400,
        preco_unitario: 18.5,
      },
      {
        id: 2,
        composicao: "COMP-004",
        descricao: "Compactação de aterro — 95% Proctor",
        unidade: "m²",
        quantidade_contrato: 420000,
        quantidade_acumulada: 148000,
        quantidade_periodo: 86000,
        preco_unitario: 3.2,
      },
      {
        id: 3,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa CM-30",
        unidade: "m²",
        quantidade_contrato: 240000,
        quantidade_acumulada: 48000,
        quantidade_periodo: 48000,
        preco_unitario: 4.8,
      },
    ],
  },
  {
    id: 3,
    codigo: "BM-2024-001-03",
    numero: 3,
    contrato: "Pavimentação BR-163 — Lote 3 (Sinop/MT)",
    contrato_codigo: "CON-2024-001",
    periodo_inicio: "2024-06-01",
    periodo_fim: "2024-06-30",
    data_envio: "",
    responsavel: "Ricardo",
    status: "preparacao",
    glosa: 0,
    observacoes: "",
    itens: [
      {
        id: 1,
        composicao: "COMP-001",
        descricao: "Pavimentação CBUQ — rolamento 4cm",
        unidade: "t",
        quantidade_contrato: 8400,
        quantidade_acumulada: 840,
        quantidade_periodo: 840,
        preco_unitario: 580.0,
      },
      {
        id: 2,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa CM-30",
        unidade: "m²",
        quantidade_contrato: 240000,
        quantidade_acumulada: 96000,
        quantidade_periodo: 48000,
        preco_unitario: 4.8,
      },
      {
        id: 3,
        composicao: "COMP-003",
        descricao: "Corte e aterro — 1ª categoria",
        unidade: "m³",
        quantidade_contrato: 180000,
        quantidade_acumulada: 82000,
        quantidade_periodo: 20800,
        preco_unitario: 18.5,
      },
    ],
  },
  {
    id: 4,
    codigo: "BM-2024-002-01",
    numero: 1,
    contrato: "Drenagem Zona Norte — Fase 1 (Cuiabá)",
    contrato_codigo: "CON-2024-003",
    periodo_inicio: "2024-05-01",
    periodo_fim: "2024-05-31",
    data_envio: "2024-06-02",
    responsavel: "Fernanda",
    status: "em_analise",
    glosa: 0,
    observacoes: "Fiscalização solicitou complementação de diário de obras.",
    itens: [
      {
        id: 1,
        composicao: "COMP-005",
        descricao: "Escavação de vala p/ galeria pluvial",
        unidade: "m",
        quantidade_contrato: 8400,
        quantidade_acumulada: 2240,
        quantidade_periodo: 2240,
        preco_unitario: 42.0,
      },
      {
        id: 2,
        composicao: "COMP-006",
        descricao: "Assentamento galeria D=600mm",
        unidade: "m",
        quantidade_contrato: 7200,
        quantidade_acumulada: 1680,
        quantidade_periodo: 1680,
        preco_unitario: 135.0,
      },
      {
        id: 3,
        composicao: "COMP-010",
        descricao: "Boca de lobo em concreto armado",
        unidade: "un",
        quantidade_contrato: 180,
        quantidade_acumulada: 18,
        quantidade_periodo: 18,
        preco_unitario: 2400.0,
      },
    ],
  },
  {
    id: 5,
    codigo: "BM-2024-004-01",
    numero: 1,
    contrato: "Acesso Industrial — Parque Empresarial (Sinop)",
    contrato_codigo: "CON-2024-002",
    periodo_inicio: "2024-03-01",
    periodo_fim: "2024-03-31",
    data_envio: "2024-04-03",
    responsavel: "Ana",
    status: "glosado",
    glosa: 18400,
    observacoes:
      "Glosa de R$18.400 referente a serviço de tapa-buracos não aprovado pela fiscalização. Contestação enviada em 15/04.",
    itens: [
      {
        id: 1,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa CM-30",
        unidade: "m²",
        quantidade_contrato: 14000,
        quantidade_acumulada: 14000,
        quantidade_periodo: 14000,
        preco_unitario: 4.8,
      },
      {
        id: 2,
        composicao: "COMP-009",
        descricao: "Tapa-buracos com CBUQ a quente",
        unidade: "m²",
        quantidade_contrato: 800,
        quantidade_acumulada: 800,
        quantidade_periodo: 800,
        preco_unitario: 95.0,
      },
      {
        id: 3,
        composicao: "COMP-007",
        descricao: "Sinalização horizontal — faixa",
        unidade: "m",
        quantidade_contrato: 3600,
        quantidade_acumulada: 2800,
        quantidade_periodo: 2800,
        preco_unitario: 8.5,
      },
    ],
  },
];

/* ── Utilitários ─────────────────────────────────────────── */

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function totalBM(bm: BoletimMedicao) {
  return bm.itens.reduce(
    (s, i) => s + i.quantidade_periodo * i.preco_unitario,
    0,
  );
}

function totalAcumulado(bm: BoletimMedicao) {
  return bm.itens.reduce(
    (s, i) => s + i.quantidade_acumulada * i.preco_unitario,
    0,
  );
}

function pctContrato(bm: BoletimMedicao) {
  const totalContrato = bm.itens.reduce(
    (s, i) => s + i.quantidade_contrato * i.preco_unitario,
    0,
  );
  if (totalContrato === 0) return 0;
  return (totalAcumulado(bm) / totalContrato) * 100;
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Medicao() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [lista, setLista] = useState<BoletimMedicao[]>(boletins);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusBM | "">("");
  const [filtroContrato, setFiltroContrato] = useState("");
  const [detalhe, setDetalhe] = useState<BoletimMedicao | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    contrato: "",
    contrato_codigo: "",
    numero: "",
    periodo_inicio: "",
    periodo_fim: "",
    responsavel: "",
    observacoes: "",
  });

  const contratos = [...new Set(lista.map((b) => b.contrato_codigo))];

  const filtrado = lista.filter((b) => {
    const st = !filtroStatus || b.status === filtroStatus;
    const ct = !filtroContrato || b.contrato_codigo === filtroContrato;
    const bk =
      !busca ||
      b.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      b.contrato.toLowerCase().includes(busca.toLowerCase());
    return st && ct && bk;
  });

  /* KPIs */
  const totalMedidoMes = lista
    .filter((b) => ["aprovado", "faturado"].includes(b.status))
    .reduce((s, b) => s + totalBM(b), 0);
  const totalFaturado = lista
    .filter((b) => b.status === "faturado")
    .reduce((s, b) => s + totalBM(b), 0);
  const totalGlosa = lista.reduce((s, b) => s + b.glosa, 0);
  const bmPendentes = lista.filter((b) =>
    ["preparacao", "enviado", "em_analise"].includes(b.status),
  ).length;

  function avancarStatus(id: number) {
    const fluxo: StatusBM[] = [
      "preparacao",
      "enviado",
      "em_analise",
      "aprovado",
      "faturado",
    ];
    setLista((p) =>
      p.map((b) => {
        if (b.id !== id) return b;
        const idx = fluxo.indexOf(b.status);
        if (idx < 0 || idx >= fluxo.length - 1) return b;
        const novo = fluxo[idx + 1];
        toast.success(`BM avançado para: ${STATUS_LABEL[novo]}`);
        return {
          ...b,
          status: novo,
          data_envio:
            novo === "enviado"
              ? new Date().toISOString().split("T")[0]
              : b.data_envio,
        };
      }),
    );
  }

  function salvarNovo() {
    if (!form.codigo || !form.contrato_codigo) {
      toast.error("Preencha o código e o contrato.");
      return;
    }
    const novo: BoletimMedicao = {
      id: Date.now(),
      ...form,
      numero: Number(form.numero) || lista.length + 1,
      contrato: form.contrato || form.contrato_codigo,
      status: "preparacao",
      glosa: 0,
      itens: [],
      data_envio: "",
    };
    setLista((p) => [novo, ...p]);
    toast.success("Boletim criado.");
    setModalNovo(false);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Medição</h1>
        {podeEditar && (
          <button
            onClick={() => {
              setForm({
                codigo: "",
                contrato: "",
                contrato_codigo: "",
                numero: "",
                periodo_inicio: "",
                periodo_fim: "",
                responsavel: user?.name ?? "",
                observacoes: "",
              });
              setModalNovo(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Boletim
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Medido Aprovado</div>
          <div className="text-2xl font-bold text-green-400">
            {moeda(totalMedidoMes)}
          </div>
          <div className="text-xs text-gray-400 mt-1">aprovado + faturado</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total Faturado</div>
          <div className="text-2xl font-bold text-[#f97316]">
            {moeda(totalFaturado)}
          </div>
          <div className="text-xs text-gray-400 mt-1">NF emitida</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">BMs Pendentes</div>
          <div
            className={`text-3xl font-bold ${bmPendentes > 0 ? "text-yellow-400" : "text-green-400"}`}
          >
            {bmPendentes}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            em preparação / enviado / análise
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total Glosado</div>
          <div
            className={`text-2xl font-bold ${totalGlosa > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {moeda(totalGlosa)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {lista.filter((b) => b.status === "glosado").length} boletim(s)
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <select
          value={filtroContrato}
          onChange={(e) => setFiltroContrato(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-w-[140px]"
        >
          <option value="">Todos os Contratos</option>
          {contratos.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            "",
            "preparacao",
            "enviado",
            "em_analise",
            "aprovado",
            "faturado",
            "glosado",
          ] as (StatusBM | "")[]
        ).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s as StatusBM | "")}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatus === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
          >
            {s ? STATUS_LABEL[s as StatusBM] : "Todos"}
          </button>
        ))}
      </div>

      {/* Lista de boletins */}
      <div className="space-y-3">
        {filtrado.length === 0 ? (
          <GlassCard className="text-center py-10">
            <div className="text-gray-400">Nenhum boletim encontrado.</div>
          </GlassCard>
        ) : (
          filtrado.map((bm) => {
            const valorPeriodo = totalBM(bm);
            const pct = pctContrato(bm);
            return (
              <div
                key={bm.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                style={{
                  borderLeftColor: STATUS_COR[bm.status],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-400 text-xs font-mono">
                        {bm.codigo}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_COR[bm.status],
                          backgroundColor: `${STATUS_COR[bm.status]}20`,
                        }}
                      >
                        {STATUS_LABEL[bm.status]}
                      </span>
                      {bm.glosa > 0 && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          Glosa: {moeda(bm.glosa)}
                        </span>
                      )}
                    </div>
                    <div className="text-white font-semibold mt-1">
                      {bm.contrato}
                    </div>
                    <div className="text-gray-400 text-sm mt-0.5">
                      BM nº {bm.numero} · {bm.periodo_inicio} a {bm.periodo_fim}{" "}
                      · Resp.: {bm.responsavel}
                    </div>
                    {/* Barra de progresso do contrato */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Execução acumulada</span>
                        <span>{pct.toFixed(1)}% do contrato</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: STATUS_COR[bm.status],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white font-bold text-xl">
                      {moeda(valorPeriodo)}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {bm.itens.length} serviços medidos
                    </div>
                    {bm.glosa > 0 && (
                      <div className="text-green-400 text-sm font-medium mt-1">
                        {moeda(valorPeriodo - bm.glosa)} líquido
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-500">
                    {bm.data_envio
                      ? `Enviado em ${bm.data_envio}`
                      : "Não enviado"}
                    {bm.observacoes ? ` · ${bm.observacoes}` : ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetalhe(bm)}
                      className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                    >
                      Detalhes
                    </button>
                    {podeEditar &&
                      !["faturado", "glosado"].includes(bm.status) && (
                        <button
                          onClick={() => avancarStatus(bm.id)}
                          className="text-xs text-green-400 hover:text-green-300 px-3 py-1 border border-green-500/30 rounded-lg transition-colors"
                        >
                          Avançar →
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal detalhe BM */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.codigo} — Itens Medidos` : ""}
      >
        {detalhe && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Contrato:</span>{" "}
                <span className="text-white">{detalhe.contrato_codigo}</span>
              </div>
              <div>
                <span className="text-gray-400">Período:</span>{" "}
                <span className="text-white">
                  {detalhe.periodo_inicio} → {detalhe.periodo_fim}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{" "}
                <span style={{ color: STATUS_COR[detalhe.status] }}>
                  {STATUS_LABEL[detalhe.status]}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Responsável:</span>{" "}
                <span className="text-white">{detalhe.responsavel}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {[
                      "Ref.",
                      "Descrição",
                      "Und.",
                      "Qtd. Contrato",
                      "Qtd. Acumulada",
                      "Qtd. Período",
                      "Unit.",
                      "Total Período",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-xs text-gray-400 font-medium pb-2 pr-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalhe.itens.map((i) => {
                    const pctAcum =
                      i.quantidade_contrato > 0
                        ? (
                            (i.quantidade_acumulada / i.quantidade_contrato) *
                            100
                          ).toFixed(1)
                        : "0.0";
                    return (
                      <tr key={i.id} className="border-b border-white/5">
                        <td className="py-2 pr-3 text-xs font-mono text-gray-400">
                          {i.composicao}
                        </td>
                        <td className="py-2 pr-3 text-white text-xs">
                          {i.descricao}
                        </td>
                        <td className="py-2 pr-3 text-gray-400 text-xs">
                          {i.unidade}
                        </td>
                        <td className="py-2 pr-3 text-gray-400 text-xs text-right">
                          {i.quantidade_contrato.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-2 pr-3 text-xs text-right">
                          <span className="text-white">
                            {i.quantidade_acumulada.toLocaleString("pt-BR")}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({pctAcum}%)
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-blue-400 font-medium text-xs text-right">
                          {i.quantidade_periodo.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-2 pr-3 text-gray-300 text-xs text-right">
                          {moeda(i.preco_unitario)}
                        </td>
                        <td className="py-2 text-[#f97316] font-medium text-xs text-right">
                          {moeda(i.quantidade_periodo * i.preco_unitario)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/20">
                    <td
                      colSpan={7}
                      className="pt-3 text-sm font-semibold text-white text-right pr-3"
                    >
                      Total do Período
                    </td>
                    <td className="pt-3 text-[#f97316] font-bold text-right">
                      {moeda(totalBM(detalhe))}
                    </td>
                  </tr>
                  {detalhe.glosa > 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="pt-1 text-xs text-red-400 text-right pr-3"
                      >
                        Glosa
                      </td>
                      <td className="pt-1 text-red-400 font-medium text-right">
                        - {moeda(detalhe.glosa)}
                      </td>
                    </tr>
                  )}
                  {detalhe.glosa > 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="pt-1 text-sm font-bold text-green-400 text-right pr-3"
                      >
                        Líquido a Receber
                      </td>
                      <td className="pt-1 text-green-400 font-bold text-right">
                        {moeda(totalBM(detalhe) - detalhe.glosa)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
            {detalhe.observacoes && (
              <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                {detalhe.observacoes}
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* Modal novo BM */}
      <GlassModal
        open={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Novo Boletim de Medição"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                placeholder="BM-2024-001-01"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Nº do Boletim
              </label>
              <input
                type="number"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código do Contrato *
              </label>
              <select
                value={form.contrato_codigo}
                onChange={(e) =>
                  setForm({ ...form, contrato_codigo: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Selecione...</option>
                <option value="CON-2024-001">CON-2024-001</option>
                <option value="CON-2024-002">CON-2024-002</option>
                <option value="CON-2024-003">CON-2024-003</option>
              </select>
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
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Período — Início
              </label>
              <input
                type="date"
                value={form.periodo_inicio}
                onChange={(e) =>
                  setForm({ ...form, periodo_inicio: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Período — Fim
              </label>
              <input
                type="date"
                value={form.periodo_fim}
                onChange={(e) =>
                  setForm({ ...form, periodo_fim: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalNovo(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarNovo}
              disabled={!form.codigo || !form.contrato_codigo}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Criar Boletim
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

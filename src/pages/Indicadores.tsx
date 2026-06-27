import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";

type Periodo = "mes" | "trimestre" | "ano";

/* ── Tipos de dados ─────────────────────────────────────── */

interface KpiCC {
  centro: string;
  cor: string;
  custo_total: number;
  custo_manutencao: number;
  custo_combustivel: number;
  custo_suprimentos: number;
  horas_trabalhadas: number;
  horas_paradas: number;
  producao_realizada: number;
  producao_unidade: string;
}

interface Veiculo {
  placa: string;
  modelo: string;
  tipo: string;
  centro_custo: string;
  custo_manutencao: number;
  custo_combustivel: number;
  consumo_litros: number;
  horas_operacao: number;
  horas_paradas: number;
  num_os: number;
}

interface TendenciaMensal {
  mes: string;
  manutencao: number;
  combustivel: number;
  suprimentos: number;
}

/* ── Dados fictícios — Mês atual ──────────────────────────── */

const kpis_mes: KpiCC[] = [
  {
    centro: "Conserva DER",
    cor: "#3b82f6",
    custo_total: 284500,
    custo_manutencao: 48200,
    custo_combustivel: 127800,
    custo_suprimentos: 108500,
    horas_trabalhadas: 1420,
    horas_paradas: 96,
    producao_realizada: 4800,
    producao_unidade: "m²",
  },
  {
    centro: "Terraplanagem",
    cor: "#f97316",
    custo_total: 198400,
    custo_manutencao: 62100,
    custo_combustivel: 92300,
    custo_suprimentos: 44000,
    horas_trabalhadas: 980,
    horas_paradas: 140,
    producao_realizada: 22400,
    producao_unidade: "m³",
  },
  {
    centro: "Manutenção",
    cor: "#ef4444",
    custo_total: 96800,
    custo_manutencao: 84600,
    custo_combustivel: 7800,
    custo_suprimentos: 4400,
    horas_trabalhadas: 680,
    horas_paradas: 0,
    producao_realizada: 47,
    producao_unidade: "OS",
  },
  {
    centro: "Engenharia",
    cor: "#10b981",
    custo_total: 54200,
    custo_manutencao: 4800,
    custo_combustivel: 8200,
    custo_suprimentos: 41200,
    horas_trabalhadas: 520,
    horas_paradas: 12,
    producao_realizada: 6,
    producao_unidade: "projetos",
  },
  {
    centro: "Produção",
    cor: "#8b5cf6",
    custo_total: 167300,
    custo_manutencao: 21000,
    custo_combustivel: 98500,
    custo_suprimentos: 47800,
    horas_trabalhadas: 1140,
    horas_paradas: 58,
    producao_realizada: 3200,
    producao_unidade: "t",
  },
  {
    centro: "Geral / Adm",
    cor: "#64748b",
    custo_total: 38900,
    custo_manutencao: 0,
    custo_combustivel: 12400,
    custo_suprimentos: 26500,
    horas_trabalhadas: 0,
    horas_paradas: 0,
    producao_realizada: 0,
    producao_unidade: "",
  },
];

const kpis_tri: KpiCC[] = kpis_mes.map((k) => ({
  ...k,
  custo_total: k.custo_total * 2.92,
  custo_manutencao: k.custo_manutencao * 2.85,
  custo_combustivel: k.custo_combustivel * 3.1,
  custo_suprimentos: k.custo_suprimentos * 2.7,
  horas_trabalhadas: k.horas_trabalhadas * 2.9,
  horas_paradas: k.horas_paradas * 3.2,
  producao_realizada: k.producao_realizada * 2.8,
}));
const kpis_ano: KpiCC[] = kpis_mes.map((k) => ({
  ...k,
  custo_total: k.custo_total * 11.4,
  custo_manutencao: k.custo_manutencao * 10.8,
  custo_combustivel: k.custo_combustivel * 12.0,
  custo_suprimentos: k.custo_suprimentos * 11.1,
  horas_trabalhadas: k.horas_trabalhadas * 11.6,
  horas_paradas: k.horas_paradas * 12.5,
  producao_realizada: k.producao_realizada * 11.3,
}));

const veiculos: Veiculo[] = [
  {
    placa: "QHB-2841",
    modelo: "CAT 336 GC — Escavadeira",
    tipo: "Escavadeira",
    centro_custo: "Terraplanagem",
    custo_manutencao: 24800,
    custo_combustivel: 31200,
    consumo_litros: 4835,
    horas_operacao: 318,
    horas_paradas: 52,
    num_os: 5,
  },
  {
    placa: "MTR-0412",
    modelo: "Motoniveladora CAT 140M3",
    tipo: "Motoniveladora",
    centro_custo: "Conserva DER",
    custo_manutencao: 18400,
    custo_combustivel: 24100,
    consumo_litros: 3736,
    horas_operacao: 274,
    horas_paradas: 28,
    num_os: 3,
  },
  {
    placa: "CMP-1184",
    modelo: "Compactador Dynapac CA250D",
    tipo: "Compactador",
    centro_custo: "Terraplanagem",
    custo_manutencao: 12600,
    custo_combustivel: 16800,
    consumo_litros: 2604,
    horas_operacao: 248,
    horas_paradas: 44,
    num_os: 4,
  },
  {
    placa: "FNT-3320",
    modelo: "Pá-carregadeira CAT 950M",
    tipo: "Pá-carregadeira",
    centro_custo: "Terraplanagem",
    custo_manutencao: 14200,
    custo_combustivel: 21400,
    consumo_litros: 3318,
    horas_operacao: 302,
    horas_paradas: 36,
    num_os: 3,
  },
  {
    placa: "RLO-8851",
    modelo: "Rolo Compactador Dynapac CC2200",
    tipo: "Rolo",
    centro_custo: "Conserva DER",
    custo_manutencao: 8900,
    custo_combustivel: 12100,
    consumo_litros: 1876,
    horas_operacao: 198,
    horas_paradas: 20,
    num_os: 2,
  },
  {
    placa: "CMB-4417",
    modelo: "Caminhão Volvo FH460 — Betoneira",
    tipo: "Caminhão",
    centro_custo: "Engenharia",
    custo_manutencao: 11200,
    custo_combustivel: 18900,
    consumo_litros: 2930,
    horas_operacao: 412,
    horas_paradas: 12,
    num_os: 2,
  },
  {
    placa: "CMB-5523",
    modelo: "Caminhão Basculante MB Axor 2644",
    tipo: "Caminhão",
    centro_custo: "Conserva DER",
    custo_manutencao: 9800,
    custo_combustivel: 22400,
    consumo_litros: 3472,
    horas_operacao: 384,
    horas_paradas: 8,
    num_os: 2,
  },
  {
    placa: "CMB-6610",
    modelo: "Caminhão Tanque Volvo FMX 420",
    tipo: "Caminhão",
    centro_custo: "Produção",
    custo_manutencao: 7400,
    custo_combustivel: 19800,
    consumo_litros: 3070,
    horas_operacao: 396,
    horas_paradas: 6,
    num_os: 1,
  },
  {
    placa: "VAN-1102",
    modelo: "Van Sprinter 415 — Transporte",
    tipo: "Van",
    centro_custo: "Geral / Adm",
    custo_manutencao: 2800,
    custo_combustivel: 6800,
    consumo_litros: 1054,
    horas_operacao: 280,
    horas_paradas: 4,
    num_os: 1,
  },
  {
    placa: "MTB-7730",
    modelo: "Mini-trator John Deere 5075E",
    tipo: "Trator",
    centro_custo: "Conserva DER",
    custo_manutencao: 5600,
    custo_combustivel: 9800,
    consumo_litros: 1519,
    horas_operacao: 184,
    horas_paradas: 8,
    num_os: 2,
  },
];

const tendencia: TendenciaMensal[] = [
  { mes: "Jan", manutencao: 74200, combustivel: 112400, suprimentos: 68800 },
  { mes: "Fev", manutencao: 81400, combustivel: 108900, suprimentos: 72100 },
  { mes: "Mar", manutencao: 69800, combustivel: 118200, suprimentos: 81400 },
  { mes: "Abr", manutencao: 92100, combustivel: 122800, suprimentos: 76600 },
  { mes: "Mai", manutencao: 88400, combustivel: 131200, suprimentos: 69800 },
  { mes: "Jun", manutencao: 220700, combustivel: 347000, suprimentos: 272400 },
];

/* ── Utilitários ─────────────────────────────────────────── */

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function moedaK(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return moeda(v);
}

function BarraHorizontal({
  valor,
  max,
  cor,
  label,
  sublabel,
}: {
  valor: number;
  max: number;
  cor: string;
  label: string;
  sublabel?: string;
}) {
  const pct = max > 0 ? Math.min((valor / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white">{label}</span>
        <span style={{ color: cor }}>{sublabel ?? moedaK(valor)}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: cor }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Indicadores() {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [centroCusto, setCentroCusto] = useState("Todos");
  const [sortVeiculo, setSortVeiculo] = useState<
    "custo_manutencao" | "custo_combustivel" | "horas_paradas"
  >("custo_manutencao");

  const kpis =
    periodo === "mes"
      ? kpis_mes
      : periodo === "trimestre"
        ? kpis_tri
        : kpis_ano;
  const kpisFiltrados =
    centroCusto === "Todos"
      ? kpis
      : kpis.filter((k) => k.centro === centroCusto);

  const totalGeral = kpisFiltrados.reduce((s, k) => s + k.custo_total, 0);
  const totalManutencao = kpisFiltrados.reduce(
    (s, k) => s + k.custo_manutencao,
    0,
  );
  const totalCombustivel = kpisFiltrados.reduce(
    (s, k) => s + k.custo_combustivel,
    0,
  );
  const totalHorasParadas = kpisFiltrados.reduce(
    (s, k) => s + k.horas_paradas,
    0,
  );
  const maxCusto = Math.max(...kpis.map((k) => k.custo_total));

  const veiculosOrdenados = [...veiculos].sort(
    (a, b) => b[sortVeiculo] - a[sortVeiculo],
  );

  const maxTend = Math.max(
    ...tendencia.map((t) => t.manutencao + t.combustivel + t.suprimentos),
  );

  const periodoLabel: Record<Periodo, string> = {
    mes: "Mês atual (jun/24)",
    trimestre: "2° Trimestre 2024",
    ano: "Acumulado 2024",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Indicadores Executivos
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {periodoLabel[periodo]}
          </p>
        </div>
        <div className="flex gap-2">
          {(["mes", "trimestre", "ano"] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodo === p ? "bg-[#f97316] text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              {p === "mes" ? "Mês" : p === "trimestre" ? "Trimestre" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Custo Total</div>
          <div className="text-2xl font-bold text-white">
            {moedaK(totalGeral)}
          </div>
          <div className="text-xs text-gray-400 mt-1">todos os centros</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Manutenção</div>
          <div className="text-2xl font-bold text-red-400">
            {moedaK(totalManutencao)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {totalGeral > 0
              ? ((totalManutencao / totalGeral) * 100).toFixed(1)
              : 0}
            % do custo total
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Combustível</div>
          <div className="text-2xl font-bold text-[#f97316]">
            {moedaK(totalCombustivel)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {totalGeral > 0
              ? ((totalCombustivel / totalGeral) * 100).toFixed(1)
              : 0}
            % do custo total
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Horas Paradas</div>
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(totalHorasParadas).toLocaleString("pt-BR")} h
          </div>
          <div className="text-xs text-gray-400 mt-1">
            indisponibilidade por manutenção
          </div>
        </GlassCard>
      </div>

      {/* Filtro por centro */}
      <div className="flex gap-2 flex-wrap">
        {["Todos", ...kpis_mes.map((k) => k.centro)].map((c) => (
          <button
            key={c}
            onClick={() => setCentroCusto(c)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${centroCusto === c ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Custos por centro de custo */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-white font-semibold mb-4">
            Custo Total por Centro
          </h2>
          <div className="space-y-4">
            {kpisFiltrados.map((k) => (
              <BarraHorizontal
                key={k.centro}
                valor={k.custo_total}
                max={maxCusto}
                cor={k.cor}
                label={k.centro}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-white font-semibold mb-4">
            Detalhamento por Centro
          </h2>
          <div className="space-y-3">
            {kpisFiltrados.map((k) => (
              <div
                key={k.centro}
                className="bg-white/5 rounded-xl p-4"
                style={{ borderLeftColor: k.cor, borderLeftWidth: 3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">
                    {k.centro}
                  </span>
                  <span className="font-bold" style={{ color: k.cor }}>
                    {moedaK(k.custo_total)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Manutenção</span>
                    <div className="text-red-400 font-medium">
                      {moedaK(k.custo_manutencao)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Combustível</span>
                    <div className="text-[#f97316] font-medium">
                      {moedaK(k.custo_combustivel)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Suprimentos</span>
                    <div className="text-blue-400 font-medium">
                      {moedaK(k.custo_suprimentos)}
                    </div>
                  </div>
                </div>
                {k.horas_trabalhadas > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-gray-400">Hrs trabalhadas</span>
                      <div className="text-green-400 font-medium">
                        {Math.round(k.horas_trabalhadas)} h
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Hrs paradas</span>
                      <div className="text-yellow-400 font-medium">
                        {Math.round(k.horas_paradas)} h
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Produção</span>
                      <div className="text-white font-medium">
                        {k.producao_realizada.toLocaleString("pt-BR")}{" "}
                        {k.producao_unidade}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Custos por veículo */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-white font-semibold">
            Custos por Veículo / Equipamento
          </h2>
          <div className="flex gap-2">
            {(
              [
                ["custo_manutencao", "Manutenção"],
                ["custo_combustivel", "Combustível"],
                ["horas_paradas", "Horas Paradas"],
              ] as [typeof sortVeiculo, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setSortVeiculo(k)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortVeiculo === k ? "bg-[#1e3a8a] text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  "Placa / Equipamento",
                  "Tipo",
                  "CC",
                  "Manutenção",
                  "Combustível",
                  "Consumo (L)",
                  "Hrs Op.",
                  "Hrs Paradas",
                  "OS",
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
              {veiculosOrdenados.map((v) => (
                <tr
                  key={v.placa}
                  className="border-b border-white/5 hover:bg-white/3"
                >
                  <td className="py-3 pr-3">
                    <div className="font-mono text-white text-xs">
                      {v.placa}
                    </div>
                    <div className="text-gray-400 text-xs">{v.modelo}</div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {v.tipo}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs text-purple-400">
                    {v.centro_custo}
                  </td>
                  <td className="py-3 pr-3 text-red-400 font-medium text-xs">
                    {moeda(v.custo_manutencao)}
                  </td>
                  <td className="py-3 pr-3 text-[#f97316] font-medium text-xs">
                    {moeda(v.custo_combustivel)}
                  </td>
                  <td className="py-3 pr-3 text-gray-300 text-xs">
                    {v.consumo_litros.toLocaleString("pt-BR")} L
                  </td>
                  <td className="py-3 pr-3 text-green-400 text-xs">
                    {v.horas_operacao} h
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`text-xs font-semibold ${v.horas_paradas > 30 ? "text-red-400" : v.horas_paradas > 15 ? "text-yellow-400" : "text-gray-400"}`}
                    >
                      {v.horas_paradas} h
                    </span>
                  </td>
                  <td className="py-3 text-gray-300 text-xs text-center">
                    {v.num_os}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/20">
                <td
                  colSpan={3}
                  className="pt-3 text-xs text-gray-400 text-right pr-3 font-medium"
                >
                  Total frota
                </td>
                <td className="pt-3 text-red-400 font-bold text-xs">
                  {moeda(veiculos.reduce((s, v) => s + v.custo_manutencao, 0))}
                </td>
                <td className="pt-3 text-[#f97316] font-bold text-xs">
                  {moeda(veiculos.reduce((s, v) => s + v.custo_combustivel, 0))}
                </td>
                <td className="pt-3 text-gray-300 text-xs">
                  {veiculos
                    .reduce((s, v) => s + v.consumo_litros, 0)
                    .toLocaleString("pt-BR")}{" "}
                  L
                </td>
                <td className="pt-3 text-green-400 text-xs">
                  {veiculos.reduce((s, v) => s + v.horas_operacao, 0)} h
                </td>
                <td className="pt-3 text-yellow-400 font-bold text-xs">
                  {veiculos.reduce((s, v) => s + v.horas_paradas, 0)} h
                </td>
                <td className="pt-3 text-gray-300 text-xs text-center">
                  {veiculos.reduce((s, v) => s + v.num_os, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </GlassCard>

      {/* Tendência mensal */}
      <GlassCard>
        <h2 className="text-white font-semibold mb-4">
          Tendência de Custos — 2024
        </h2>
        <div className="space-y-4">
          {tendencia.map((t) => {
            const total = t.manutencao + t.combustivel + t.suprimentos;
            return (
              <div key={t.mes}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white w-8">{t.mes}</span>
                  <span className="text-gray-400">{moedaK(total)}</span>
                </div>
                <div className="h-5 bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-red-500/70 transition-all"
                    style={{ width: `${(t.manutencao / maxTend) * 100}%` }}
                    title={`Manutenção: ${moeda(t.manutencao)}`}
                  />
                  <div
                    className="h-full bg-orange-500/70 transition-all"
                    style={{ width: `${(t.combustivel / maxTend) * 100}%` }}
                    title={`Combustível: ${moeda(t.combustivel)}`}
                  />
                  <div
                    className="h-full bg-blue-500/70 transition-all"
                    style={{ width: `${(t.suprimentos / maxTend) * 100}%` }}
                    title={`Suprimentos: ${moeda(t.suprimentos)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/70 inline-block" />
            Manutenção
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-orange-500/70 inline-block" />
            Combustível
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500/70 inline-block" />
            Suprimentos
          </div>
        </div>
      </GlassCard>

      {/* Indicadores de disponibilidade */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard>
          <h2 className="text-white font-semibold mb-4">
            Disponibilidade Mecânica
          </h2>
          <div className="space-y-3">
            {veiculosOrdenados.slice(0, 6).map((v) => {
              const disp =
                v.horas_operacao / (v.horas_operacao + v.horas_paradas);
              return (
                <BarraHorizontal
                  key={v.placa}
                  valor={disp}
                  max={1}
                  cor={
                    disp >= 0.92
                      ? "#10b981"
                      : disp >= 0.8
                        ? "#f97316"
                        : "#ef4444"
                  }
                  label={v.placa}
                  sublabel={`${(disp * 100).toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span className="text-green-400">≥ 92% OK</span>
            <span className="text-[#f97316]">80–92% Atenção</span>
            <span className="text-red-400">&lt; 80% Crítico</span>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-white font-semibold mb-4">
            Top Gasto — Manutenção
          </h2>
          <div className="space-y-3">
            {[...veiculos]
              .sort((a, b) => b.custo_manutencao - a.custo_manutencao)
              .slice(0, 6)
              .map((v) => (
                <BarraHorizontal
                  key={v.placa}
                  valor={v.custo_manutencao}
                  max={veiculos[0].custo_manutencao + 2000}
                  cor="#ef4444"
                  label={v.placa}
                />
              ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-white font-semibold mb-4">
            Top Gasto — Combustível
          </h2>
          <div className="space-y-3">
            {[...veiculos]
              .sort((a, b) => b.custo_combustivel - a.custo_combustivel)
              .slice(0, 6)
              .map((v) => (
                <BarraHorizontal
                  key={v.placa}
                  valor={v.custo_combustivel}
                  max={veiculos[0].custo_combustivel + 2000}
                  cor="#f97316"
                  label={v.placa}
                />
              ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

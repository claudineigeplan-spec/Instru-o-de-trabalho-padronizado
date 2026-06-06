import { useEffect, useState } from "react";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";

interface VisaoGeral {
  total: number;
  concluidas: number;
  canceladas: number;
  em_aberto: number;
  vencidas: number;
  tempo_medio_horas: number | null;
}

interface ManutencaoTipo {
  tipo: string;
  total: number;
}

interface ManutencaoDia {
  data: string;
  total: number;
  concluidas: number;
}

interface Mecanico {
  id: number;
  name: string;
  total_atribuidas: number;
  concluidas: number;
}

interface Equipamento {
  id: number;
  nome: string;
  modelo: string | null;
  fabricante: string | null;
  total_ordens: number;
}

interface Instrucao {
  id: number;
  titulo: string;
  tipo: string;
  usos: number;
}

interface ChecklistsStats {
  total: number;
  anomalias: number;
  taxa: number;
}

interface RelatorioData {
  periodo: { inicio: string; fim: string };
  visao_geral: VisaoGeral;
  manutencoes_por_tipo: ManutencaoTipo[];
  manutencoes_por_dia: ManutencaoDia[];
  desempenho_mecanicos: Mecanico[];
  equipamentos_freq: Equipamento[];
  instrucoes_usadas: Instrucao[];
  checklists_anomalias: ChecklistsStats;
}

const PERIODOS = [
  { label: "Últimos 7 dias", value: 7 },
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
  { label: "Este ano", value: 365 },
];

const TIPO_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  preditiva: "Preditiva",
};

export default function Relatorios() {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function carregar(p: number) {
    setLoading(true);
    try {
      const r = await api.get<RelatorioData>(`/relatorios?periodo=${p}`);
      setData(r.data);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar(periodo);
  }, [periodo]);

  function exportarCSV() {
    if (!data) return;

    const linhas = [
      ["Período", data.periodo.inicio, data.periodo.fim],
      [],
      ["VISÃO GERAL"],
      ["Total de ordens", data.visao_geral.total],
      ["Concluídas", data.visao_geral.concluidas],
      ["Em aberto", data.visao_geral.em_aberto],
      ["Canceladas", data.visao_geral.canceladas],
      ["Vencidas", data.visao_geral.vencidas],
      [
        "Tempo médio (h)",
        data.visao_geral.tempo_medio_horas?.toFixed(1) ?? "—",
      ],
      [],
      ["DESEMPENHO DE MECÂNICOS"],
      ["Nome", "Atribuídas", "Concluídas"],
      ...data.desempenho_mecanicos.map((m) => [
        m.name,
        m.total_atribuidas,
        m.concluidas,
      ]),
      [],
      ["EQUIPAMENTOS COM MAIS MANUTENÇÕES"],
      ["Equipamento", "Fabricante", "Modelo", "Total"],
      ...data.equipamentos_freq.map((e) => [
        e.nome,
        e.fabricante ?? "",
        e.modelo ?? "",
        e.total_ordens,
      ]),
    ];

    const csv = linhas.map((l) => l.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${data.periodo.inicio}-${data.periodo.fim}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  periodo === p.value
                    ? "bg-[#1e3a8a] text-white font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportarCSV}
            disabled={!data}
            className="flex items-center gap-2 text-xs bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Carregando...</div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* Visão Geral */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "Total",
                value: data.visao_geral.total,
                color: "text-white",
              },
              {
                label: "Concluídas",
                value: data.visao_geral.concluidas,
                color: "text-green-400",
              },
              {
                label: "Em aberto",
                value: data.visao_geral.em_aberto,
                color: "text-blue-400",
              },
              {
                label: "Canceladas",
                value: data.visao_geral.canceladas,
                color: "text-gray-400",
              },
              {
                label: "Vencidas",
                value: data.visao_geral.vencidas,
                color: "text-red-400",
              },
              {
                label: "Tempo médio",
                value: data.visao_geral.tempo_medio_horas
                  ? `${data.visao_geral.tempo_medio_horas.toFixed(0)}h`
                  : "—",
                color: "text-[#f97316]",
              },
            ].map((card) => (
              <GlassCard key={card.label}>
                <div className="text-gray-400 text-xs mb-1">{card.label}</div>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Manutenções por tipo */}
            <GlassCard>
              <h3 className="text-white font-semibold mb-4">
                Por Tipo de Manutenção
              </h3>
              {data.manutencoes_por_tipo.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-6">
                  Sem dados no período
                </div>
              ) : (
                <div className="space-y-3">
                  {data.manutencoes_por_tipo.map((item) => {
                    const pct =
                      data.visao_geral.total > 0
                        ? Math.round(
                            (item.total / data.visao_geral.total) * 100,
                          )
                        : 0;
                    return (
                      <div key={item.tipo}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">
                            {TIPO_LABEL[item.tipo] ?? item.tipo}
                          </span>
                          <span className="text-white font-medium">
                            {item.total}{" "}
                            <span className="text-gray-500">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full">
                          <div
                            className="h-1.5 bg-[#f97316] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Checklists */}
            <GlassCard>
              <h3 className="text-white font-semibold mb-4">
                Checklists Pré-Operacionais
              </h3>
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {data.checklists_anomalias.total}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Realizados</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${data.checklists_anomalias.anomalias > 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    {data.checklists_anomalias.anomalias}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Anomalias</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${data.checklists_anomalias.taxa > 10 ? "text-red-400" : "text-[#f97316]"}`}
                  >
                    {data.checklists_anomalias.taxa}%
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Taxa</div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Desempenho dos Mecânicos */}
          <GlassCard>
            <h3 className="text-white font-semibold mb-4">
              Desempenho por Mecânico
            </h3>
            {data.desempenho_mecanicos.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-6">
                Sem dados no período
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs border-b border-white/10">
                      <th className="pb-3 font-medium">Mecânico</th>
                      <th className="pb-3 font-medium text-right">
                        Atribuídas
                      </th>
                      <th className="pb-3 font-medium text-right">
                        Concluídas
                      </th>
                      <th className="pb-3 font-medium text-right">Taxa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.desempenho_mecanicos.map((m) => {
                      const taxa =
                        m.total_atribuidas > 0
                          ? Math.round(
                              (m.concluidas / m.total_atribuidas) * 100,
                            )
                          : 0;
                      return (
                        <tr key={m.id}>
                          <td className="py-3 text-white">{m.name}</td>
                          <td className="py-3 text-right text-gray-300">
                            {m.total_atribuidas}
                          </td>
                          <td className="py-3 text-right text-green-400">
                            {m.concluidas}
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`font-medium ${taxa >= 80 ? "text-green-400" : taxa >= 50 ? "text-[#f97316]" : "text-red-400"}`}
                            >
                              {taxa}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Equipamentos com mais manutenções */}
            <GlassCard>
              <h3 className="text-white font-semibold mb-4">
                Equipamentos — Maior Frequência
              </h3>
              {data.equipamentos_freq.filter((e) => e.total_ordens > 0)
                .length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-6">
                  Sem dados no período
                </div>
              ) : (
                <div className="space-y-2">
                  {data.equipamentos_freq
                    .filter((e) => e.total_ordens > 0)
                    .slice(0, 6)
                    .map((eq, i) => (
                      <div key={eq.id} className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs w-4">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">
                            {eq.nome}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {[eq.fabricante, eq.modelo]
                              .filter(Boolean)
                              .join(" ")}
                          </div>
                        </div>
                        <span className="text-[#f97316] font-bold text-sm">
                          {eq.total_ordens}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </GlassCard>

            {/* Instruções mais utilizadas */}
            <GlassCard>
              <h3 className="text-white font-semibold mb-4">
                Instruções Mais Utilizadas
              </h3>
              {data.instrucoes_usadas.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-6">
                  Sem dados no período
                </div>
              ) : (
                <div className="space-y-2">
                  {data.instrucoes_usadas.slice(0, 6).map((it, i) => (
                    <div key={it.id} className="flex items-center gap-3">
                      <span className="text-gray-600 text-xs w-4">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">
                          {it.titulo}
                        </div>
                        <div className="text-gray-500 text-xs capitalize">
                          {TIPO_LABEL[it.tipo] ?? it.tipo}
                        </div>
                      </div>
                      <span className="text-[#f97316] font-bold text-sm">
                        {it.usos}×
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

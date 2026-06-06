import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import type { DashboardData } from "../types";
import { formatDateTime } from "../utils/format";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/dashboard").then((r) => {
      setData(r.data);
    }).catch((err) => {
      setError(err?.response?.data?.message ?? "Erro ao carregar dashboard. Tente recarregar a página.");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-center">
          <div className="font-semibold mb-1">Erro ao carregar</div>
          <div className="text-sm">{error}</div>
          <button onClick={() => window.location.reload()} className="mt-3 text-xs text-red-300 underline">Recarregar</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isMecanico = user?.role === "mecanico";
  const isOperador = user?.role === "operador";

  const labelOrdens = isMecanico
    ? {
        abertas: "Minhas OS Abertas",
        em_andamento: "Em Execução",
        concluidas: "Concluídas (mês)",
        vencidas: "Vencidas",
      }
    : isOperador
      ? {
          abertas: "Minhas Solicitações",
          em_andamento: "Em Andamento",
          concluidas: "Resolvidas (mês)",
          vencidas: "",
        }
      : {
          abertas: "Manutenções Abertas",
          em_andamento: "Em Andamento",
          concluidas: "Concluídas (mês)",
          vencidas: "Vencidas",
        };

  const labelChecklist = isOperador
    ? "Meus Checklists Hoje"
    : "Checklists Hoje";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        {isMecanico ? "Meu Painel" : isOperador ? "Meu Painel" : "Dashboard"}
      </h1>

      {/* Ação rápida para operador / mecânico */}
      {(isOperador || isMecanico) && (
        <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-semibold text-sm">
              {isMecanico
                ? "Registrar execução de checklist"
                : "Realizar checklist do dia"}
            </div>
            <div className="text-gray-400 text-xs mt-0.5">
              Escaneie o QR Code do equipamento ou selecione abaixo
            </div>
          </div>
          <button
            onClick={() => navigate("/checklists")}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-5 py-2.5 rounded-lg text-sm shrink-0 transition-colors"
          >
            Executar Checklist
          </button>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Frota</div>
          <div className="text-3xl font-bold text-white">
            {data.equipamentos.total}
          </div>
          <div className="mt-2 space-y-0.5 text-xs">
            <div className="text-green-400">
              {data.equipamentos.ativos} ativos
            </div>
            <div className="text-yellow-400">
              {data.equipamentos.em_manutencao} em manutenção
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">
            {labelOrdens.abertas}
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {data.ordens.abertas}
          </div>
          <div className="mt-2 space-y-0.5 text-xs">
            <div className="text-yellow-400">
              {data.ordens.em_andamento}{" "}
              {labelOrdens.em_andamento.toLowerCase()}
            </div>
            {!isOperador && (
              <div className="text-red-400">
                {data.ordens.vencidas} vencidas
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Alertas Novos</div>
          <div
            className={`text-3xl font-bold ${data.alertas_count > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {data.alertas_count}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <Link to="/alertas" className="hover:text-white">
              Ver todos →
            </Link>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">{labelChecklist}</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {data.checklists_hoje}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {labelOrdens.concluidas}: {data.ordens.concluidas_mes}
          </div>
        </GlassCard>
      </div>

      {/* Atalhos rápidos para gestor/lider_campo */}
      {!isMecanico && !isOperador && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Frota",
              sub: `${data.equipamentos.total} equipamentos`,
              icon: "🚛",
              to: "/equipamentos",
            },
            {
              label: "Checklists",
              sub: `${data.checklists_hoje} hoje`,
              icon: "✅",
              to: "/checklists",
            },
            {
              label: "Ordens de Serviço",
              sub: `${data.ordens.abertas} abertas`,
              icon: "🔩",
              to: "/ordens-servico",
            },
          ].map(({ label, sub, icon, to }) => (
            <Link
              key={to}
              to={to}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors group"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-white text-sm font-medium group-hover:text-[#f97316] transition-colors">
                {label}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">{sub}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* OS pendentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">
              {isMecanico
                ? "Minhas Ordens Pendentes"
                : isOperador
                  ? "Minhas Solicitações Pendentes"
                  : "Manutenções Pendentes"}
            </h2>
            <Link
              to="/ordens-servico"
              className="text-xs text-[#f97316] hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {data.os_recentes.length === 0 ? (
              <GlassCard>
                <div className="text-gray-400 text-sm text-center py-4">
                  {isMecanico
                    ? "Nenhuma OS atribuída a você"
                    : "Nenhuma OS pendente"}
                </div>
              </GlassCard>
            ) : (
              data.os_recentes.map((os) => (
                <GlassCard key={os.id} className="!p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {os.titulo}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        🔧 {os.equipamento?.nome}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={os.status} />
                      <StatusBadge status={os.prioridade} />
                    </div>
                  </div>
                  {os.tecnico && !isMecanico && (
                    <div className="text-xs text-gray-500 mt-1">
                      👷 Mecânico: {os.tecnico.name}
                    </div>
                  )}
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Alertas recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Alertas Recentes</h2>
            <Link
              to="/alertas"
              className="text-xs text-[#f97316] hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {data.alertas_recentes.length === 0 ? (
              <GlassCard>
                <div className="text-gray-400 text-sm text-center py-4">
                  Nenhum alerta novo
                </div>
              </GlassCard>
            ) : (
              data.alertas_recentes.map((alerta) => (
                <GlassCard key={alerta.id} className="!p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0">
                      {alerta.tipo.includes("vencida") ||
                      alerta.tipo === "checklist_anomalia"
                        ? "🔴"
                        : alerta.tipo.includes("vencendo")
                          ? "🟡"
                          : "🔵"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm leading-snug">
                        {alerta.mensagem}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {formatDateTime(alerta.created_at)}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import type { DashboardData } from "../types";
import { formatDateTime } from "../utils/format";

/* ── Dados do painel executivo (modo demo / fallback) ───── */

const CONTRATOS_MOCK = [
  {
    codigo: "CON-2024-001",
    nome: "Pavimentação BR-163 — Lote 3",
    valor: 18400000,
    executado: 38,
    status: "ativo",
    cor: "#10b981",
  },
  {
    codigo: "CON-2024-002",
    nome: "Acesso Industrial — Parque Emp.",
    valor: 4200000,
    executado: 100,
    status: "concluido",
    cor: "#64748b",
  },
  {
    codigo: "CON-2024-003",
    nome: "Drenagem Zona Norte — Cuiabá",
    valor: 7800000,
    executado: 22,
    status: "ativo",
    cor: "#3b82f6",
  },
  {
    codigo: "CON-2024-004",
    nome: "Conservação MT-208 — Lote 12",
    valor: 3100000,
    executado: 61,
    status: "ativo",
    cor: "#f97316",
  },
];

const ATIVIDADE_MOCK = [
  {
    icone: "📐",
    texto: "BM-2024-001-02 aprovado pela SINFRA",
    tempo: "há 2h",
    cor: "#10b981",
  },
  {
    icone: "📲",
    texto: "9 apontamentos enviados pela Equipe B",
    tempo: "há 3h",
    cor: "#3b82f6",
  },
  {
    icone: "⚠️",
    texto: "Estoque de CBUQ zerado — reposição pendente",
    tempo: "há 4h",
    cor: "#ef4444",
  },
  {
    icone: "🛠️",
    texto: "OS-0142 concluída: revisão CAT 336 GC",
    tempo: "há 5h",
    cor: "#f97316",
  },
  {
    icone: "📦",
    texto: "PC-2024-020 recebido parcialmente (60t CBUQ)",
    tempo: "há 6h",
    cor: "#8b5cf6",
  },
  {
    icone: "🗓️",
    texto: "PCP semana 27 publicado para todas as equipes",
    tempo: "ontem",
    cor: "#06b6d4",
  },
  {
    icone: "✅",
    texto: "15 checklists pré-operacionais realizados hoje",
    tempo: "ontem",
    cor: "#10b981",
  },
];

const ALERTAS_MOCK = [
  {
    tipo: "critico",
    texto: "Correia dentada Randon 2018 abaixo do estoque mínimo",
    modulo: "/suprimentos",
  },
  {
    tipo: "critico",
    texto: "Apontamento APT-2024-0619-D1 rejeitado — aguarda reenvio",
    modulo: "/apontamento",
  },
  {
    tipo: "atencao",
    texto: "BM-2024-002-01 em análise há 12 dias — cobrar fiscalização",
    modulo: "/medicao",
  },
  {
    tipo: "atencao",
    texto: "Carreta CRT-9910 em manutenção — 3 viagens postergadas",
    modulo: "/logistica",
  },
  {
    tipo: "info",
    texto: "3 requisições pendentes de aprovação em Suprimentos",
    modulo: "/suprimentos",
  },
];

const MODULOS_RAPIDOS = [
  {
    label: "Projetos",
    sub: "4 contratos ativos",
    icon: "📁",
    to: "/projetos",
    cor: "#f97316",
  },
  {
    label: "PCP",
    sub: "Semana 27 publicada",
    icon: "🗓️",
    to: "/pcp",
    cor: "#8b5cf6",
  },
  {
    label: "Medição",
    sub: "2 BMs em andamento",
    icon: "📐",
    to: "/medicao",
    cor: "#10b981",
  },
  {
    label: "Apontamento",
    sub: "9 enviados hoje",
    icon: "📲",
    to: "/apontamento",
    cor: "#3b82f6",
  },
  {
    label: "Suprimentos",
    sub: "3 requisições pendentes",
    icon: "📦",
    to: "/suprimentos",
    cor: "#06b6d4",
  },
  {
    label: "Manutenção",
    sub: "5 OS abertas",
    icon: "🛠️",
    to: "/manutencao",
    cor: "#ef4444",
  },
  {
    label: "Logística",
    sub: "3 veículos em viagem",
    icon: "🚛",
    to: "/logistica",
    cor: "#f5c518",
  },
  {
    label: "Engenharia",
    sub: "2 orçamentos em elaboração",
    icon: "⚙️",
    to: "/engenharia",
    cor: "#a78bfa",
  },
  {
    label: "Indicadores",
    sub: "R$ 840K custo mês",
    icon: "📉",
    to: "/indicadores",
    cor: "#64748b",
  },
  {
    label: "Equipes",
    sub: "4 equipes em campo",
    icon: "👷",
    to: "/equipes",
    cor: "#10b981",
  },
  {
    label: "Logística",
    sub: "8 abastecimentos registrados",
    icon: "⛽",
    to: "/logistica",
    cor: "#f97316",
  },
  {
    label: "Relatórios",
    sub: "Atualizado hoje",
    icon: "📈",
    to: "/relatorios",
    cor: "#3b82f6",
  },
];

function moeda(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ── Painel executivo (sem API) ─────────────────────────── */

function PainelExecutivo() {
  const { user } = useAuth();
  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="p-6 space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {saudacao}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Visão executiva · PRIMUS SGI ·{" "}
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Contratos Ativos</div>
          <div className="text-3xl font-bold text-white">4</div>
          <div className="text-xs text-[#f97316] mt-1">
            R$ 33,5M em carteira
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Medição do Mês</div>
          <div className="text-2xl font-bold text-green-400">R$ 1,4M</div>
          <div className="text-xs text-gray-400 mt-1">2 BMs em análise</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Custo Operacional</div>
          <div className="text-2xl font-bold text-[#f97316]">R$ 840K</div>
          <div className="text-xs text-gray-400 mt-1">
            jun/2024 · todos os centros
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Equipes em Campo</div>
          <div className="text-3xl font-bold text-blue-400">4</div>
          <div className="text-xs text-gray-400 mt-1">
            23 colaboradores hoje
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contratos — andamento */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              Andamento dos Contratos
            </h2>
            <Link
              to="/projetos"
              className="text-xs text-[#f97316] hover:underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {CONTRATOS_MOCK.map((c) => (
              <div
                key={c.codigo}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white text-sm font-medium">
                      {c.nome}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {c.codigo} · {moeda(c.valor)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: c.cor }}>
                      {c.executado}%
                    </div>
                    <div className="text-xs text-gray-500">{c.status}</div>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.executado}%`, backgroundColor: c.cor }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Atalhos de módulos */}
          <div>
            <h2 className="text-white font-semibold mb-3">Acesso Rápido</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MODULOS_RAPIDOS.slice(0, 8).map(({ label, icon, to, cor }) => (
                <Link
                  key={`${to}-${label}`}
                  to={to}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center transition-all group hover:border-white/20"
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-white text-xs font-medium group-hover:text-[#f97316] transition-colors leading-tight">
                    {label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          {/* Alertas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Alertas</h2>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                {ALERTAS_MOCK.filter((a) => a.tipo === "critico").length}{" "}
                críticos
              </span>
            </div>
            <div className="space-y-2">
              {ALERTAS_MOCK.map((a, i) => (
                <Link
                  key={i}
                  to={a.modulo}
                  className="flex items-start gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-3 transition-all group"
                >
                  <span className="text-sm shrink-0 mt-0.5">
                    {a.tipo === "critico"
                      ? "🔴"
                      : a.tipo === "atencao"
                        ? "🟡"
                        : "🔵"}
                  </span>
                  <span className="text-xs text-gray-300 group-hover:text-white leading-relaxed">
                    {a.texto}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Atividade recente */}
          <div>
            <h2 className="text-white font-semibold mb-3">Atividade Recente</h2>
            <div className="space-y-2">
              {ATIVIDADE_MOCK.slice(0, 5).map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-base shrink-0">{a.icone}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300 leading-relaxed">
                      {a.texto}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {a.tempo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Painel operador / mecânico (com API) ────────────────── */

function PainelOperacional({ data }: { data: DashboardData }) {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        {isMecanico || isOperador ? "Meu Painel" : "Dashboard"}
      </h1>

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
          <div className="text-gray-400 text-xs mb-1">Checklists Hoje</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {data.checklists_hoje}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {labelOrdens.concluidas}: {data.ordens.concluidas_mes}
          </div>
        </GlassCard>
      </div>

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
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">
              {isMecanico
                ? "Minhas Ordens Pendentes"
                : isOperador
                  ? "Minhas Solicitações"
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
                  Nenhuma OS pendente
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

/* ═══════════════════════════════════════════════════════════
   Componente raiz
═══════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);

  const isGestorOuLider =
    user?.role === "gestor" || user?.role === "lider_campo";

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then((r) => {
        setData(r.data);
        setApiOk(true);
      })
      .catch(() => {
        setApiOk(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  /* Gestor/líder sem API → painel executivo mock */
  if (isGestorOuLider && (!apiOk || !data)) {
    return <PainelExecutivo />;
  }

  /* API ok → painel com dados reais */
  if (apiOk && data) {
    /* Gestor com API → painel executivo + link para dados reais */
    if (isGestorOuLider) return <PainelExecutivo />;
    return <PainelOperacional data={data} />;
  }

  /* Mecânico/operador sem API → painel executivo adaptado */
  return <PainelExecutivo />;
}

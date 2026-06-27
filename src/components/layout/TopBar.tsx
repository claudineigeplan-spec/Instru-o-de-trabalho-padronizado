import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

const TITULO_ROTA: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/projetos":     "Projetos e Contratos",
  "/engenharia":   "Engenharia",
  "/pcp":          "PCP — Planejamento",
  "/medicao":      "Medição",
  "/logistica":    "Logística",
  "/apontamento":  "Apontamento de Campo",
  "/equipes":      "Equipes",
  "/manutencao":   "Manutenção",
  "/suprimentos":  "Suprimentos",
  "/indicadores":  "Indicadores Executivos",
  "/instrucoes":   "Instruções de Trabalho",
  "/checklists":   "Checklists",
  "/relatorios":   "Relatórios",
  "/usuarios":     "Usuários",
  "/equipamentos": "Frota",
  "/ordens-servico": "Ordens de Manutenção",
  "/planos":       "Planos de Manutenção",
  "/alertas":      "Alertas",
  "/estoque":      "Estoque",
};

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [alertasNovos, setAlertasNovos] = useState(0);

  const titulo = TITULO_ROTA[location.pathname] ?? "PRIMUS SGI";

  useEffect(() => {
    api
      .get<{ count: number }>("/alertas?apenas_count=1")
      .then((r) => setAlertasNovos(r.data?.count ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <header className="h-14 bg-[#0a1628]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
      <h2 className="text-white font-semibold text-sm">{titulo}</h2>

      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button
          onClick={() => navigate("/alertas")}
          className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Alertas"
        >
          <span className="text-gray-400 text-base">🔔</span>
          {alertasNovos > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#f97316] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {alertasNovos > 99 ? "99+" : alertasNovos}
            </span>
          )}
        </button>

        {/* Painel Administrativo — só gestor */}
        {user?.role === "gestor" && (
          <button
            onClick={() => navigate("/usuarios")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 hover:border-[#f97316]/40 px-3 py-1.5 rounded-lg transition-all"
          >
            <span>⚙️</span>
            <span>Painel Admin</span>
          </button>
        )}

        {/* Usuário */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="hidden sm:block">
            <div className="text-white text-xs font-medium leading-tight">
              {user?.name}
            </div>
            <div className="text-[#f97316] text-[10px]">
              {user?.role === "gestor"
                ? "Gestor / Diretoria"
                : user?.role === "lider_campo"
                  ? "Gestão / PCP"
                  : user?.role === "mecanico"
                    ? "Mecânico"
                    : "Operador / Motorista"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

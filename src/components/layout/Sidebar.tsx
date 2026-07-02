import { NavLink, Link, useNavigate } from "react-router-dom";
import LogoPrimus from "../ui/LogoPrimus";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { formatRole } from "../../utils/format";
import type { Role } from "../../types";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: Role[];
}

interface NavGroup {
  label: string;
  icon: string;
  roles?: Role[];
  items: NavItem[];
}

const GRUPOS: NavGroup[] = [
  {
    label: "Visão Geral",
    icon: "📊",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: "📊" },
      {
        path: "/indicadores",
        label: "Indicadores Executivos",
        icon: "📉",
        roles: ["gestor", "diretor", "engenheiro", "pcp"],
      },
    ],
  },
  {
    label: "Contratos & Projetos",
    icon: "📁",
    roles: [
      "gestor",
      "diretor",
      "engenheiro",
      "pcp",
      "lider_campo",
      "financeiro",
    ],
    items: [
      { path: "/projetos", label: "Projetos e Contratos", icon: "📁" },
      { path: "/centros-custo", label: "Centros de Custo", icon: "🏷️" },
      { path: "/rodovias", label: "Rodovias e Trechos", icon: "🛣️" },
      { path: "/medicao", label: "Medição", icon: "📐" },
    ],
  },
  {
    label: "PCP & Produção",
    icon: "🗓️",
    roles: [
      "gestor",
      "diretor",
      "engenheiro",
      "pcp",
      "lider_campo",
      "apontador",
      "encarregado",
    ],
    items: [
      { path: "/pcp", label: "PCP — Programação", icon: "🗓️" },
      { path: "/apontamento", label: "Apontamento de Campo", icon: "📲" },
      { path: "/horas-maquina", label: "Horas de Equipamento", icon: "⏱️" },
    ],
  },
  {
    label: "Engenharia",
    icon: "⚙️",
    roles: ["gestor", "diretor", "engenheiro", "pcp", "lider_campo"],
    items: [
      { path: "/engenharia", label: "Engenharia", icon: "⚙️" },
      { path: "/atividades", label: "Atividades / Serviços", icon: "📋" },
    ],
  },
  {
    label: "Equipes & RH",
    icon: "👷",
    roles: ["gestor", "diretor", "rh", "pcp", "lider_campo"],
    items: [
      { path: "/equipes", label: "Equipes de Campo", icon: "👷" },
      { path: "/colaboradores", label: "Colaboradores", icon: "👥" },
    ],
  },
  {
    label: "Manutenção",
    icon: "🛠️",
    roles: [
      "gestor",
      "diretor",
      "lider_campo",
      "mecanico",
      "operador",
      "motorista",
    ],
    items: [
      { path: "/manutencao", label: "Ordens de Serviço", icon: "🛠️" },
      { path: "/planos", label: "Planos de Manutenção", icon: "📋" },
      { path: "/checklists", label: "Checklists", icon: "✅" },
      { path: "/equipamentos", label: "Equipamentos", icon: "🚜" },
    ],
  },
  {
    label: "Suprimentos",
    icon: "📦",
    roles: ["gestor", "diretor", "almoxarife", "comprador", "lider_campo"],
    items: [
      { path: "/suprimentos", label: "Compras", icon: "🛒" },
      { path: "/estoque", label: "Estoque / Almoxarifado", icon: "📦" },
    ],
  },
  {
    label: "Logística",
    icon: "🚛",
    roles: ["gestor", "diretor", "lider_campo", "motorista"],
    items: [{ path: "/logistica", label: "Logística", icon: "🚛" }],
  },
  {
    label: "Gestão",
    icon: "📈",
    roles: ["gestor", "diretor"],
    items: [
      { path: "/relatorios", label: "Relatórios", icon: "📈" },
      { path: "/instrucoes", label: "Instruções de Trabalho", icon: "📝" },
      { path: "/alertas", label: "Alertas", icon: "🔔" },
      { path: "/usuarios", label: "Usuários", icon: "👤" },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  function podeVer(roles?: Role[]): boolean {
    if (!roles) return true;
    return !!user && roles.includes(user.role as Role);
  }

  async function handleLogout() {
    await logout();
    toast.success("Sessão encerrada.");
    navigate("/login");
  }

  return (
    <aside className="w-64 bg-[#0a1628] border-r border-white/10 flex flex-col min-h-screen">
      <div className="p-5 border-b border-white/10">
        <Link
          to="/"
          className="block group hover:opacity-80 transition-opacity"
        >
          <LogoPrimus textSize="text-xl" />
          <p className="text-gray-500 text-xs mt-1">
            Sistema de Gestão Integrado
          </p>
        </Link>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {GRUPOS.map((grupo) => {
          if (!podeVer(grupo.roles)) return null;

          const itensVisiveis = grupo.items.filter((i) => podeVer(i.roles));
          if (itensVisiveis.length === 0) return null;

          return (
            <div key={grupo.label} className="mb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
                {grupo.label}
              </p>
              {itensVisiveis.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-[#1e3a8a] text-white font-medium"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="text-sm">
          <div className="text-white font-medium truncate">{user?.name}</div>
          <div className="text-orange-400 text-xs mt-0.5">
            {formatRole(user?.role ?? "")}
          </div>
          {user?.setor && (
            <div className="text-gray-500 text-xs">{user.setor}</div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left py-1"
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}

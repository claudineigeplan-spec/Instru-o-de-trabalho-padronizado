import { NavLink, useNavigate } from "react-router-dom";
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

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/equipamentos", label: "Frota", icon: "🚛" },
  { path: "/checklists", label: "Checklists", icon: "✅" },
  {
    path: "/instrucoes",
    label: "Instruções de Trabalho",
    icon: "📝",
    roles: ["gestor", "lider_campo", "mecanico"],
  },
  { path: "/ordens-servico", label: "Ordens de Manutenção", icon: "🛠️" },
  {
    path: "/planos",
    label: "Planos de Manutenção",
    icon: "📋",
    roles: ["gestor", "lider_campo"],
  },
  { path: "/alertas", label: "Alertas", icon: "🔔" },
  {
    path: "/estoque",
    label: "Estoque",
    icon: "📦",
    roles: ["gestor", "lider_campo"],
  },
  { path: "/relatorios", label: "Relatórios", icon: "📈", roles: ["gestor"] },
  { path: "/usuarios", label: "Usuários", icon: "👥", roles: ["gestor"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as Role),
  );

  async function handleLogout() {
    await logout();
    toast.success("Sessão encerrada.");
    navigate("/login");
  }

  return (
    <aside className="w-64 bg-[#0a1628] border-r border-white/10 flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white font-bold text-lg leading-tight">
          Gestão
          <br />
          <span className="text-[#f97316]">Integrada</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">Manutenção &amp; Frota</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-[#1e3a8a] text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="text-xs text-gray-500">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="mt-0.5 text-orange-400">
            {formatRole(user?.role ?? "")}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

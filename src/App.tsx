import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import AppLayout from "./components/layout/AppLayout";

// Páginas públicas
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";

// Dashboard
import Dashboard from "./pages/Dashboard";
import Indicadores from "./pages/Indicadores";

// Contratos & Projetos
import Contratos from "./pages/Contratos";
import CentrosCusto from "./pages/CentrosCusto";
import Rodovias from "./pages/Rodovias";
import Medicao from "./pages/Medicao";
import Engenharia from "./pages/Engenharia";
import Atividades from "./pages/Atividades";

// PCP & Produção
import PCP from "./pages/PCP";
import Apontamento from "./pages/Apontamento";
import HorasMaquina from "./pages/HorasMaquina";

// Equipes & RH
import Equipes from "./pages/Equipes";
import Colaboradores from "./pages/Colaboradores";

// Manutenção
import OrdensServico from "./pages/OrdensServico";
import PlanosManutencao from "./pages/PlanosManutencao";
import Checklists from "./pages/Checklists";
import Equipamentos from "./pages/Equipamentos";

// Suprimentos & Logística
import Suprimentos from "./pages/Suprimentos";
import Estoque from "./pages/Estoque";
import Logistica from "./pages/Logistica";

// Gestão
import Relatorios from "./pages/Relatorios";
import InstrucoesTrabalho from "./pages/InstrucoesTrabalho";
import Alertas from "./pages/Alertas";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/indicadores" element={<Indicadores />} />

              {/* Contratos & Projetos */}
              <Route
                path="/projetos"
                element={<Navigate to="/contratos" replace />}
              />
              <Route path="/contratos" element={<Contratos />} />
              <Route path="/centros-custo" element={<CentrosCusto />} />
              <Route path="/rodovias" element={<Rodovias />} />
              <Route path="/medicao" element={<Medicao />} />

              {/* Engenharia */}
              <Route path="/engenharia" element={<Engenharia />} />
              <Route path="/atividades" element={<Atividades />} />

              {/* PCP & Produção */}
              <Route path="/pcp" element={<PCP />} />
              <Route path="/apontamento" element={<Apontamento />} />
              <Route path="/horas-maquina" element={<HorasMaquina />} />

              {/* Equipes & RH */}
              <Route path="/equipes" element={<Equipes />} />
              <Route path="/colaboradores" element={<Colaboradores />} />

              {/* Manutenção */}
              <Route path="/manutencao" element={<OrdensServico />} />
              <Route path="/planos" element={<PlanosManutencao />} />
              <Route
                path="/ordens-servico"
                element={<Navigate to="/manutencao" replace />}
              />
              <Route path="/checklists" element={<Checklists />} />
              <Route path="/equipamentos" element={<Equipamentos />} />

              {/* Suprimentos & Logística */}
              <Route path="/suprimentos" element={<Suprimentos />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/logistica" element={<Logistica />} />

              {/* Gestão */}
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/instrucoes" element={<InstrucoesTrabalho />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

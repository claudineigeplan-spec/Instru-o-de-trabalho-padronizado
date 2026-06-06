import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Equipamentos from "./pages/Equipamentos";
import PlanosManutencao from "./pages/PlanosManutencao";
import InstrucoesTrabalho from "./pages/InstrucoesTrabalho";
import Checklists from "./pages/Checklists";
import OrdensServico from "./pages/OrdensServico";
import Alertas from "./pages/Alertas";
import Estoque from "./pages/Estoque";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipamentos" element={<Equipamentos />} />
              <Route path="/planos" element={<PlanosManutencao />} />
              <Route path="/instrucoes" element={<InstrucoesTrabalho />} />
              <Route path="/checklists" element={<Checklists />} />
              <Route path="/ordens-servico" element={<OrdensServico />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

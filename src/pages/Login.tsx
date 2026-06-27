import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";

const PERFIS_DEMO = [
  { label: "Diretoria", email: "diretoria@instrucao.com", color: "#f5c518" },
  {
    label: "Gestor de Manutenção",
    email: "gestor@instrucao.com",
    color: "#f97316",
  },
  {
    label: "Gestor de Produção",
    email: "producao@instrucao.com",
    color: "#3b82f6",
  },
  {
    label: "Gestor de Suprimentos",
    email: "suprimentos@instrucao.com",
    color: "#06b6d4",
  },
  { label: "PCP", email: "pcp@instrucao.com", color: "#8b5cf6" },
  { label: "Mecânico", email: "mecanico@instrucao.com", color: "#10b981" },
  {
    label: "Operador de Máquinas",
    email: "operador@instrucao.com",
    color: "#a78bfa",
  },
  { label: "Motorista", email: "motorista@instrucao.com", color: "#64748b" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function preencherPerfil(e: string) {
    setEmail(e);
    setPassword("123456");
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-wide">
              <span className="text-white">PRIMUS</span>
              <span className="text-[#f97316]"> SGI</span>
            </h1>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            Sistema de Gestão Integrado
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Atalhos de perfil para demonstração */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-500 text-center mb-3">
            Acesso rápido para demonstração · senha: 123456
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PERFIS_DEMO.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => preencherPerfil(p.email)}
                className="text-xs px-3 py-2 rounded-lg border transition-all hover:bg-white/10"
                style={{ borderColor: `${p.color}40`, color: p.color }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

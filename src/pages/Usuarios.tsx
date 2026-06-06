import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import { formatRole } from "../utils/format";
import type { User } from "../types";

export default function Usuarios() {
  const { user: authUser } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<User | null>(null);
  const toast = useToast();

  if (authUser?.role !== "gestor") {
    return <Navigate to="/dashboard" replace />;
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operador",
    setor: "",
    ativo: true,
  });

  async function carregar() {
    const data = await api.get<User[]>("/usuarios").then((r) => r.data);
    setUsuarios(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrir(u?: User) {
    setEditando(u ?? null);
    setForm(
      u
        ? { ...u, password: "" }
        : {
            name: "",
            email: "",
            password: "",
            role: "operador",
            setor: "",
            ativo: true,
          },
    );
    setModal(true);
  }

  async function salvar() {
    try {
      const payload = { ...form };
      if (!payload.password)
        delete (payload as Record<string, unknown>).password;
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, payload);
        toast.success("Usuário atualizado.");
      } else {
        await api.post("/usuarios", payload);
        toast.success("Usuário criado.");
      }
      setModal(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este usuário?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuário excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <button
          onClick={() => abrir()}
          className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map((u) => (
            <GlassCard key={u.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-medium">{u.name}</div>
                  <div className="text-gray-400 text-xs">{u.email}</div>
                </div>
                <StatusBadge status={u.ativo ? "ativo" : "inativo"} />
              </div>
              <div className="text-[#f97316] text-xs mb-3">
                {formatRole(u.role)}
                {u.setor ? ` · ${u.setor}` : ""}
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => abrir(u)}
                  className="flex-1 text-xs text-gray-400 hover:text-white"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(u.id)}
                  className="flex-1 text-xs text-red-400 hover:text-red-300"
                >
                  Excluir
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? "Editar Usuário" : "Novo Usuário"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              {editando
                ? "Nova senha (deixe em branco para manter)"
                : "Senha *"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Perfil *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <optgroup label="Gestor / Diretoria">
                  <option value="gestor">Gestor de Manutenção</option>
                  <option value="gestor">Diretoria</option>
                </optgroup>
                <optgroup label="Gestão / PCP">
                  <option value="lider_campo">Gestor de Produção</option>
                  <option value="lider_campo">Gestor de Suprimentos</option>
                  <option value="lider_campo">PCP</option>
                </optgroup>
                <optgroup label="Execução">
                  <option value="mecanico">Mecânico</option>
                  <option value="operador">Operador de Máquinas</option>
                  <option value="operador">Motorista</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Setor</label>
              <input
                value={form.setor}
                onChange={(e) => setForm({ ...form, setor: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="bg-[#f97316] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

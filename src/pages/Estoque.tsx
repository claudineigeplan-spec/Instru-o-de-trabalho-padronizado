import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import type { ItemEstoque } from "../types";

const TIPO_LABEL: Record<string, string> = {
  peca: "Peça",
  oleo: "Óleo",
  filtro: "Filtro",
  outros: "Outros",
};
const TIPO_ICONE: Record<string, string> = {
  peca: "🔩",
  oleo: "🛢️",
  filtro: "🔘",
  outros: "📦",
};

const FORM_VAZIO = {
  codigo: "",
  nome: "",
  tipo: "peca",
  unidade: "un",
  estoque_minimo: "",
};

export default function Estoque() {
  const { user } = useAuth();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const toast = useToast();

  const [form, setForm] = useState({ ...FORM_VAZIO });

  async function carregar() {
    const params: Record<string, string> = {};
    if (busca) params.search = busca;
    if (filtroTipo) params.tipo = filtroTipo;
    const data = await api
      .get<ItemEstoque[]>("/estoque", { params })
      .then((r) => r.data);
    setItens(data);
    setLoading(false);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(carregar, busca ? 350 : 0);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca, filtroTipo]);

  function abrir(item?: ItemEstoque) {
    setEditando(item ?? null);
    setForm(
      item
        ? {
            codigo: item.codigo,
            nome: item.nome,
            tipo: item.tipo,
            unidade: item.unidade,
            estoque_minimo: String(item.estoque_minimo),
          }
        : { ...FORM_VAZIO },
    );
    setModal(true);
  }

  async function salvar() {
    try {
      const payload = {
        ...form,
        estoque_minimo: Number(form.estoque_minimo) || 0,
      };
      if (editando) {
        await api.put(`/estoque/${editando.id}`, payload);
        toast.success("Item atualizado.");
      } else {
        await api.post("/estoque", payload);
        toast.success("Item cadastrado.");
      }
      setModal(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este item do estoque?")) return;
    try {
      await api.delete(`/estoque/${id}`);
      toast.success("Item excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Estoque</h1>
        {podeEditar && (
          <button
            onClick={() => abrir()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Novo Item
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou código..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <div className="flex gap-1">
          {(["", "peca", "oleo", "filtro", "outros"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filtroTipo === t
                  ? "bg-[#f97316] text-white font-medium"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {t ? TIPO_LABEL[t] : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : itens.length === 0 ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Nenhum item encontrado.</div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itens.map((item) => (
            <GlassCard key={item.id}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{TIPO_ICONE[item.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">
                    {item.nome}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {item.codigo} · {TIPO_LABEL[item.tipo]}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Mín.: {item.estoque_minimo} {item.unidade}
                  </div>
                </div>
              </div>
              {podeEditar && (
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => abrir(item)}
                    className="flex-1 text-xs text-gray-400 hover:text-white transition-colors py-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluir(item.id)}
                    className="flex-1 text-xs text-red-400 hover:text-red-300 transition-colors py-1"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? "Editar Item" : "Novo Item de Estoque"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                disabled={!!editando}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="peca">Peça</option>
                <option value="oleo">Óleo</option>
                <option value="filtro">Filtro</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Unidade
              </label>
              <input
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                placeholder="un, L, kg..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Estoque mínimo
              </label>
              <input
                type="number"
                value={form.estoque_minimo}
                onChange={(e) =>
                  setForm({ ...form, estoque_minimo: e.target.value })
                }
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!form.codigo || !form.nome}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

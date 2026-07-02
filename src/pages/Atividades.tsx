import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useToast } from "../hooks/useToast";
import { atividadesService } from "../services/atividades";
import { resolveErrorMessage } from "../services/api";
import type { Atividade } from "../types";

const CATEGORIA_LABEL: Record<string, string> = {
  pavimentacao: "Pavimentação",
  drenagem: "Drenagem",
  conserva: "Conserva / Vegetação",
  terraplenagem: "Terraplenagem",
  sinalizacao: "Sinalização",
  manutencao: "Manutenção",
};
const CATEGORIA_COR: Record<string, string> = {
  pavimentacao: "#f97316",
  drenagem: "#3b82f6",
  conserva: "#10b981",
  terraplenagem: "#8b5cf6",
  sinalizacao: "#f59e0b",
  manutencao: "#ef4444",
};

export default function Atividades() {
  const toast = useToast();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [editando, setEditando] = useState<Atividade | null>(null);

  useEffect(() => {
    atividadesService
      .listar()
      .then(setAtividades)
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const categorias = Object.keys(CATEGORIA_LABEL);

  const lista = atividades.filter((a) => {
    const okCat =
      filtroCategoria === "todos" || a.categoria === filtroCategoria;
    const b = busca.toLowerCase();
    return (
      okCat &&
      (!b ||
        a.nome.toLowerCase().includes(b) ||
        a.codigo.toLowerCase().includes(b))
    );
  });

  const porCategoria = categorias.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = atividades.filter((a) => a.categoria === cat).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Atividades / Serviços
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Catálogo de {atividades.length} atividades
          </p>
        </div>
        <button
          onClick={() =>
            toast.info("Cadastro de atividade disponível em breve.")
          }
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova Atividade
        </button>
      </div>

      {/* Cards por categoria */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categorias.map((cat) => (
          <GlassCard
            key={cat}
            className={`p-3 cursor-pointer transition-all ${filtroCategoria === cat ? "border-orange-500/60" : "hover:border-white/20"}`}
            onClick={() =>
              setFiltroCategoria(filtroCategoria === cat ? "todos" : cat)
            }
          >
            <p
              className="text-2xl font-bold"
              style={{ color: CATEGORIA_COR[cat] }}
            >
              {porCategoria[cat]}
            </p>
            <p className="text-gray-400 text-xs mt-1">{CATEGORIA_LABEL[cat]}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar atividade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => {
              setBusca("");
              setFiltroCategoria("todos");
            }}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 bg-white/5 rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>
      </GlassCard>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando atividades...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhuma atividade encontrada.
        </p>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-gray-400 text-xs">
                  <th className="text-left p-4">Código</th>
                  <th className="text-left p-4">Nome</th>
                  <th className="text-left p-4">Categoria</th>
                  <th className="text-left p-4">Unidade</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setEditando(a)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono text-orange-400 text-xs">
                      {a.codigo}
                    </td>
                    <td className="p-4 text-white">{a.nome}</td>
                    <td className="p-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: CATEGORIA_COR[a.categoria] + "33",
                          color: CATEGORIA_COR[a.categoria],
                        }}
                      >
                        {CATEGORIA_LABEL[a.categoria]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs font-mono">
                      {a.unidade_medida}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${a.ativo ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                      >
                        {a.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <GlassModal
        open={!!editando}
        onClose={() => setEditando(null)}
        title={editando?.nome ?? ""}
      >
        {editando && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Código</p>
                <p className="text-white font-mono">{editando.codigo}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Unidade de Medida</p>
                <p className="text-white font-mono">
                  {editando.unidade_medida}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Categoria</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: CATEGORIA_COR[editando.categoria] + "33",
                    color: CATEGORIA_COR[editando.categoria],
                  }}
                >
                  {CATEGORIA_LABEL[editando.categoria]}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Status</p>
                <p
                  className={
                    editando.ativo ? "text-green-400" : "text-gray-400"
                  }
                >
                  {editando.ativo ? "Ativo" : "Inativo"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toast.info("Edição disponível em breve.");
                  setEditando(null);
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setEditando(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

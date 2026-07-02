import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import { useToast } from "../hooks/useToast";
import { centrosCustoService } from "../services/centrosCusto";
import { contratosService } from "../services/contratos";
import { resolveErrorMessage } from "../services/api";
import type { CentroCusto } from "../types";

export default function CentrosCusto() {
  const toast = useToast();
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [contratosPorCentro, setContratosPorCentro] = useState<
    Record<number, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    Promise.all([centrosCustoService.listar(), contratosService.listar()])
      .then(([centrosData, contratosData]) => {
        setCentros(centrosData);
        const contagem: Record<number, number> = {};
        for (const c of contratosData) {
          if (c.centro_custo_id) {
            contagem[c.centro_custo_id] =
              (contagem[c.centro_custo_id] ?? 0) + 1;
          }
        }
        setContratosPorCentro(contagem);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const lista = centros.filter((c) => {
    const b = busca.toLowerCase();
    return (
      !b ||
      c.codigo.toLowerCase().includes(b) ||
      c.nome.toLowerCase().includes(b)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Centros de Custo</h1>
          <p className="text-gray-400 text-sm mt-1">
            {centros.length} centros cadastrados
          </p>
        </div>
        <button
          onClick={() =>
            toast.info("Cadastro de centro de custo disponível em breve.")
          }
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Centro de Custo
        </button>
      </div>

      <GlassCard className="p-4">
        <input
          type="text"
          placeholder="Buscar centro de custo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </GlassCard>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando centros de custo...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhum centro de custo encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lista.map((c) => {
            const contratos = contratosPorCentro[c.id] ?? 0;
            return (
              <GlassCard key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 font-mono text-sm font-bold">
                        {c.codigo}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                        {contratos} contrato{contratos !== 1 ? "s" : ""}
                      </span>
                      {!c.ativo && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-white font-semibold mt-1">{c.nome}</p>
                    {c.descricao && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {c.descricao}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

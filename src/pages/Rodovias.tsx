import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useToast } from "../hooks/useToast";
import { rodoviasService } from "../services/rodovias";
import { resolveErrorMessage } from "../services/api";
import type { Rodovia } from "../types";

export default function Rodovias() {
  const toast = useToast();
  const [rodovias, setRodovias] = useState<Rodovia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<Rodovia | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  useEffect(() => {
    rodoviasService
      .listar()
      .then(setRodovias)
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function abrirDetalhe(r: Rodovia) {
    setSelecionada(r);
    setCarregandoDetalhe(true);
    try {
      const completa = await rodoviasService.buscar(r.id);
      setSelecionada(completa);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  const lista = rodovias.filter((r) => {
    const b = busca.toLowerCase();
    return (
      !b ||
      r.codigo.toLowerCase().includes(b) ||
      r.nome.toLowerCase().includes(b) ||
      (r.municipio ?? "").toLowerCase().includes(b)
    );
  });

  const totalTrechos = rodovias.reduce((s, r) => s + (r.trechos_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rodovias e Trechos</h1>
          <p className="text-gray-400 text-sm mt-1">
            {rodovias.length} rodovias cadastradas
          </p>
        </div>
        <button
          onClick={() => toast.info("Cadastro de rodovia disponível em breve.")}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova Rodovia
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        {[
          { label: "Rodovias", valor: rodovias.length, cor: "#3b82f6" },
          { label: "Trechos Ativos", valor: totalTrechos, cor: "#10b981" },
        ].map((c) => (
          <GlassCard key={c.label} className="p-4">
            <p className="text-gray-400 text-xs">{c.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: c.cor }}>
              {c.valor}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4">
        <input
          type="text"
          placeholder="Buscar rodovia por código, nome ou município..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
        />
      </GlassCard>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando rodovias...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhuma rodovia encontrada.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <GlassCard
              key={r.id}
              className="p-4 cursor-pointer hover:border-orange-500/40 transition-all"
              onClick={() => abrirDetalhe(r)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold font-mono">
                      {r.codigo}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                      {r.uf}
                    </span>
                    {(r.trechos_count ?? 0) > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {r.trechos_count} trecho
                        {r.trechos_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium mt-1">{r.nome}</p>
                  {r.municipio && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {r.municipio}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal
        open={!!selecionada}
        onClose={() => setSelecionada(null)}
        title={selecionada ? `${selecionada.codigo} — ${selecionada.nome}` : ""}
        size="lg"
      >
        {selecionada && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Código</p>
                <p className="text-orange-400 font-mono font-bold">
                  {selecionada.codigo}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">UF</p>
                <p className="text-white">{selecionada.uf}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-xs">Nome Completo</p>
                <p className="text-white">{selecionada.nome}</p>
              </div>
              {selecionada.municipio && (
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs">Municípios</p>
                  <p className="text-white">{selecionada.municipio}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-2">
                Trechos em Contrato
              </h3>
              {carregandoDetalhe ? (
                <p className="text-gray-400 text-sm">Carregando trechos...</p>
              ) : (selecionada.trechos ?? []).length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhum trecho cadastrado para esta rodovia.
                </p>
              ) : (
                <div className="space-y-2">
                  {(selecionada.trechos ?? []).map((t) => {
                    const kmInicial =
                      t.km_inicial != null ? Number(t.km_inicial) : null;
                    const kmFinal =
                      t.km_final != null ? Number(t.km_final) : null;
                    const extensao =
                      kmInicial != null && kmFinal != null
                        ? kmFinal - kmInicial
                        : null;
                    return (
                      <div
                        key={t.id}
                        className="bg-white/5 rounded-lg p-3 text-sm"
                      >
                        <p className="text-white font-medium">{t.descricao}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-gray-500">Km inicial: </span>
                            <span className="text-gray-300">
                              {kmInicial?.toFixed(3) ?? "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Km final: </span>
                            <span className="text-gray-300">
                              {kmFinal?.toFixed(3) ?? "—"}
                            </span>
                          </div>
                          {extensao != null && (
                            <div>
                              <span className="text-gray-500">Extensão: </span>
                              <span className="text-gray-300">
                                {extensao.toFixed(1)} km
                              </span>
                            </div>
                          )}
                          {t.municipio && (
                            <div>
                              <span className="text-gray-500">Município: </span>
                              <span className="text-gray-300">
                                {t.municipio}
                              </span>
                            </div>
                          )}
                          {t.contrato && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Contrato: </span>
                              <span className="text-orange-400">
                                {t.contrato.numero}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

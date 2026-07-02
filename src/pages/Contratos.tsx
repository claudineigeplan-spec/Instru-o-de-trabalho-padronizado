import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useToast } from "../hooks/useToast";
import { contratosService } from "../services/contratos";
import { resolveErrorMessage } from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";
import type { StatusContrato, TipoContrato, Contrato } from "../types";

const STATUS_LABEL: Record<StatusContrato, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};
const STATUS_COR: Record<StatusContrato, string> = {
  ativo: "#10b981",
  suspenso: "#f97316",
  encerrado: "#64748b",
  cancelado: "#ef4444",
};
const TIPO_LABEL: Record<TipoContrato, string> = {
  conserva: "Conserva Rodoviária",
  obra: "Obra Civil",
  terraplenagem: "Terraplenagem",
  pavimentacao: "Pavimentação",
  outros: "Outros",
};

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

export default function Contratos() {
  const toast = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Contrato | null>(null);

  useEffect(() => {
    contratosService
      .listar()
      .then(setContratos)
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const lista = contratos.filter((c) => {
    const ok = filtro === "todos" || c.status === filtro;
    const b = busca.toLowerCase();
    return (
      ok &&
      (!b ||
        c.numero.toLowerCase().includes(b) ||
        c.objeto.toLowerCase().includes(b) ||
        c.cliente.toLowerCase().includes(b))
    );
  });

  function valorMedido(c: Contrato) {
    return (c.itens_contratuais ?? []).reduce(
      (s, i) => s + i.quantidade_medida * i.preco_unitario,
      0,
    );
  }

  const totalAtualizado = lista.reduce(
    (s, c) => s + Number(c.valor_atualizado),
    0,
  );
  const totalMedido = contratos.reduce((s, c) => s + valorMedido(c), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Projetos e Contratos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {contratos.length} contratos cadastrados
          </p>
        </div>
        <button
          onClick={() =>
            toast.info("Cadastro de contrato disponível em breve.")
          }
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Contrato
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Contratos Ativos",
            valor: contratos.filter((c) => c.status === "ativo").length,
            sub: "em execução",
            cor: "#10b981",
          },
          {
            label: "Valor Contratado",
            valor: formatCurrency(totalAtualizado),
            sub: "total atualizado",
            cor: "#3b82f6",
          },
          {
            label: "Valor Medido",
            valor: formatCurrency(totalMedido),
            sub: `${pct(totalMedido, totalAtualizado)}% do total`,
            cor: "#f97316",
          },
          {
            label: "Saldo Disponível",
            valor: formatCurrency(totalAtualizado - totalMedido),
            sub: "a medir",
            cor: "#8b5cf6",
          },
        ].map((c) => (
          <GlassCard key={c.label} className="p-4">
            <p className="text-gray-400 text-xs">{c.label}</p>
            <p
              className="text-white font-bold text-xl mt-1"
              style={{ color: c.cor }}
            >
              {c.valor}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{c.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* Filtros */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por número, objeto ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <div className="flex gap-2 flex-wrap">
            {(["todos", "ativo", "suspenso", "encerrado"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFiltro(s)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filtro === s
                    ? "bg-[#1e3a8a] text-white"
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
              >
                {s === "todos" ? "Todos" : STATUS_LABEL[s as StatusContrato]}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Lista de Contratos */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando contratos...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhum contrato encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {lista.map((c) => {
            const medido = valorMedido(c);
            const percMedido = pct(medido, Number(c.valor_atualizado));

            return (
              <GlassCard
                key={c.id}
                className="p-5 cursor-pointer hover:border-orange-500/40 transition-all"
                onClick={() => setSelecionado(c)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-orange-400 font-mono text-sm font-bold">
                        {c.numero}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: STATUS_COR[c.status] + "33",
                          color: STATUS_COR[c.status],
                        }}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                        {TIPO_LABEL[c.tipo]}
                      </span>
                    </div>
                    <p className="text-white font-medium mt-1.5 text-sm leading-snug">
                      {c.objeto}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {c.cliente} · {c.orgao_contratante}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {c.centro_custo
                        ? `${c.centro_custo.codigo} — ${c.centro_custo.nome} · `
                        : ""}
                      {formatDate(c.data_inicio)} a {formatDate(c.data_fim)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-lg">
                      {formatCurrency(Number(c.valor_atualizado))}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Medido: {formatCurrency(medido)}
                    </p>
                    <p className="text-xs text-orange-400">
                      {percMedido}% executado
                    </p>
                  </div>
                </div>
                {/* Barra de progresso */}
                <div className="mt-3 bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${percMedido}%`,
                      backgroundColor:
                        percMedido > 80
                          ? "#10b981"
                          : percMedido > 50
                            ? "#f97316"
                            : "#3b82f6",
                    }}
                  />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal detalhe */}
      <GlassModal
        open={!!selecionado}
        onClose={() => setSelecionado(null)}
        title={
          selecionado
            ? `${selecionado.numero} — ${TIPO_LABEL[selecionado.tipo]}`
            : ""
        }
        size="xl"
      >
        {selecionado && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Objeto</p>
                <p className="text-white">{selecionado.objeto}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Cliente</p>
                <p className="text-white">{selecionado.cliente}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Vigência</p>
                <p className="text-white">
                  {formatDate(selecionado.data_inicio)} a{" "}
                  {formatDate(selecionado.data_fim)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Valor Atualizado</p>
                <p className="text-white font-bold">
                  {formatCurrency(Number(selecionado.valor_atualizado))}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-3">
                Itens Contratuais
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="text-left py-2 pr-3">Código</th>
                      <th className="text-left py-2 pr-3">Descrição</th>
                      <th className="text-right py-2 pr-3">Un</th>
                      <th className="text-right py-2 pr-3">Qtd Contrat.</th>
                      <th className="text-right py-2 pr-3">Qtd Medida</th>
                      <th className="text-right py-2 pr-3">Saldo</th>
                      <th className="text-right py-2 pr-3">P.U.</th>
                      <th className="text-right py-2">Valor Medido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selecionado.itens_contratuais ?? []).map((it) => {
                      const saldo =
                        it.quantidade_contratada - it.quantidade_medida;
                      const valorItem =
                        it.quantidade_medida * it.preco_unitario;
                      const semSaldo = saldo <= 0;
                      return (
                        <tr
                          key={it.id}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="py-2 pr-3 text-orange-400 font-mono">
                            {it.codigo_item}
                          </td>
                          <td className="py-2 pr-3 text-white">
                            {it.descricao}
                          </td>
                          <td className="py-2 pr-3 text-gray-400 text-right">
                            {it.unidade}
                          </td>
                          <td className="py-2 pr-3 text-gray-300 text-right">
                            {it.quantidade_contratada.toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2 pr-3 text-gray-300 text-right">
                            {it.quantidade_medida.toLocaleString("pt-BR")}
                          </td>
                          <td
                            className={`py-2 pr-3 text-right font-semibold ${semSaldo ? "text-red-400" : "text-green-400"}`}
                          >
                            {saldo.toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2 pr-3 text-gray-400 text-right">
                            {formatCurrency(it.preco_unitario)}
                          </td>
                          <td className="py-2 text-white font-medium text-right">
                            {formatCurrency(valorItem)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/20">
                      <td
                        colSpan={7}
                        className="py-2 text-gray-400 font-semibold text-right pr-3"
                      >
                        Total Medido:
                      </td>
                      <td className="py-2 text-orange-400 font-bold text-right">
                        {formatCurrency(valorMedido(selecionado))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

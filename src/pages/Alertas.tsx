import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { alertasService } from "../services/alertas";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import { formatDateTime } from "../utils/format";
import type { Alerta } from "../types";

const tipoIcone: Record<string, string> = {
  manutencao_vencida: "🔴",
  manutencao_vencendo: "🟡",
  checklist_anomalia: "⚠️",
  reposicao_peca: "📦",
  os_aberta: "🔵",
  os_vencida: "🔴",
};

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [naoLidos, setNaoLidos] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function carregar() {
    const data = await alertasService.listar();
    setAlertas(data.alertas.data);
    setNaoLidos(data.nao_lidos);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarLido(id: number) {
    try {
      await alertasService.marcarLido(id);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function marcarTodos() {
    try {
      await alertasService.marcarTodosLidos();
      toast.success("Todos os alertas foram marcados como lidos.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertas</h1>
          {naoLidos > 0 && (
            <p className="text-sm text-red-400 mt-0.5">
              {naoLidos} não lido{naoLidos > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {naoLidos > 0 && (
          <button
            onClick={marcarTodos}
            className="text-sm text-[#f97316] hover:underline"
          >
            Marcar todos como lidos
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : alertas.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-gray-400">Nenhum alerta no momento.</div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <GlassCard
              key={alerta.id}
              className={
                alerta.status === "novo" ? "border-white/20" : "opacity-60"
              }
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">
                  {tipoIcone[alerta.tipo] ?? "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-white text-sm">{alerta.mensagem}</div>
                    <StatusBadge status={alerta.status} className="shrink-0" />
                  </div>
                  {alerta.equipamento && (
                    <div className="text-gray-400 text-xs mt-1">
                      📍 {alerta.equipamento.nome}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mt-1">
                    {formatDateTime(alerta.created_at)}
                  </div>
                </div>
                {alerta.status === "novo" && (
                  <button
                    onClick={() => marcarLido(alerta.id)}
                    className="text-xs text-gray-400 hover:text-white shrink-0 mt-0.5"
                  >
                    Marcar lido
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

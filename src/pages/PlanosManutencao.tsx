import { useEffect, useState } from "react";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { equipamentosService } from "../services/equipamentos";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import { formatTipoGatilho } from "../utils/format";
import type { PlanoManutencao, Equipamento, GatilhoPlano } from "../types";

export default function PlanosManutencao() {
  const { user } = useAuth();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";
  const [planos, setPlanos] = useState<PlanoManutencao[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPlano, setModalPlano] = useState(false);
  const [modalGatilho, setModalGatilho] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] =
    useState<PlanoManutencao | null>(null);
  const [editandoPlano, setEditandoPlano] = useState<PlanoManutencao | null>(
    null,
  );
  const toast = useToast();

  const [formPlano, setFormPlano] = useState({
    equipamento_id: "",
    nome: "",
    descricao: "",
  });
  const [formGatilho, setFormGatilho] = useState({
    tipo: "horas",
    valor_intervalo: "",
    antecedencia_alerta: "",
  });

  async function carregar() {
    const [p, e] = await Promise.all([
      api.get<PlanoManutencao[]>("/planos").then((r) => r.data),
      equipamentosService.listar(),
    ]);
    setPlanos(p);
    setEquipamentos(e);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirModalPlano(plano?: PlanoManutencao) {
    if (plano) {
      setEditandoPlano(plano);
      setFormPlano({
        equipamento_id: String(plano.equipamento_id),
        nome: plano.nome,
        descricao: plano.descricao ?? "",
      });
    } else {
      setEditandoPlano(null);
      setFormPlano({ equipamento_id: "", nome: "", descricao: "" });
    }
    setModalPlano(true);
  }

  async function salvarPlano() {
    try {
      if (editandoPlano) {
        await api.put(`/planos/${editandoPlano.id}`, {
          nome: formPlano.nome,
          descricao: formPlano.descricao,
        });
        toast.success("Plano atualizado.");
      } else {
        await api.post("/planos", {
          ...formPlano,
          equipamento_id: Number(formPlano.equipamento_id),
        });
        toast.success("Plano criado.");
      }
      setModalPlano(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluirGatilho(gatilhoId: number) {
    if (!confirm("Excluir este gatilho?")) return;
    try {
      await api.delete(`/gatilhos/${gatilhoId}`);
      toast.success("Gatilho excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function salvarGatilho() {
    if (!planoSelecionado) return;
    try {
      await api.post(`/planos/${planoSelecionado.id}/gatilhos`, {
        tipo: formGatilho.tipo,
        valor_intervalo: Number(formGatilho.valor_intervalo),
        antecedencia_alerta: Number(formGatilho.antecedencia_alerta),
      });
      toast.success("Gatilho adicionado.");
      setModalGatilho(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluirPlano(id: number) {
    if (!confirm("Excluir este plano?")) return;
    try {
      await api.delete(`/planos/${id}`);
      toast.success("Plano excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Planos de Manutenção</h1>
        {podeEditar && (
          <button
            onClick={() => abrirModalPlano()}
            className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Novo Plano
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {planos.map((plano) => (
            <GlassCard key={plano.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{plano.nome}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {plano.equipamento?.nome}
                  </div>
                  {plano.descricao && (
                    <div className="text-gray-500 text-xs mt-1">
                      {plano.descricao}
                    </div>
                  )}
                </div>
                {podeEditar && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setPlanoSelecionado(plano);
                        setFormGatilho({
                          tipo: "horas",
                          valor_intervalo: "",
                          antecedencia_alerta: "",
                        });
                        setModalGatilho(true);
                      }}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg"
                    >
                      + Gatilho
                    </button>
                    <button
                      onClick={() => abrirModalPlano(plano)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirPlano(plano.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              {plano.gatilhos.length > 0 && (
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="text-xs text-gray-400 font-medium">
                    Gatilhos
                  </div>
                  {plano.gatilhos.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-400">
                        {formatTipoGatilho(g.tipo)}
                      </span>
                      <span className="text-white font-medium">
                        A cada {g.valor_intervalo}{" "}
                        {g.tipo === "periodicidade_dias"
                          ? "dias"
                          : g.tipo === "km"
                            ? "km"
                            : g.tipo === "horas"
                              ? "h"
                              : "ciclos"}
                      </span>
                      {g.antecedencia_alerta > 0 && (
                        <span className="text-yellow-400">
                          Alerta {g.antecedencia_alerta}{" "}
                          {g.tipo === "periodicidade_dias"
                            ? "dias"
                            : g.tipo === "horas"
                              ? "h"
                              : "km"}{" "}
                          antes
                        </span>
                      )}
                      {podeEditar && (
                        <button
                          onClick={() => excluirGatilho(g.id)}
                          className="ml-auto text-red-400 hover:text-red-300"
                          title="Excluir gatilho"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <GlassModal
        open={modalPlano}
        onClose={() => setModalPlano(false)}
        title={
          editandoPlano
            ? "Editar Plano de Manutenção"
            : "Novo Plano de Manutenção"
        }
      >
        <div className="space-y-4">
          {!editandoPlano && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Equipamento *
              </label>
              <select
                value={formPlano.equipamento_id}
                onChange={(e) =>
                  setFormPlano({ ...formPlano, equipamento_id: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Selecione...</option>
                {equipamentos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Nome do plano *
            </label>
            <input
              value={formPlano.nome}
              onChange={(e) =>
                setFormPlano({ ...formPlano, nome: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Ex: Troca de Óleo 250h"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Descrição
            </label>
            <textarea
              value={formPlano.descricao}
              onChange={(e) =>
                setFormPlano({ ...formPlano, descricao: e.target.value })
              }
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalPlano(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarPlano}
              className="bg-[#f97316] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>

      <GlassModal
        open={modalGatilho}
        onClose={() => setModalGatilho(false)}
        title={`Novo Gatilho — ${planoSelecionado?.nome ?? ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Tipo de gatilho *
            </label>
            <select
              value={formGatilho.tipo}
              onChange={(e) =>
                setFormGatilho({ ...formGatilho, tipo: e.target.value })
              }
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="horas">Horas de uso</option>
              <option value="km">Quilômetros</option>
              <option value="ciclos">Ciclos</option>
              <option value="periodicidade_dias">Periodicidade em dias</option>
              <option value="data_fixa">Data fixa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Intervalo (
              {formGatilho.tipo === "horas"
                ? "h"
                : formGatilho.tipo === "km"
                  ? "km"
                  : formGatilho.tipo === "periodicidade_dias"
                    ? "dias"
                    : "unidades"}
              ) *
            </label>
            <input
              type="number"
              value={formGatilho.valor_intervalo}
              onChange={(e) =>
                setFormGatilho({
                  ...formGatilho,
                  valor_intervalo: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="250"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Antecedência para alerta (mesma unidade)
            </label>
            <input
              type="number"
              value={formGatilho.antecedencia_alerta}
              onChange={(e) =>
                setFormGatilho({
                  ...formGatilho,
                  antecedencia_alerta: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="20"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalGatilho(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarGatilho}
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

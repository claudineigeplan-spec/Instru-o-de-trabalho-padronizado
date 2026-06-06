import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { equipamentosService } from "../services/equipamentos";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import { formatDateTime } from "../utils/format";
import type { ModeloChecklist, Equipamento, ItemChecklist } from "../types";

interface ExecucaoChecklist {
  id: number;
  modelo_id: number;
  equipamento_id: number;
  status: "concluido" | "com_anomalia";
  operador_id: number;
  data_hora: string;
  modelo?: { nome: string };
  equipamento?: { nome: string };
  operador?: { name: string };
}

type Aba = "modelos" | "historico";

export default function Checklists() {
  const location = useLocation();
  const { user } = useAuth();
  const isGestor = user?.role === "gestor";
  const [aba, setAba] = useState<Aba>("modelos");
  const [modelos, setModelos] = useState<ModeloChecklist[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [historico, setHistorico] = useState<ExecucaoChecklist[]>([]);
  const [execucaoAberta, setExecucaoAberta] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] =
    useState<ModeloChecklist | null>(null);
  const [equipamentoId, setEquipamentoId] = useState("");
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [horimetro, setHorimetro] = useState("");
  const [hodometro, setHodometro] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingHist, setLoadingHist] = useState(false);
  const toast = useToast();

  // CRUD modelos (gestor)
  const [modalModelo, setModalModelo] = useState(false);
  const [editandoModelo, setEditandoModelo] = useState<ModeloChecklist | null>(
    null,
  );
  const [formModelo, setFormModelo] = useState({
    nome: "",
    periodicidade: "diario",
    tipo_equipamento: "",
  });
  const [itensEdicao, setItensEdicao] = useState<ItemChecklist[]>([]);
  const [novoItem, setNovoItem] = useState({
    descricao: "",
    tipo_resposta: "ok_nok",
    critico: false,
  });
  const [itensNovos, setItensNovos] = useState<
    Array<{ descricao: string; tipo_resposta: string; critico: boolean }>
  >([]);

  async function carregar() {
    const [m, e] = await Promise.all([
      api.get<ModeloChecklist[]>("/modelos-checklist").then((r) => r.data),
      equipamentosService.listar(),
    ]);
    setModelos(m);
    setEquipamentos(e);
    setLoading(false);

    const state = location.state as { equipamentoId?: number } | null;
    if (state?.equipamentoId) {
      const eq = e.find((x) => x.id === state.equipamentoId);
      if (eq) {
        setEquipamentoId(String(eq.id));
        const modelo = m.find(
          (mo) => !mo.tipo_equipamento || mo.tipo_equipamento === eq.tipo,
        );
        if (modelo) {
          setModeloSelecionado(modelo);
          setRespostas({});
          setHorimetro("");
          setHodometro("");
          setExecucaoAberta(true);
        }
      }
    }
  }

  async function carregarHistorico() {
    setLoadingHist(true);
    api
      .get<{ data: ExecucaoChecklist[] }>("/checklists")
      .then((r) => {
        setHistorico(r.data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingHist(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    if (aba === "historico") carregarHistorico();
  }, [aba]);

  function abrirModalModelo(modelo?: ModeloChecklist) {
    if (modelo) {
      setEditandoModelo(modelo);
      setFormModelo({
        nome: modelo.nome,
        periodicidade: modelo.periodicidade,
        tipo_equipamento: modelo.tipo_equipamento ?? "",
      });
      setItensEdicao([...modelo.itens].sort((a, b) => a.ordem - b.ordem));
      setItensNovos([]);
    } else {
      setEditandoModelo(null);
      setFormModelo({
        nome: "",
        periodicidade: "diario",
        tipo_equipamento: "",
      });
      setItensEdicao([]);
      setItensNovos([]);
    }
    setNovoItem({ descricao: "", tipo_resposta: "ok_nok", critico: false });
    setModalModelo(true);
  }

  function adicionarItemLocal() {
    if (!novoItem.descricao.trim()) return;
    if (editandoModelo) {
      api
        .post(`/modelos-checklist/${editandoModelo.id}/itens`, novoItem)
        .then((r) => {
          setItensEdicao((prev) => [...prev, r.data as ItemChecklist]);
          setNovoItem({
            descricao: "",
            tipo_resposta: "ok_nok",
            critico: false,
          });
        })
        .catch((err) => toast.error(resolveErrorMessage(err)));
    } else {
      setItensNovos((prev) => [...prev, { ...novoItem }]);
      setNovoItem({ descricao: "", tipo_resposta: "ok_nok", critico: false });
    }
  }

  async function excluirItemEdicao(itemId: number) {
    try {
      await api.delete(`/itens/${itemId}`);
      setItensEdicao((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function salvarModelo() {
    try {
      if (editandoModelo) {
        await api.put(`/modelos-checklist/${editandoModelo.id}`, {
          nome: formModelo.nome,
          periodicidade: formModelo.periodicidade,
        });
        toast.success("Modelo atualizado.");
      } else {
        const payload = {
          nome: formModelo.nome,
          periodicidade: formModelo.periodicidade,
          tipo_equipamento: formModelo.tipo_equipamento || undefined,
          itens: itensNovos,
        };
        await api.post("/modelos-checklist", payload);
        toast.success("Modelo criado.");
      }
      setModalModelo(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluirModelo(id: number) {
    if (!confirm("Excluir este modelo de checklist?")) return;
    try {
      await api.delete(`/modelos-checklist/${id}`);
      toast.success("Modelo excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  function abrirExecucao(modelo: ModeloChecklist) {
    setModeloSelecionado(modelo);
    setRespostas({});
    setHorimetro("");
    setHodometro("");
    setEquipamentoId("");
    setExecucaoAberta(true);
  }

  async function executar() {
    if (!modeloSelecionado || !equipamentoId) return;

    const respostasArray = modeloSelecionado.itens.map((item) => ({
      item_id: item.id,
      resposta:
        respostas[item.id] ?? (item.tipo_resposta === "ok_nok" ? "ok" : ""),
    }));

    try {
      await api.post("/checklists/executar", {
        modelo_id: modeloSelecionado.id,
        equipamento_id: Number(equipamentoId),
        horas_atual: horimetro ? Number(horimetro) : undefined,
        km_atual: hodometro ? Number(hodometro) : undefined,
        respostas: respostasArray,
      });
      toast.success("Checklist registrado com sucesso.");
      setExecucaoAberta(false);
      if (aba === "historico") carregarHistorico();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  const periodicidadeLabel: Record<string, string> = {
    diario: "Diário",
    semanal: "Semanal",
    mensal: "Mensal",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Checklists</h1>
        {isGestor && aba === "modelos" && (
          <button
            onClick={() => abrirModalModelo()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            + Novo Modelo
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {(
          [
            ["modelos", "Modelos"],
            ["historico", "Histórico"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              aba === key
                ? "bg-[#f97316] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Modelos */}
      {aba === "modelos" && (
        <>
          {loading ? (
            <div className="text-gray-400 text-center py-12">Carregando...</div>
          ) : modelos.length === 0 ? (
            <GlassCard className="text-center py-10">
              <div className="text-gray-400">
                Nenhum modelo de checklist cadastrado.
              </div>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modelos.map((modelo) => (
                <GlassCard key={modelo.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">
                        {modelo.nome}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {periodicidadeLabel[modelo.periodicidade] ??
                          modelo.periodicidade}
                      </div>
                    </div>
                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {modelo.itens.length} itens
                    </span>
                  </div>
                  {modelo.equipamento && (
                    <div className="text-gray-500 text-xs mb-3">
                      ⚙️ {modelo.equipamento.nome}
                    </div>
                  )}
                  <button
                    onClick={() => abrirExecucao(modelo)}
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    Executar
                  </button>
                  {isGestor && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => abrirModalModelo(modelo)}
                        className="flex-1 text-xs text-blue-400 hover:text-blue-300 transition-colors py-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirModelo(modelo.id)}
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
        </>
      )}

      {/* Histórico */}
      {aba === "historico" && (
        <>
          {loadingHist ? (
            <div className="text-gray-400 text-center py-12">Carregando...</div>
          ) : historico.length === 0 ? (
            <GlassCard className="text-center py-10">
              <div className="text-gray-400">
                Nenhum checklist executado ainda.
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {historico.map((exec) => (
                <GlassCard key={exec.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {exec.modelo?.nome ?? "—"}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        🔧 {exec.equipamento?.nome ?? "—"}
                        {exec.operador && ` · ${exec.operador.name}`}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {formatDateTime(exec.data_hora)}
                      </div>
                    </div>
                    <StatusBadge
                      status={
                        exec.status === "com_anomalia"
                          ? "cancelada"
                          : "concluida"
                      }
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Criar/Editar Modelo (gestor) */}
      <GlassModal
        open={modalModelo}
        onClose={() => setModalModelo(false)}
        title={
          editandoModelo
            ? `Editar Modelo — ${editandoModelo.nome}`
            : "Novo Modelo de Checklist"
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nome *</label>
              <input
                value={formModelo.nome}
                onChange={(e) =>
                  setFormModelo({ ...formModelo, nome: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Periodicidade *
              </label>
              <select
                value={formModelo.periodicidade}
                onChange={(e) =>
                  setFormModelo({
                    ...formModelo,
                    periodicidade: e.target.value,
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
            {!editandoModelo && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Tipo de equipamento
                </label>
                <select
                  value={formModelo.tipo_equipamento}
                  onChange={(e) =>
                    setFormModelo({
                      ...formModelo,
                      tipo_equipamento: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Todos</option>
                  <option value="veiculo">Veículo</option>
                  <option value="maquina">Máquina</option>
                  <option value="eletrico_hidraulico">
                    Elétrico/Hidráulico
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Itens do modelo */}
          <div>
            <div className="text-xs text-gray-400 font-medium mb-2">
              Itens do checklist
            </div>
            {(editandoModelo ? itensEdicao : itensNovos).length === 0 && (
              <div className="text-gray-500 text-xs text-center py-3 bg-white/5 rounded-lg">
                Nenhum item adicionado.
              </div>
            )}
            {(editandoModelo
              ? itensEdicao
              : (itensNovos as unknown as ItemChecklist[])
            ).map((item, i) => (
              <div
                key={editandoModelo ? item.id : i}
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-1.5"
              >
                <span className="flex-1 text-white text-xs">
                  {item.descricao}
                </span>
                <span className="text-gray-500 text-xs">
                  {item.tipo_resposta}
                </span>
                {item.critico && (
                  <span className="text-red-400 text-xs">crítico</span>
                )}
                {editandoModelo ? (
                  <button
                    onClick={() => excluirItemEdicao(item.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setItensNovos((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <input
                value={novoItem.descricao}
                onChange={(e) =>
                  setNovoItem({ ...novoItem, descricao: e.target.value })
                }
                placeholder="Descrição do item"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
              />
              <select
                value={novoItem.tipo_resposta}
                onChange={(e) =>
                  setNovoItem({ ...novoItem, tipo_resposta: e.target.value })
                }
                className="bg-[#0a1628] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                <option value="ok_nok">OK/NOK</option>
                <option value="valor_numerico">Numérico</option>
                <option value="texto">Texto</option>
              </select>
              <label className="flex items-center gap-1 text-gray-400 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoItem.critico}
                  onChange={(e) =>
                    setNovoItem({ ...novoItem, critico: e.target.checked })
                  }
                  className="accent-red-500"
                />
                Crítico
              </label>
              <button
                onClick={adicionarItemLocal}
                disabled={!novoItem.descricao.trim()}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg"
              >
                + Item
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalModelo(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarModelo}
              disabled={!formModelo.nome}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Modal execução */}
      <GlassModal
        open={execucaoAberta}
        onClose={() => setExecucaoAberta(false)}
        title={`Checklist: ${modeloSelecionado?.nome ?? ""}`}
        size="lg"
      >
        {modeloSelecionado && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Equipamento *
              </label>
              <select
                value={equipamentoId}
                onChange={(e) => setEquipamentoId(e.target.value)}
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

            {equipamentoId &&
              (() => {
                const eq = equipamentos.find(
                  (e) => e.id === Number(equipamentoId),
                );
                const temHorimetro =
                  eq &&
                  ["maquina_pesada", "maquina", "eletrico_hidraulico"].includes(
                    eq.tipo,
                  );
                const temHodometro =
                  eq &&
                  [
                    "caminhao",
                    "veiculo_leve",
                    "utilitario",
                    "veiculo",
                  ].includes(eq.tipo);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {temHodometro && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Hodômetro atual (km)
                        </label>
                        <input
                          type="number"
                          value={hodometro}
                          onChange={(e) => setHodometro(e.target.value)}
                          placeholder={
                            eq?.hodometro_atual
                              ? String(eq.hodometro_atual)
                              : "km"
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}
                    {temHorimetro && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Horímetro atual (h)
                        </label>
                        <input
                          type="number"
                          value={horimetro}
                          onChange={(e) => setHorimetro(e.target.value)}
                          placeholder={
                            eq?.horimetro_atual
                              ? String(eq.horimetro_atual)
                              : "h"
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}
                    {!temHodometro && !temHorimetro && (
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">
                          Horímetro atual (h)
                        </label>
                        <input
                          type="number"
                          value={horimetro}
                          onChange={(e) => setHorimetro(e.target.value)}
                          placeholder="h"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

            <div className="space-y-3">
              <div className="text-sm text-gray-300 font-medium">
                Itens do checklist
              </div>
              {modeloSelecionado.itens
                .slice()
                .sort((a, b) => a.ordem - b.ordem)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg ${item.critico ? "bg-red-500/10 border border-red-500/20" : "bg-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-white text-sm">
                          {item.descricao}
                        </div>
                        {item.critico && (
                          <span className="text-xs text-red-400 mt-0.5 block">
                            ⚠ Item crítico
                          </span>
                        )}
                      </div>
                      {item.tipo_resposta === "ok_nok" ? (
                        <div className="flex gap-2 shrink-0">
                          {(["ok", "nok"] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() =>
                                setRespostas({ ...respostas, [item.id]: v })
                              }
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                respostas[item.id] === v
                                  ? v === "ok"
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-white/10 text-gray-400 hover:text-white"
                              }`}
                            >
                              {v.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={
                            item.tipo_resposta === "valor_numerico"
                              ? "number"
                              : "text"
                          }
                          value={respostas[item.id] ?? ""}
                          onChange={(e) =>
                            setRespostas({
                              ...respostas,
                              [item.id]: e.target.value,
                            })
                          }
                          className="w-32 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                          placeholder="Valor"
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setExecucaoAberta(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={executar}
                disabled={!equipamentoId}
                className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Finalizar Checklist
              </button>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

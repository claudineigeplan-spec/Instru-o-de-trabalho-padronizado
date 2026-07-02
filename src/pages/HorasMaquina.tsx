import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { horasEquipamentoService } from "../services/horasEquipamento";
import { equipamentosService } from "../services/equipamentos";
import { contratosService } from "../services/contratos";
import { colaboradoresService } from "../services/colaboradores";
import { motivosParadaService } from "../services/motivosParada";
import { resolveErrorMessage } from "../services/api";
import { formatTipoEquipamento } from "../utils/format";
import type {
  HorasEquipamento,
  Equipamento,
  Contrato,
  Colaborador,
  MotivoParada,
} from "../types";

type StatusHoras = "rascunho" | "enviado" | "validado";

const STATUS_LABEL: Record<StatusHoras, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  validado: "Validado",
};
const STATUS_COR: Record<StatusHoras, string> = {
  rascunho: "#64748b",
  enviado: "#3b82f6",
  validado: "#10b981",
};

const FORM_VAZIO = {
  codigo: "",
  data: new Date().toISOString().slice(0, 10),
  equipamento_id: "",
  operador_id: "",
  contrato_id: "",
  hora_inicio: "07:00",
  hora_fim: "17:00",
  horimetro_inicial: "",
  horimetro_final: "",
  horas_paradas: "0",
  motivo_parada_id: "",
  observacoes: "",
};

export default function HorasMaquina() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar =
    user?.role === "gestor" ||
    user?.role === "lider_campo" ||
    user?.role === "operador" ||
    user?.role === "motorista";

  const [registros, setRegistros] = useState<HorasEquipamento[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [motivos, setMotivos] = useState<MotivoParada[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [detalhe, setDetalhe] = useState<HorasEquipamento | null>(null);
  const [dados, setDados] = useState({ ...FORM_VAZIO });

  function carregar() {
    setLoading(true);
    Promise.all([
      horasEquipamentoService.listar(),
      equipamentosService.listar(),
      contratosService.listar(),
      colaboradoresService.listar(),
      motivosParadaService.listar(),
    ])
      .then(([r, eq, c, col, m]) => {
        setRegistros(r);
        setEquipamentos(eq);
        setContratos(c);
        setColaboradores(col);
        setMotivos(m);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const lista = registros.filter((h) => {
    const okStatus = filtroStatus === "todos" || h.status === filtroStatus;
    const okData = !filtroData || h.data.slice(0, 10) === filtroData;
    return okStatus && okData;
  });

  const totalProdutivas = lista.reduce(
    (s, h) => s + Number(h.horas_produtivas),
    0,
  );
  const totalImprodutivas = lista.reduce(
    (s, h) => s + Number(h.horas_improdutivas),
    0,
  );
  const totalParadas = lista.reduce((s, h) => s + Number(h.horas_paradas), 0);
  const totalGeral = totalProdutivas + totalImprodutivas + totalParadas;
  const dispMecanica =
    totalGeral > 0
      ? Math.round(((totalGeral - totalParadas) / totalGeral) * 100)
      : 0;

  function calcHoras(inicio: string, fim: string, paradas: string): number {
    if (!inicio || !fim) return 0;
    const [hi, mi] = inicio.split(":").map(Number);
    const [hf, mf] = fim.split(":").map(Number);
    const total = (hf * 60 + mf - (hi * 60 + mi)) / 60;
    return Math.max(0, total - parseFloat(paradas || "0"));
  }
  const horasProd = calcHoras(
    dados.hora_inicio,
    dados.hora_fim,
    dados.horas_paradas,
  );

  function abrirNovo() {
    setDados({
      ...FORM_VAZIO,
      codigo: `HE-${Date.now().toString().slice(-8)}`,
      operador_id: "",
    });
    setModalAberto(true);
  }

  async function handleSalvar() {
    if (
      !dados.codigo ||
      !dados.equipamento_id ||
      !dados.hora_inicio ||
      !dados.hora_fim
    ) {
      toast.error("Preencha código, equipamento e horários.");
      return;
    }
    try {
      await horasEquipamentoService.criar({
        codigo: dados.codigo,
        equipamento_id: Number(dados.equipamento_id),
        contrato_id: dados.contrato_id ? Number(dados.contrato_id) : undefined,
        operador_id: dados.operador_id ? Number(dados.operador_id) : undefined,
        data: dados.data,
        hora_inicio: dados.hora_inicio,
        hora_fim: dados.hora_fim,
        horimetro_inicial: dados.horimetro_inicial
          ? Number(dados.horimetro_inicial)
          : undefined,
        horimetro_final: dados.horimetro_final
          ? Number(dados.horimetro_final)
          : undefined,
        horas_produtivas: horasProd,
        horas_improdutivas: 0,
        horas_paradas: parseFloat(dados.horas_paradas || "0"),
        motivo_parada_id: dados.motivo_parada_id
          ? Number(dados.motivo_parada_id)
          : undefined,
        observacoes: dados.observacoes || undefined,
      });
      toast.success("Registro de horas salvo com sucesso.");
      setModalAberto(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Horas de Equipamento
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Apontamento de horímetro, máquinas e caminhões
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={abrirNovo}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novo Registro
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Horas Produtivas",
            valor: `${totalProdutivas.toFixed(1)} h`,
            cor: "#10b981",
          },
          {
            label: "Horas Improdutivas",
            valor: `${totalImprodutivas.toFixed(1)} h`,
            cor: "#f97316",
          },
          {
            label: "Horas Paradas",
            valor: `${totalParadas.toFixed(1)} h`,
            cor: "#ef4444",
          },
          {
            label: "Disponib. Mecânica",
            valor: `${dispMecanica}%`,
            cor:
              dispMecanica >= 85
                ? "#10b981"
                : dispMecanica >= 70
                  ? "#f97316"
                  : "#ef4444",
          },
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
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
          />
          <div className="flex gap-2 flex-wrap">
            {(["todos", "rascunho", "enviado", "validado"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filtroStatus === s ? "bg-[#1e3a8a] text-white" : "text-gray-400 hover:text-white bg-white/5"}`}
                >
                  {s === "todos" ? "Todos" : STATUS_LABEL[s as StatusHoras]}
                </button>
              ),
            )}
          </div>
          {filtroData && (
            <button
              onClick={() => setFiltroData("")}
              className="text-gray-400 hover:text-white text-sm px-3 py-1.5 bg-white/5 rounded-lg"
            >
              Limpar data
            </button>
          )}
        </div>
      </GlassCard>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Carregando registros...
        </p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhum registro encontrado.
        </p>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-gray-400 text-xs">
                  <th className="text-left p-4">Código</th>
                  <th className="text-left p-4">Data</th>
                  <th className="text-left p-4">Equipamento</th>
                  <th className="text-left p-4">Operador</th>
                  <th className="text-left p-4">Contrato</th>
                  <th className="text-right p-4">Prod.</th>
                  <th className="text-right p-4">Improd.</th>
                  <th className="text-right p-4">Parada</th>
                  <th className="text-left p-4">Motivo Parada</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((h) => (
                  <tr
                    key={h.id}
                    onClick={() => setDetalhe(h)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-mono text-orange-400 text-xs">
                      {h.codigo}
                    </td>
                    <td className="p-4 text-gray-300 text-xs">
                      {new Date(
                        h.data.slice(0, 10) + "T00:00:00",
                      ).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4">
                      <p className="text-white text-xs font-medium">
                        {h.equipamento?.nome}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {h.equipamento
                          ? formatTipoEquipamento(h.equipamento.tipo)
                          : ""}
                      </p>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {h.operador?.nome ?? "—"}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {h.contrato?.numero ?? "—"}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-green-400 font-semibold text-xs">
                        {Number(h.horas_produtivas).toFixed(1)}h
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-orange-400 text-xs">
                        {Number(h.horas_improdutivas).toFixed(1)}h
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-xs ${Number(h.horas_paradas) > 0 ? "text-red-400" : "text-gray-600"}`}
                      >
                        {Number(h.horas_paradas).toFixed(1)}h
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {h.motivo_parada?.descricao ?? "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: STATUS_COR[h.status] + "33",
                          color: STATUS_COR[h.status],
                        }}
                      >
                        {STATUS_LABEL[h.status]}
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
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe?.codigo ?? ""}
        size="lg"
      >
        {detalhe && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <p className="text-gray-400 text-xs">Equipamento</p>
                <p className="text-white font-medium">
                  {detalhe.equipamento?.nome}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Data</p>
                <p className="text-white">
                  {new Date(
                    detalhe.data.slice(0, 10) + "T00:00:00",
                  ).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Operador</p>
                <p className="text-white">{detalhe.operador?.nome ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Horário</p>
                <p className="text-white">
                  {detalhe.hora_inicio} – {detalhe.hora_fim}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Contrato</p>
                <p className="text-orange-400">
                  {detalhe.contrato?.numero ?? "—"}
                </p>
              </div>
              {detalhe.horimetro_inicial !== null && (
                <>
                  <div>
                    <p className="text-gray-400 text-xs">Horímetro Inicial</p>
                    <p className="text-white">{detalhe.horimetro_inicial} h</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Horímetro Final</p>
                    <p className="text-white">{detalhe.horimetro_final} h</p>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 bg-white/5 rounded-lg p-3">
              <div className="text-center">
                <p className="text-green-400 text-xl font-bold">
                  {Number(detalhe.horas_produtivas).toFixed(1)}h
                </p>
                <p className="text-gray-500 text-xs mt-0.5">Produtivas</p>
              </div>
              <div className="text-center">
                <p className="text-orange-400 text-xl font-bold">
                  {Number(detalhe.horas_improdutivas).toFixed(1)}h
                </p>
                <p className="text-gray-500 text-xs mt-0.5">Improdutivas</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 text-xl font-bold">
                  {Number(detalhe.horas_paradas).toFixed(1)}h
                </p>
                <p className="text-gray-500 text-xs mt-0.5">Paradas</p>
              </div>
            </div>
            {detalhe.motivo_parada && (
              <div>
                <p className="text-gray-400 text-xs">Motivo da Parada</p>
                <p className="text-white">{detalhe.motivo_parada.descricao}</p>
              </div>
            )}
            {detalhe.observacoes && (
              <div>
                <p className="text-gray-400 text-xs">Observações</p>
                <p className="text-white">{detalhe.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </GlassModal>

      <GlassModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Novo Registro de Horas"
        size="lg"
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Código *
              </label>
              <input
                value={dados.codigo}
                onChange={(e) => setDados({ ...dados, codigo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Data *</label>
              <input
                type="date"
                value={dados.data}
                onChange={(e) => setDados({ ...dados, data: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Contrato
              </label>
              <select
                value={dados.contrato_id}
                onChange={(e) =>
                  setDados({ ...dados, contrato_id: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">—</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Operador
              </label>
              <select
                value={dados.operador_id}
                onChange={(e) =>
                  setDados({ ...dados, operador_id: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">—</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-gray-400 text-xs block mb-1">
                Equipamento *
              </label>
              <select
                value={dados.equipamento_id}
                onChange={(e) =>
                  setDados({ ...dados, equipamento_id: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Selecione o equipamento...</option>
                {equipamentos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Hora Início *
              </label>
              <input
                type="time"
                value={dados.hora_inicio}
                onChange={(e) =>
                  setDados({ ...dados, hora_inicio: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Hora Fim *
              </label>
              <input
                type="time"
                value={dados.hora_fim}
                onChange={(e) =>
                  setDados({ ...dados, hora_fim: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Horímetro Inicial
              </label>
              <input
                type="number"
                placeholder="ex: 9234"
                value={dados.horimetro_inicial}
                onChange={(e) =>
                  setDados({ ...dados, horimetro_inicial: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Horímetro Final
              </label>
              <input
                type="number"
                placeholder="ex: 9245"
                value={dados.horimetro_final}
                onChange={(e) =>
                  setDados({ ...dados, horimetro_final: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Horas Paradas
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={dados.horas_paradas}
                onChange={(e) =>
                  setDados({ ...dados, horas_paradas: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">
                Motivo da Parada
              </label>
              <select
                value={dados.motivo_parada_id}
                onChange={(e) =>
                  setDados({ ...dados, motivo_parada_id: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Nenhum</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-gray-400 text-xs block mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                value={dados.observacoes}
                onChange={(e) =>
                  setDados({ ...dados, observacoes: e.target.value })
                }
                placeholder="Descrição do serviço executado, local, km..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {dados.hora_inicio && dados.hora_fim && (
            <div className="bg-white/5 rounded-lg p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-green-400 font-bold text-lg">
                  {horasProd.toFixed(1)}h
                </p>
                <p className="text-gray-500">Produtivas</p>
              </div>
              <div>
                <p className="text-red-400 font-bold text-lg">
                  {parseFloat(dados.horas_paradas || "0").toFixed(1)}h
                </p>
                <p className="text-gray-500">Paradas</p>
              </div>
              <div>
                <p className="text-white font-bold text-lg">
                  {(horasProd + parseFloat(dados.horas_paradas || "0")).toFixed(
                    1,
                  )}
                  h
                </p>
                <p className="text-gray-500">Total</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSalvar}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Salvar Registro
            </button>
            <button
              onClick={() => setModalAberto(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-sm py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { apontamentosService } from "../services/apontamentos";
import { contratosService } from "../services/contratos";
import { equipesService } from "../services/equipes";
import { atividadesService } from "../services/atividades";
import { resolveErrorMessage } from "../services/api";
import type {
  ApontamentoProducao,
  Contrato,
  EquipeCampo,
  Atividade,
  Trecho,
  TurnoTrabalho,
  StatusApontamento,
} from "../types";

const TURNO_LABEL: Record<TurnoTrabalho, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};
const TURNO_COR: Record<TurnoTrabalho, string> = {
  manha: "#f5c518",
  tarde: "#f97316",
  noite: "#8b5cf6",
  integral: "#3b82f6",
};

const STATUS_LABEL: Record<StatusApontamento, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  validado: "Validado",
  rejeitado: "Rejeitado",
};
const STATUS_COR: Record<StatusApontamento, string> = {
  rascunho: "#64748b",
  enviado: "#3b82f6",
  validado: "#10b981",
  rejeitado: "#ef4444",
};

const SENTIDOS = ["crescente", "decrescente", "ambos"];
const LADOS = ["esquerdo", "direito", "ambos"];

function localizacaoDe(a: ApontamentoProducao): string {
  if (a.trecho) return a.trecho.descricao;
  if (a.km_inicial != null && a.km_final != null) {
    let s = `Km ${a.km_inicial}–${a.km_final}`;
    if (a.sentido) s += ` · sentido ${a.sentido}`;
    if (a.lado && a.lado !== "ambos") s += ` · lado ${a.lado}`;
    return s;
  }
  return "—";
}

function agruparPorData(lista: ApontamentoProducao[]) {
  const map = new Map<string, ApontamentoProducao[]>();
  lista.forEach((a) => {
    const d = a.data.slice(0, 10);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(a);
  });
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

const FORM_VAZIO = {
  codigo: "",
  data: new Date().toISOString().split("T")[0],
  turno: "manha" as TurnoTrabalho,
  contrato_id: "",
  equipe_id: "",
  atividade_id: "",
  trecho_id: "",
  km_inicial: "",
  km_final: "",
  sentido: "",
  lado: "",
  quantidade_executada: "",
  unidade: "m²",
  observacoes: "",
};
type FormState = typeof FORM_VAZIO;

export default function Apontamento() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [lista, setLista] = useState<ApontamentoProducao[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [equipes, setEquipes] = useState<EquipeCampo[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [trechosContrato, setTrechosContrato] = useState<Trecho[]>([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [filtroEquipe, setFiltroEquipe] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusApontamento | "">("");
  const [filtroData, setFiltroData] = useState("");
  const [detalhe, setDetalhe] = useState<ApontamentoProducao | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [editando, setEditando] = useState<ApontamentoProducao | null>(null);
  const [form, setForm] = useState<FormState>({ ...FORM_VAZIO });
  const [visao, setVisao] = useState<"agrupada" | "lista">("agrupada");

  function carregar() {
    setLoading(true);
    Promise.all([
      apontamentosService.listar(),
      contratosService.listar(),
      equipesService.listar(),
      atividadesService.listar(),
    ])
      .then(([a, c, e, at]) => {
        setLista(a);
        setContratos(c);
        setEquipes(e);
        setAtividades(at);
      })
      .catch((err) => toast.error(resolveErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    if (!form.contrato_id) {
      setTrechosContrato([]);
      return;
    }
    contratosService
      .buscar(Number(form.contrato_id))
      .then((c) => setTrechosContrato(c.trechos ?? []))
      .catch(() => setTrechosContrato([]));
  }, [form.contrato_id]);

  const filtrada = lista.filter((a) => {
    const eq = !filtroEquipe || String(a.equipe_id) === filtroEquipe;
    const st = !filtroStatus || a.status === filtroStatus;
    const dt = !filtroData || a.data.slice(0, 10) === filtroData;
    const b = busca.toLowerCase();
    const bk =
      !b ||
      (a.atividade?.nome ?? "").toLowerCase().includes(b) ||
      a.codigo.toLowerCase().includes(b);
    return eq && st && dt && bk;
  });

  const hoje = new Date().toISOString().split("T")[0];
  const apontamentosHoje = lista.filter(
    (a) => a.data.slice(0, 10) === hoje,
  ).length;
  const validadosHoje = lista.filter(
    (a) => a.data.slice(0, 10) === hoje && a.status === "validado",
  ).length;
  const pendentesValidacao = lista.filter((a) => a.status === "enviado").length;
  const rejeitados = lista.filter((a) => a.status === "rejeitado").length;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function abrirNovo(a?: ApontamentoProducao) {
    setEditando(a ?? null);
    setForm(
      a
        ? {
            codigo: a.codigo,
            data: a.data.slice(0, 10),
            turno: a.turno,
            contrato_id: String(a.contrato_id),
            equipe_id: String(a.equipe_id ?? ""),
            atividade_id: String(a.atividade_id),
            trecho_id: String(a.trecho_id ?? ""),
            km_inicial: a.km_inicial != null ? String(a.km_inicial) : "",
            km_final: a.km_final != null ? String(a.km_final) : "",
            sentido: a.sentido ?? "",
            lado: a.lado ?? "",
            quantidade_executada: String(a.quantidade_executada),
            unidade: a.unidade,
            observacoes: a.observacoes ?? "",
          }
        : { ...FORM_VAZIO, codigo: `AP-${Date.now().toString().slice(-8)}` },
    );
    setModalNovo(true);
  }

  async function salvar() {
    if (!form.codigo || !form.contrato_id || !form.atividade_id) {
      toast.error("Preencha código, contrato e atividade.");
      return;
    }
    const payload = {
      codigo: form.codigo,
      contrato_id: Number(form.contrato_id),
      equipe_id: form.equipe_id ? Number(form.equipe_id) : undefined,
      atividade_id: Number(form.atividade_id),
      trecho_id: form.trecho_id ? Number(form.trecho_id) : undefined,
      data: form.data,
      turno: form.turno,
      km_inicial: form.km_inicial ? Number(form.km_inicial) : undefined,
      km_final: form.km_final ? Number(form.km_final) : undefined,
      sentido: form.sentido || undefined,
      lado: form.lado || undefined,
      quantidade_executada: Number(form.quantidade_executada) || 0,
      unidade: form.unidade,
      observacoes: form.observacoes || undefined,
    };
    try {
      if (editando) {
        await apontamentosService.atualizar(editando.id, payload);
        toast.success("Apontamento atualizado.");
      } else {
        await apontamentosService.criar(payload);
        toast.success("Apontamento criado.");
      }
      setModalNovo(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function enviar(id: number) {
    try {
      await apontamentosService.enviar(id);
      toast.success("Apontamento enviado para validação.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }
  async function validar(id: number) {
    try {
      await apontamentosService.validar(id);
      toast.success("Apontamento validado.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }
  async function rejeitar(id: number) {
    const motivo = prompt("Motivo da rejeição:");
    if (!motivo) return;
    try {
      await apontamentosService.rejeitar(id, motivo);
      toast.error("Apontamento rejeitado.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  const gruposPorData = agruparPorData(filtrada);

  function CardApontamento({ a }: { a: ApontamentoProducao }) {
    return (
      <div
        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
        style={{ borderLeftColor: STATUS_COR[a.status], borderLeftWidth: 3 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-400 text-xs font-mono">
                {a.codigo}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  color: TURNO_COR[a.turno],
                  backgroundColor: `${TURNO_COR[a.turno]}20`,
                }}
              >
                {TURNO_LABEL[a.turno]}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  color: STATUS_COR[a.status],
                  backgroundColor: `${STATUS_COR[a.status]}20`,
                }}
              >
                {STATUS_LABEL[a.status]}
              </span>
            </div>
            <div className="text-white font-semibold text-sm mt-1">
              {a.atividade?.nome}
            </div>
            <div className="text-gray-400 text-xs mt-0.5">
              {localizacaoDe(a)}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {a.equipe?.nome ?? "—"} · {a.contrato?.numero ?? "—"}
            </div>
            {a.observacoes && (
              <div className="text-gray-500 text-xs mt-1 italic">
                {a.observacoes}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-bold text-lg">
              {a.quantidade_executada > 0
                ? Number(a.quantidade_executada).toLocaleString("pt-BR")
                : "—"}
            </div>
            <div className="text-gray-400 text-xs">{a.unidade}</div>
          </div>
        </div>
        {podeEditar && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setDetalhe(a)}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 border border-white/10 rounded"
            >
              Ver
            </button>
            {a.status === "rascunho" && (
              <>
                <button
                  onClick={() => abrirNovo(a)}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 border border-white/10 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => enviar(a.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 border border-blue-500/30 rounded"
                >
                  Enviar
                </button>
              </>
            )}
            {a.status === "enviado" && (
              <>
                <button
                  onClick={() => validar(a.id)}
                  className="text-xs text-green-400 hover:text-green-300 px-2 py-1 border border-green-500/30 rounded"
                >
                  Validar
                </button>
                <button
                  onClick={() => rejeitar(a.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                >
                  Rejeitar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Apontamento de Campo</h1>
        {podeEditar && (
          <button
            onClick={() => abrirNovo()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Apontamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Apontamentos Hoje</div>
          <div className="text-3xl font-bold text-white">
            {apontamentosHoje}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {validadosHoje} validados
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Aguardando Validação</div>
          <div
            className={`text-3xl font-bold ${pendentesValidacao > 0 ? "text-yellow-400" : "text-green-400"}`}
          >
            {pendentesValidacao}
          </div>
          <div className="text-xs text-gray-400 mt-1">enviados pelo campo</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Rejeitados</div>
          <div
            className={`text-3xl font-bold ${rejeitados > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {rejeitados}
          </div>
          <div className="text-xs text-gray-400 mt-1">requerem correção</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {lista.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {lista.filter((a) => a.status === "validado").length} validados
          </div>
        </GlassCard>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar serviço ou código..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        />
        <select
          value={filtroEquipe}
          onChange={(e) => setFiltroEquipe(e.target.value)}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-w-[180px]"
        >
          <option value="">Todas as equipes</option>
          {equipes.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(
            ["", "rascunho", "enviado", "validado", "rejeitado"] as (
              StatusApontamento | ""
            )[]
          ).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s as StatusApontamento | "")}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatus === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
            >
              {s ? STATUS_LABEL[s as StatusApontamento] : "Todos"}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["agrupada", "lista"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${visao === v ? "bg-[#1e3a8a] text-white" : "bg-white/5 text-gray-400"}`}
            >
              {v === "agrupada" ? "Por dia" : "Lista"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Carregando apontamentos...</div>
        </GlassCard>
      ) : filtrada.length === 0 ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Nenhum apontamento encontrado.</div>
        </GlassCard>
      ) : visao === "agrupada" ? (
        <div className="space-y-6">
          {gruposPorData.map(([data, itens]) => (
            <div key={data}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-white font-semibold">{data}</div>
                <div className="text-gray-500 text-xs">
                  {itens.length} apontamento{itens.length > 1 ? "s" : ""}
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className="text-gray-400 text-xs">
                  {itens.filter((a) => a.status === "validado").length}{" "}
                  validados
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {itens.map((a) => (
                  <CardApontamento key={a.id} a={a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtrada.map((a) => (
            <CardApontamento key={a.id} a={a} />
          ))}
        </div>
      )}

      {/* Modal detalhe */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe?.codigo ?? ""}
        size="lg"
      >
        {detalhe && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Data:</span>{" "}
                <span className="text-white">{detalhe.data.slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-gray-400">Turno:</span>{" "}
                <span style={{ color: TURNO_COR[detalhe.turno] }}>
                  {TURNO_LABEL[detalhe.turno]}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Equipe:</span>{" "}
                <span className="text-white">
                  {detalhe.equipe?.nome ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Contrato:</span>{" "}
                <span className="text-orange-400">
                  {detalhe.contrato?.numero ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Responsável:</span>{" "}
                <span className="text-white">
                  {detalhe.responsavel?.name ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{" "}
                <span style={{ color: STATUS_COR[detalhe.status] }}>
                  {STATUS_LABEL[detalhe.status]}
                </span>
              </div>
            </div>

            {(detalhe.km_inicial != null || detalhe.trecho) && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <span className="text-gray-400">Localização:</span>{" "}
                  <span className="text-blue-300 font-semibold">
                    {localizacaoDe(detalhe)}
                  </span>
                </div>
                {detalhe.sentido && (
                  <div>
                    <span className="text-gray-400">Sentido:</span>{" "}
                    <span className="text-white">{detalhe.sentido}</span>
                  </div>
                )}
                {detalhe.lado && (
                  <div>
                    <span className="text-gray-400">Lado:</span>{" "}
                    <span className="text-white">{detalhe.lado}</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="text-gray-400 text-xs">Serviço</div>
              <div className="text-white font-semibold">
                {detalhe.atividade?.nome}
              </div>
              <div className="text-gray-400 text-xs">
                Qtd.:{" "}
                <span className="text-white font-bold text-lg ml-1">
                  {Number(detalhe.quantidade_executada).toLocaleString("pt-BR")}{" "}
                  {detalhe.unidade}
                </span>
              </div>
            </div>
            {detalhe.observacoes && (
              <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                {detalhe.observacoes}
              </div>
            )}
            {detalhe.status === "rejeitado" && detalhe.motivo_rejeicao && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300">
                Motivo da rejeição: {detalhe.motivo_rejeicao}
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* Modal novo/editar */}
      <GlassModal
        open={modalNovo}
        onClose={() => setModalNovo(false)}
        title={editando ? "Editar Apontamento" : "Novo Apontamento de Campo"}
        size="lg"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={form.codigo}
                onChange={(e) => setField("codigo", e.target.value)}
                disabled={!!editando}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setField("data", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Turno</label>
              <select
                value={form.turno}
                onChange={(e) =>
                  setField("turno", e.target.value as TurnoTrabalho)
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Contrato *
              </label>
              <select
                value={form.contrato_id}
                onChange={(e) => setField("contrato_id", e.target.value)}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Selecione...</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Equipe</label>
              <select
                value={form.equipe_id}
                onChange={(e) => setField("equipe_id", e.target.value)}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">—</option>
                {equipes
                  .filter(
                    (eq) =>
                      !form.contrato_id ||
                      String(eq.contrato_id) === form.contrato_id,
                  )
                  .map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Atividade *
              </label>
              <select
                value={form.atividade_id}
                onChange={(e) => {
                  const at = atividades.find(
                    (a) => a.id === Number(e.target.value),
                  );
                  setForm((p) => ({
                    ...p,
                    atividade_id: e.target.value,
                    unidade: at?.unidade_medida ?? p.unidade,
                  }));
                }}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Selecione...</option>
                {atividades.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} — {a.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-blue-500/20 rounded-xl p-4 space-y-3 bg-blue-500/5">
            <p className="text-xs text-blue-400 font-semibold">
              Posicionamento Rodoviário
            </p>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Trecho (opcional)
              </label>
              <select
                value={form.trecho_id}
                onChange={(e) => setField("trecho_id", e.target.value)}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">— Sem trecho vinculado —</option>
                {trechosContrato.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Km inicial
                </label>
                <input
                  type="number"
                  value={form.km_inicial}
                  onChange={(e) => setField("km_inicial", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Km final
                </label>
                <input
                  type="number"
                  value={form.km_final}
                  onChange={(e) => setField("km_final", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Sentido
                </label>
                <select
                  value={form.sentido}
                  onChange={(e) => setField("sentido", e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">—</option>
                  {SENTIDOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Lado</label>
                <select
                  value={form.lado}
                  onChange={(e) => setField("lado", e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">—</option>
                  {LADOS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Quantidade Executada
              </label>
              <input
                type="number"
                value={form.quantidade_executada}
                onChange={(e) =>
                  setField("quantidade_executada", e.target.value)
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Unidade
              </label>
              <input
                value={form.unidade}
                onChange={(e) => setField("unidade", e.target.value)}
                placeholder="m², t, m³, un..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setModalNovo(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!form.codigo || !form.contrato_id || !form.atividade_id}
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

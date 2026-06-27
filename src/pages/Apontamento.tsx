import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type Turno = "manha" | "tarde" | "noite";
type StatusApontamento = "rascunho" | "enviado" | "validado" | "rejeitado";

interface Apontamento {
  id: number;
  codigo: string;
  data: string;
  turno: Turno;
  equipe: string;
  contrato_codigo: string;
  localizacao: string;
  composicao: string;
  descricao_servico: string;
  unidade: string;
  quantidade: number;
  equipamentos: string;
  responsavel: string;
  status: StatusApontamento;
  observacoes: string;
}

/* ── Labels ──────────────────────────────────────────────── */

const TURNO_LABEL: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};
const TURNO_COR: Record<Turno, string> = {
  manha: "#f5c518",
  tarde: "#f97316",
  noite: "#8b5cf6",
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

const EQUIPES = [
  "Equipe A — Pavimentação",
  "Equipe B — Terraplanagem",
  "Equipe C — Drenagem",
  "Equipe D — Conservação",
];
const CONTRATOS = [
  "CON-2024-001",
  "CON-2024-002",
  "CON-2024-003",
  "CON-2024-004",
];

/* ── Dados fictícios ─────────────────────────────────────── */

const apontamentosIniciais: Apontamento[] = [
  {
    id: 1,
    codigo: "APT-2024-0621-A1",
    data: "2024-06-27",
    turno: "manha",
    equipe: "Equipe A — Pavimentação",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 147+200 a KM 147+800",
    composicao: "COMP-001",
    descricao_servico:
      "Lançamento e compactação de CBUQ — camada de rolamento 4cm",
    unidade: "t",
    quantidade: 180,
    equipamentos: "Acabadora DYNAPAC F1250C, Rolo RLO-8851",
    responsavel: "Ana Líder",
    status: "validado",
    observacoes: "Temperatura do CBUQ OK. 3 cargas. Concluído 11h30.",
  },
  {
    id: 2,
    codigo: "APT-2024-0621-A2",
    data: "2024-06-27",
    turno: "manha",
    equipe: "Equipe A — Pavimentação",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 145+000 a KM 147+200",
    composicao: "COMP-002",
    descricao_servico: "Imprimação betuminosa com CM-30",
    unidade: "m²",
    quantidade: 4400,
    equipamentos: "Distribuidor de asfalto, Vassoura mecânica",
    responsavel: "Ana Líder",
    status: "validado",
    observacoes: "Superfície limpa e seca. Aplicação uniforme.",
  },
  {
    id: 3,
    codigo: "APT-2024-0621-B1",
    data: "2024-06-27",
    turno: "manha",
    equipe: "Equipe B — Terraplanagem",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 151+400 a KM 152+100",
    composicao: "COMP-003",
    descricao_servico: "Corte e aterro compactado — 1ª categoria",
    unidade: "m³",
    quantidade: 1840,
    equipamentos:
      "Escavadeira QHB-2841, Motoniveladora MTR-0412, Pá-carregadeira FNT-3320",
    responsavel: "Fernando Enc.",
    status: "validado",
    observacoes: "Solo 1ª categoria. Grau de compactação conferido.",
  },
  {
    id: 4,
    codigo: "APT-2024-0621-C1",
    data: "2024-06-27",
    turno: "tarde",
    equipe: "Equipe C — Drenagem",
    contrato_codigo: "CON-2024-003",
    localizacao: "Av. Norte, trecho KM 0+000 a KM 0+480",
    composicao: "COMP-006",
    descricao_servico: "Assentamento de manilha de concreto D=600mm",
    unidade: "m",
    quantidade: 120,
    equipamentos: "Mini-retroescavadeira, Caminhão guindaste",
    responsavel: "Fernanda PCP",
    status: "enviado",
    observacoes: "Assentamento com nivelamento a laser.",
  },
  {
    id: 5,
    codigo: "APT-2024-0621-D1",
    data: "2024-06-27",
    turno: "manha",
    equipe: "Equipe D — Conservação",
    contrato_codigo: "CON-2024-004",
    localizacao: "MT-208 KM 0 a KM 18",
    composicao: "COMP-008",
    descricao_servico: "Roçada mecanizada de faixa de domínio",
    unidade: "km",
    quantidade: 18,
    equipamentos: "Trator MTB-7730 + roçadeira lateral",
    responsavel: "Ricardo Prod.",
    status: "enviado",
    observacoes: "Roçada bilateral 8m.",
  },
  {
    id: 6,
    codigo: "APT-2024-0620-A1",
    data: "2024-06-26",
    turno: "manha",
    equipe: "Equipe A — Pavimentação",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 146+400 a KM 147+000",
    composicao: "COMP-001",
    descricao_servico:
      "Lançamento e compactação de CBUQ — camada de rolamento 4cm",
    unidade: "t",
    quantidade: 200,
    equipamentos: "Acabadora DYNAPAC F1250C, Rolo RLO-8851, CMP-1184",
    responsavel: "Ana Líder",
    status: "validado",
    observacoes: "2 cargas de CBUQ. Temperatura conferida.",
  },
  {
    id: 7,
    codigo: "APT-2024-0620-B1",
    data: "2024-06-26",
    turno: "tarde",
    equipe: "Equipe B — Terraplanagem",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 152+100 a KM 152+600",
    composicao: "COMP-004",
    descricao_servico: "Compactação de aterro — 95% Proctor normal",
    unidade: "m²",
    quantidade: 9200,
    equipamentos: "Compactador CMP-1184, Motoniveladora MTR-0412",
    responsavel: "Fernando Enc.",
    status: "validado",
    observacoes: "",
  },
  {
    id: 8,
    codigo: "APT-2024-0619-D1",
    data: "2024-06-25",
    turno: "manha",
    equipe: "Equipe D — Conservação",
    contrato_codigo: "CON-2024-004",
    localizacao: "MT-208 KM 18 a KM 36",
    composicao: "COMP-009",
    descricao_servico: "Tapa-buracos com CBUQ a quente",
    unidade: "m²",
    quantidade: 95,
    equipamentos: "Caminhão CMB-5523, Placa compactadora",
    responsavel: "Ricardo Prod.",
    status: "rejeitado",
    observacoes:
      "Rejeitado: material aplicado fora da temperatura mínima. Refazer.",
  },
  {
    id: 9,
    codigo: "APT-2024-0627-B2",
    data: "2024-06-27",
    turno: "tarde",
    equipe: "Equipe B — Terraplanagem",
    contrato_codigo: "CON-2024-001",
    localizacao: "BR-163 KM 152+600 a KM 153+200",
    composicao: "COMP-003",
    descricao_servico: "Corte e aterro compactado — 1ª categoria",
    unidade: "m³",
    quantidade: 0,
    equipamentos: "Escavadeira QHB-2841",
    responsavel: "Fernando Enc.",
    status: "rascunho",
    observacoes: "Em andamento — apontamento do turno da tarde.",
  },
];

/* ── Utilitários ─────────────────────────────────────────── */

function agruparPorData(lista: Apontamento[]) {
  const map = new Map<string, Apontamento[]>();
  lista.forEach((a) => {
    if (!map.has(a.data)) map.set(a.data, []);
    map.get(a.data)!.push(a);
  });
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

const FORM_VAZIO = {
  codigo: "",
  data: new Date().toISOString().split("T")[0],
  turno: "manha" as Turno,
  equipe: EQUIPES[0],
  contrato_codigo: CONTRATOS[0],
  localizacao: "",
  composicao: "",
  descricao_servico: "",
  unidade: "m²",
  quantidade: "",
  equipamentos: "",
  responsavel: "",
  observacoes: "",
};

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Apontamento() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [lista, setLista] = useState<Apontamento[]>(apontamentosIniciais);
  const [busca, setBusca] = useState("");
  const [filtroEquipe, setFiltroEquipe] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusApontamento | "">("");
  const [filtroData, setFiltroData] = useState("");
  const [detalhe, setDetalhe] = useState<Apontamento | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [editando, setEditando] = useState<Apontamento | null>(null);
  const [form, setForm] = useState({ ...FORM_VAZIO });
  const [visao, setVisao] = useState<"agrupada" | "lista">("agrupada");

  const filtrada = lista.filter((a) => {
    const eq = !filtroEquipe || a.equipe === filtroEquipe;
    const st = !filtroStatus || a.status === filtroStatus;
    const dt = !filtroData || a.data === filtroData;
    const bk =
      !busca ||
      a.descricao_servico.toLowerCase().includes(busca.toLowerCase()) ||
      a.localizacao.toLowerCase().includes(busca.toLowerCase()) ||
      a.codigo.toLowerCase().includes(busca.toLowerCase());
    return eq && st && dt && bk;
  });

  /* KPIs */
  const hoje = new Date().toISOString().split("T")[0];
  const apontamentosHoje = lista.filter((a) => a.data === hoje).length;
  const validadosHoje = lista.filter(
    (a) => a.data === hoje && a.status === "validado",
  ).length;
  const pendentesValidacao = lista.filter((a) => a.status === "enviado").length;
  const rejeitados = lista.filter((a) => a.status === "rejeitado").length;

  function abrirNovo(a?: Apontamento) {
    setEditando(a ?? null);
    setForm(
      a
        ? {
            codigo: a.codigo,
            data: a.data,
            turno: a.turno,
            equipe: a.equipe,
            contrato_codigo: a.contrato_codigo,
            localizacao: a.localizacao,
            composicao: a.composicao,
            descricao_servico: a.descricao_servico,
            unidade: a.unidade,
            quantidade: String(a.quantidade),
            equipamentos: a.equipamentos,
            responsavel: a.responsavel,
            observacoes: a.observacoes,
          }
        : { ...FORM_VAZIO, responsavel: user?.name ?? "" },
    );
    setModalNovo(true);
  }

  function salvar() {
    if (!form.codigo || !form.descricao_servico || !form.localizacao) {
      toast.error("Preencha código, serviço e localização.");
      return;
    }
    if (editando) {
      setLista((p) =>
        p.map((a) =>
          a.id === editando.id
            ? { ...a, ...form, quantidade: Number(form.quantidade) || 0 }
            : a,
        ),
      );
      toast.success("Apontamento atualizado.");
    } else {
      setLista((p) => [
        {
          id: Date.now(),
          ...form,
          quantidade: Number(form.quantidade) || 0,
          status: "rascunho",
        },
        ...p,
      ]);
      toast.success("Apontamento criado.");
    }
    setModalNovo(false);
  }

  function validar(id: number) {
    setLista((p) =>
      p.map((a) => (a.id === id ? { ...a, status: "validado" } : a)),
    );
    toast.success("Apontamento validado.");
  }
  function rejeitar(id: number) {
    setLista((p) =>
      p.map((a) => (a.id === id ? { ...a, status: "rejeitado" } : a)),
    );
    toast.error("Apontamento rejeitado.");
  }
  function enviar(id: number) {
    setLista((p) =>
      p.map((a) => (a.id === id ? { ...a, status: "enviado" } : a)),
    );
    toast.success("Apontamento enviado para validação.");
  }

  const gruposPorData = agruparPorData(filtrada);

  function CardApontamento({ a }: { a: Apontamento }) {
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
              {a.descricao_servico}
            </div>
            <div className="text-gray-400 text-xs mt-0.5">{a.localizacao}</div>
            <div className="text-gray-500 text-xs mt-1">
              {a.equipe} · {a.contrato_codigo}
              {a.equipamentos ? ` · ${a.equipamentos}` : ""}
            </div>
            {a.observacoes && (
              <div className="text-gray-500 text-xs mt-1 italic">
                {a.observacoes}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-white font-bold text-lg">
              {a.quantidade > 0 ? a.quantidade.toLocaleString("pt-BR") : "—"}
            </div>
            <div className="text-gray-400 text-xs">{a.unidade}</div>
            <div className="text-gray-400 text-xs font-mono mt-1">
              {a.composicao}
            </div>
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
      {/* Cabeçalho */}
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

      {/* KPIs */}
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
          <div className="text-gray-400 text-xs mb-1">Total (semana)</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {lista.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {lista.filter((a) => a.status === "validado").length} validados
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar serviço ou localização..."
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
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-w-[160px]"
        >
          <option value="">Todas as equipes</option>
          {EQUIPES.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
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

      {/* Conteúdo */}
      {filtrada.length === 0 ? (
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
      >
        {detalhe && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Data:</span>{" "}
                <span className="text-white">{detalhe.data}</span>
              </div>
              <div>
                <span className="text-gray-400">Turno:</span>{" "}
                <span style={{ color: TURNO_COR[detalhe.turno] }}>
                  {TURNO_LABEL[detalhe.turno]}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Equipe:</span>{" "}
                <span className="text-white">{detalhe.equipe}</span>
              </div>
              <div>
                <span className="text-gray-400">Contrato:</span>{" "}
                <span className="text-white">{detalhe.contrato_codigo}</span>
              </div>
              <div>
                <span className="text-gray-400">Responsável:</span>{" "}
                <span className="text-white">{detalhe.responsavel}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{" "}
                <span style={{ color: STATUS_COR[detalhe.status] }}>
                  {STATUS_LABEL[detalhe.status]}
                </span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="text-gray-400 text-xs">Serviço</div>
              <div className="text-white font-semibold">
                {detalhe.descricao_servico}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <span className="text-gray-400 text-xs">Ref.:</span>{" "}
                  <span className="font-mono text-[#f97316] text-sm ml-1">
                    {detalhe.composicao}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Qtd.:</span>{" "}
                  <span className="text-white font-bold text-lg ml-1">
                    {detalhe.quantidade.toLocaleString("pt-BR")}{" "}
                    {detalhe.unidade}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Localização:</span>
              <div className="text-white text-sm mt-0.5">
                {detalhe.localizacao}
              </div>
            </div>
            {detalhe.equipamentos && (
              <div>
                <span className="text-gray-400 text-xs">Equipamentos:</span>
                <div className="text-white text-sm mt-0.5">
                  {detalhe.equipamentos}
                </div>
              </div>
            )}
            {detalhe.observacoes && (
              <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                {detalhe.observacoes}
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
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                disabled={!!editando}
                placeholder="APT-2024-0627-A1"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Turno</label>
              <select
                value={form.turno}
                onChange={(e) =>
                  setForm({ ...form, turno: e.target.value as Turno })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Equipe</label>
              <select
                value={form.equipe}
                onChange={(e) => setForm({ ...form, equipe: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {EQUIPES.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Contrato
              </label>
              <select
                value={form.contrato_codigo}
                onChange={(e) =>
                  setForm({ ...form, contrato_codigo: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {CONTRATOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Responsável
              </label>
              <input
                value={form.responsavel}
                onChange={(e) =>
                  setForm({ ...form, responsavel: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Localização *
            </label>
            <input
              value={form.localizacao}
              onChange={(e) =>
                setForm({ ...form, localizacao: e.target.value })
              }
              placeholder="BR-163 KM 147+200 a KM 147+800"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Serviço *
            </label>
            <input
              value={form.descricao_servico}
              onChange={(e) =>
                setForm({ ...form, descricao_servico: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Comp. (ref.)
              </label>
              <input
                value={form.composicao}
                onChange={(e) =>
                  setForm({ ...form, composicao: e.target.value })
                }
                placeholder="COMP-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                value={form.quantidade}
                onChange={(e) =>
                  setForm({ ...form, quantidade: e.target.value })
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
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Equipamentos utilizados
            </label>
            <input
              value={form.equipamentos}
              onChange={(e) =>
                setForm({ ...form, equipamentos: e.target.value })
              }
              placeholder="Escavadeira QHB-2841, Motoniveladora MTR-0412..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
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
              disabled={
                !form.codigo || !form.descricao_servico || !form.localizacao
              }
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

import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type Aba = "estoque" | "requisicoes" | "pedidos";
type CentroCusto =
  | "Engenharia"
  | "Conserva DER"
  | "Terraplanagem"
  | "Manutenção"
  | "Produção"
  | "Geral";
type StatusReq = "pendente" | "aprovada" | "parcial" | "cancelada";
type StatusPedido =
  | "rascunho"
  | "enviado"
  | "aguardando_entrega"
  | "recebido_parcial"
  | "recebido"
  | "cancelado";
type TipoItem =
  "peca" | "oleo" | "filtro" | "material" | "combustivel" | "epi" | "outros";

interface ItemEstoque {
  id: number;
  codigo: string;
  nome: string;
  tipo: TipoItem;
  unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  valor_unitario: number;
  centro_custo: CentroCusto;
  fornecedor: string;
}

interface ItemReq {
  id: number;
  material: string;
  codigo_item: string;
  unidade: string;
  quantidade: number;
  quantidade_atendida: number;
}

interface Requisicao {
  id: number;
  codigo: string;
  titulo: string;
  solicitante: string;
  centro_custo: CentroCusto;
  data: string;
  prazo: string;
  status: StatusReq;
  itens: ItemReq[];
  justificativa: string;
}

interface ItemPedido {
  id: number;
  material: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
}

interface PedidoCompra {
  id: number;
  codigo: string;
  fornecedor: string;
  cnpj: string;
  centro_custo: CentroCusto;
  requisicao_origem: string;
  data: string;
  previsao_entrega: string;
  status: StatusPedido;
  itens: ItemPedido[];
  condicao_pagamento: string;
  observacoes: string;
}

/* ── Labels e cores ─────────────────────────────────────── */

const TIPO_LABEL: Record<TipoItem, string> = {
  peca: "Peça",
  oleo: "Óleo / Lubrificante",
  filtro: "Filtro",
  material: "Material de Construção",
  combustivel: "Combustível",
  epi: "EPI / Segurança",
  outros: "Outros",
};
const TIPO_ICONE: Record<TipoItem, string> = {
  peca: "🔩",
  oleo: "🛢️",
  filtro: "🔘",
  material: "🧱",
  combustivel: "⛽",
  epi: "🦺",
  outros: "📦",
};

const STATUS_REQ_LABEL: Record<StatusReq, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  parcial: "Atendida Parcialmente",
  cancelada: "Cancelada",
};
const STATUS_REQ_COR: Record<StatusReq, string> = {
  pendente: "#f97316",
  aprovada: "#10b981",
  parcial: "#8b5cf6",
  cancelada: "#64748b",
};

const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado ao Fornecedor",
  aguardando_entrega: "Aguardando Entrega",
  recebido_parcial: "Recebido Parcialmente",
  recebido: "Recebido",
  cancelado: "Cancelado",
};
const STATUS_PEDIDO_COR: Record<StatusPedido, string> = {
  rascunho: "#64748b",
  enviado: "#3b82f6",
  aguardando_entrega: "#f97316",
  recebido_parcial: "#8b5cf6",
  recebido: "#10b981",
  cancelado: "#ef4444",
};

const CENTROS: CentroCusto[] = [
  "Engenharia",
  "Conserva DER",
  "Terraplanagem",
  "Manutenção",
  "Produção",
  "Geral",
];

/* ── Dados fictícios ────────────────────────────────────── */

const estoqueInicial: ItemEstoque[] = [
  {
    id: 1,
    codigo: "MP-001",
    nome: "Filtro de ar — CAT 320",
    tipo: "filtro",
    unidade: "un",
    estoque_atual: 8,
    estoque_minimo: 5,
    valor_unitario: 187.5,
    centro_custo: "Manutenção",
    fornecedor: "AutoParts MT",
  },
  {
    id: 2,
    codigo: "MP-002",
    nome: "Óleo Hidráulico ISO-46 — 20L",
    tipo: "oleo",
    unidade: "L",
    estoque_atual: 340,
    estoque_minimo: 200,
    valor_unitario: 18.9,
    centro_custo: "Manutenção",
    fornecedor: "LubBrasil",
  },
  {
    id: 3,
    codigo: "MP-003",
    nome: "Correia dentada Randon 2018",
    tipo: "peca",
    unidade: "un",
    estoque_atual: 2,
    estoque_minimo: 4,
    valor_unitario: 420.0,
    centro_custo: "Manutenção",
    fornecedor: "AutoParts MT",
  },
  {
    id: 4,
    codigo: "MP-004",
    nome: "Diesel S-10 — abastecimento frota",
    tipo: "combustivel",
    unidade: "L",
    estoque_atual: 12400,
    estoque_minimo: 8000,
    valor_unitario: 6.45,
    centro_custo: "Produção",
    fornecedor: "Petrobras Dist.",
  },
  {
    id: 5,
    codigo: "MT-001",
    nome: 'Brita graduada 3/4" — m³',
    tipo: "material",
    unidade: "m³",
    estoque_atual: 380,
    estoque_minimo: 150,
    valor_unitario: 98.0,
    centro_custo: "Terraplanagem",
    fornecedor: "Pedreira Central",
  },
  {
    id: 6,
    codigo: "MT-002",
    nome: "Cimento CP-III — saco 50kg",
    tipo: "material",
    unidade: "sc",
    estoque_atual: 210,
    estoque_minimo: 100,
    valor_unitario: 38.0,
    centro_custo: "Engenharia",
    fornecedor: "InterCimento",
  },
  {
    id: 7,
    codigo: "MT-003",
    nome: "Areia média lavada — m³",
    tipo: "material",
    unidade: "m³",
    estoque_atual: 95,
    estoque_minimo: 80,
    valor_unitario: 72.0,
    centro_custo: "Engenharia",
    fornecedor: "Pedreira Central",
  },
  {
    id: 8,
    codigo: "EP-001",
    nome: "Capacete de segurança CA-31045",
    tipo: "epi",
    unidade: "un",
    estoque_atual: 45,
    estoque_minimo: 30,
    valor_unitario: 28.9,
    centro_custo: "Geral",
    fornecedor: "SegPro MT",
  },
  {
    id: 9,
    codigo: "EP-002",
    nome: "Bota de segurança bico de aço n°42",
    tipo: "epi",
    unidade: "par",
    estoque_atual: 12,
    estoque_minimo: 15,
    valor_unitario: 142.0,
    centro_custo: "Geral",
    fornecedor: "SegPro MT",
  },
  {
    id: 10,
    codigo: "MP-005",
    nome: "Filtro de combustível — Volvo FH460",
    tipo: "filtro",
    unidade: "un",
    estoque_atual: 14,
    estoque_minimo: 6,
    valor_unitario: 95.0,
    centro_custo: "Manutenção",
    fornecedor: "AutoParts MT",
  },
  {
    id: 11,
    codigo: "MT-004",
    nome: "CBUQ usinado — ton",
    tipo: "material",
    unidade: "t",
    estoque_atual: 0,
    estoque_minimo: 50,
    valor_unitario: 580.0,
    centro_custo: "Conserva DER",
    fornecedor: "Usina Mato Grosso",
  },
  {
    id: 12,
    codigo: "MP-006",
    nome: "Lona de freio dianteira — eje duplo",
    tipo: "peca",
    unidade: "jg",
    estoque_atual: 6,
    estoque_minimo: 4,
    valor_unitario: 310.0,
    centro_custo: "Manutenção",
    fornecedor: "AutoParts MT",
  },
];

const requisicoesIniciais: Requisicao[] = [
  {
    id: 1,
    codigo: "REQ-2024-042",
    titulo: "Peças para revisão da CAT 336 — Lote A",
    solicitante: "Carlos (Manutenção)",
    centro_custo: "Manutenção",
    data: "2024-06-15",
    prazo: "2024-06-20",
    status: "aprovada",
    justificativa:
      "Revisão de 2.000h programada. Parada preventiva planejada para 22/06.",
    itens: [
      {
        id: 1,
        material: "Filtro de ar CAT 336",
        codigo_item: "MP-001",
        unidade: "un",
        quantidade: 3,
        quantidade_atendida: 3,
      },
      {
        id: 2,
        material: "Filtro de óleo motor",
        codigo_item: "MP-005",
        unidade: "un",
        quantidade: 2,
        quantidade_atendida: 2,
      },
      {
        id: 3,
        material: "Óleo Hidráulico ISO-46",
        codigo_item: "MP-002",
        unidade: "L",
        quantidade: 80,
        quantidade_atendida: 80,
      },
    ],
  },
  {
    id: 2,
    codigo: "REQ-2024-043",
    titulo: "Material para execução de base de drenagem",
    solicitante: "Fernanda (PCP)",
    centro_custo: "Conserva DER",
    data: "2024-06-18",
    prazo: "2024-06-25",
    status: "parcial",
    justificativa: "Início do serviço COMP-006 no KM 147 da BR-163.",
    itens: [
      {
        id: 1,
        material: 'Brita 3/4"',
        codigo_item: "MT-001",
        unidade: "m³",
        quantidade: 120,
        quantidade_atendida: 80,
      },
      {
        id: 2,
        material: "CBUQ usinado",
        codigo_item: "MT-004",
        unidade: "t",
        quantidade: 60,
        quantidade_atendida: 0,
      },
    ],
  },
  {
    id: 3,
    codigo: "REQ-2024-044",
    titulo: "EPI — reposição trimestral equipe B",
    solicitante: "Ana (Liderança)",
    centro_custo: "Geral",
    data: "2024-06-20",
    prazo: "2024-06-28",
    status: "pendente",
    justificativa:
      "Reposição periódica conforme controle de EPI. 20 colaboradores.",
    itens: [
      {
        id: 1,
        material: "Capacete CA-31045",
        codigo_item: "EP-001",
        unidade: "un",
        quantidade: 20,
        quantidade_atendida: 0,
      },
      {
        id: 2,
        material: "Bota bico de aço n°42",
        codigo_item: "EP-002",
        unidade: "par",
        quantidade: 8,
        quantidade_atendida: 0,
      },
    ],
  },
  {
    id: 4,
    codigo: "REQ-2024-039",
    titulo: "Cimento e areia — Fundação de caixas coletoras",
    solicitante: "Ricardo (Produção)",
    centro_custo: "Engenharia",
    data: "2024-06-08",
    prazo: "2024-06-12",
    status: "aprovada",
    justificativa: "Execução de 12 caixas coletoras no acesso industrial.",
    itens: [
      {
        id: 1,
        material: "Cimento CP-III",
        codigo_item: "MT-002",
        unidade: "sc",
        quantidade: 80,
        quantidade_atendida: 80,
      },
      {
        id: 2,
        material: "Areia média lavada",
        codigo_item: "MT-003",
        unidade: "m³",
        quantidade: 24,
        quantidade_atendida: 24,
      },
    ],
  },
  {
    id: 5,
    codigo: "REQ-2024-045",
    titulo: "Diesel — abastecimento semanal Frota Terraplanagem",
    solicitante: "Fernanda (PCP)",
    centro_custo: "Terraplanagem",
    data: "2024-06-24",
    prazo: "2024-06-24",
    status: "pendente",
    justificativa:
      "Previsão de 85 horas máquina — motoniveladora, pá-carregadeira e compactador.",
    itens: [
      {
        id: 1,
        material: "Diesel S-10",
        codigo_item: "MP-004",
        unidade: "L",
        quantidade: 4500,
        quantidade_atendida: 0,
      },
    ],
  },
];

const pedidosIniciais: PedidoCompra[] = [
  {
    id: 1,
    codigo: "PC-2024-018",
    fornecedor: "AutoParts MT",
    cnpj: "12.345.678/0001-90",
    centro_custo: "Manutenção",
    requisicao_origem: "REQ-2024-042",
    data: "2024-06-16",
    previsao_entrega: "2024-06-21",
    status: "recebido",
    condicao_pagamento: "30 dias — boleto",
    observacoes: "Entregue em 20/06. Conferência OK.",
    itens: [
      {
        id: 1,
        material: "Filtro de ar CAT 336",
        unidade: "un",
        quantidade: 3,
        valor_unitario: 187.5,
      },
      {
        id: 2,
        material: "Filtro de óleo motor",
        unidade: "un",
        quantidade: 2,
        valor_unitario: 95.0,
      },
    ],
  },
  {
    id: 2,
    codigo: "PC-2024-019",
    fornecedor: "LubBrasil",
    cnpj: "98.765.432/0001-11",
    centro_custo: "Manutenção",
    requisicao_origem: "REQ-2024-042",
    data: "2024-06-16",
    previsao_entrega: "2024-06-22",
    status: "recebido",
    condicao_pagamento: "À vista — PIX",
    observacoes: "Óleo Hidráulico ISO-46 — 4 galões de 20L.",
    itens: [
      {
        id: 1,
        material: "Óleo Hidráulico ISO-46",
        unidade: "L",
        quantidade: 80,
        valor_unitario: 18.9,
      },
    ],
  },
  {
    id: 3,
    codigo: "PC-2024-020",
    fornecedor: "Usina Mato Grosso",
    cnpj: "45.678.901/0001-55",
    centro_custo: "Conserva DER",
    requisicao_origem: "REQ-2024-043",
    data: "2024-06-19",
    previsao_entrega: "2024-06-28",
    status: "aguardando_entrega",
    condicao_pagamento: "28 dias — boleto",
    observacoes:
      "Aguardando janela de entrega na obra. Confirmado com transportador.",
    itens: [
      {
        id: 1,
        material: "CBUQ usinado — ton",
        unidade: "t",
        quantidade: 60,
        valor_unitario: 580.0,
      },
    ],
  },
  {
    id: 4,
    codigo: "PC-2024-021",
    fornecedor: "SegPro MT",
    cnpj: "55.123.456/0001-77",
    centro_custo: "Geral",
    requisicao_origem: "REQ-2024-044",
    data: "2024-06-21",
    previsao_entrega: "2024-06-27",
    status: "enviado",
    condicao_pagamento: "15 dias — boleto",
    observacoes: "Aguarda confirmação de disponibilidade bota n°42.",
    itens: [
      {
        id: 1,
        material: "Capacete CA-31045",
        unidade: "un",
        quantidade: 20,
        valor_unitario: 28.9,
      },
      {
        id: 2,
        material: "Bota bico de aço n°42",
        unidade: "par",
        quantidade: 8,
        valor_unitario: 142.0,
      },
    ],
  },
];

/* ── Utilitários ─────────────────────────────────────────── */

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function totalPedido(p: PedidoCompra) {
  return p.itens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);
}

function totalEstoque(item: ItemEstoque) {
  return item.estoque_atual * item.valor_unitario;
}

function alertaEstoque(item: ItemEstoque) {
  return item.estoque_atual <= item.estoque_minimo;
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Suprimentos() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [aba, setAba] = useState<Aba>("estoque");
  const [listaEstoque, setListaEstoque] =
    useState<ItemEstoque[]>(estoqueInicial);
  const [listaReqs, setListaReqs] = useState<Requisicao[]>(requisicoesIniciais);
  const [listaPedidos, setListaPedidos] =
    useState<PedidoCompra[]>(pedidosIniciais);

  const [busca, setBusca] = useState("");
  const [filtroCentro, setFiltroCentro] = useState<CentroCusto | "">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoItem | "">("");
  const [filtroStatusReq, setFiltroStatusReq] = useState<StatusReq | "">("");
  const [filtroStatusPed, setFiltroStatusPed] = useState<StatusPedido | "">("");

  /* Modais */
  const [modalReq, setModalReq] = useState(false);
  const [detalheReq, setDetalheReq] = useState<Requisicao | null>(null);
  const [detalhePed, setDetalhePed] = useState<PedidoCompra | null>(null);
  const [editReq, setEditReq] = useState<Requisicao | null>(null);
  const [formReq, setFormReq] = useState({
    codigo: "",
    titulo: "",
    solicitante: "",
    centro_custo: "Manutenção" as CentroCusto,
    data: "",
    prazo: "",
    justificativa: "",
  });

  /* Filtros derivados */
  const estoqueFiltrado = listaEstoque.filter((i) => {
    const cc = !filtroCentro || i.centro_custo === filtroCentro;
    const tp = !filtroTipo || i.tipo === filtroTipo;
    const bk =
      !busca ||
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.codigo.toLowerCase().includes(busca.toLowerCase());
    return cc && tp && bk;
  });

  const reqsFiltradas = listaReqs.filter((r) => {
    const cc = !filtroCentro || r.centro_custo === filtroCentro;
    const st = !filtroStatusReq || r.status === filtroStatusReq;
    const bk =
      !busca ||
      r.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      r.codigo.toLowerCase().includes(busca.toLowerCase());
    return cc && st && bk;
  });

  const pedidosFiltrados = listaPedidos.filter((p) => {
    const cc = !filtroCentro || p.centro_custo === filtroCentro;
    const st = !filtroStatusPed || p.status === filtroStatusPed;
    const bk =
      !busca ||
      p.fornecedor.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase());
    return cc && st && bk;
  });

  /* KPIs */
  const emAlerta = listaEstoque.filter(alertaEstoque).length;
  const totalValorEstoque = listaEstoque.reduce(
    (s, i) => s + totalEstoque(i),
    0,
  );
  const reqsPendentes = listaReqs.filter((r) => r.status === "pendente").length;
  const pedidosAbertos = listaPedidos.filter(
    (p) => !["recebido", "cancelado"].includes(p.status),
  ).length;

  /* Salvar requisição */
  function salvarReq() {
    if (!formReq.codigo || !formReq.titulo) {
      toast.error("Preencha código e título.");
      return;
    }
    if (editReq) {
      setListaReqs((p) =>
        p.map((r) =>
          r.id === editReq.id
            ? { ...r, ...formReq, status: r.status, itens: r.itens }
            : r,
        ),
      );
      toast.success("Requisição atualizada.");
    } else {
      const nova: Requisicao = {
        id: Date.now(),
        ...formReq,
        status: "pendente",
        itens: [],
      };
      setListaReqs((p) => [nova, ...p]);
      toast.success("Requisição criada.");
    }
    setModalReq(false);
  }

  function abrirReq(r?: Requisicao) {
    setEditReq(r ?? null);
    setFormReq(
      r
        ? {
            codigo: r.codigo,
            titulo: r.titulo,
            solicitante: r.solicitante,
            centro_custo: r.centro_custo,
            data: r.data,
            prazo: r.prazo,
            justificativa: r.justificativa,
          }
        : {
            codigo: "",
            titulo: "",
            solicitante: user?.name ?? "",
            centro_custo: "Manutenção",
            data: "",
            prazo: "",
            justificativa: "",
          },
    );
    setModalReq(true);
  }

  function aprovarReq(id: number) {
    setListaReqs((p) =>
      p.map((r) => (r.id === id ? { ...r, status: "aprovada" } : r)),
    );
    toast.success("Requisição aprovada.");
  }
  function cancelarReq(id: number) {
    if (!confirm("Cancelar requisição?")) return;
    setListaReqs((p) =>
      p.map((r) => (r.id === id ? { ...r, status: "cancelada" } : r)),
    );
    toast.success("Requisição cancelada.");
  }
  function cancelarPedido(id: number) {
    if (!confirm("Cancelar pedido de compra?")) return;
    setListaPedidos((p) =>
      p.map((pc) => (pc.id === id ? { ...pc, status: "cancelado" } : pc)),
    );
    toast.success("Pedido cancelado.");
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Suprimentos</h1>
        {podeEditar && aba === "requisicoes" && (
          <button
            onClick={() => abrirReq()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nova Requisição
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Itens em Estoque</div>
          <div className="text-3xl font-bold text-white">
            {listaEstoque.length}
          </div>
          <div
            className={`text-xs mt-1 ${emAlerta > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {emAlerta > 0
              ? `⚠ ${emAlerta} abaixo do mínimo`
              : "Todos no nível OK"}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Valor em Estoque</div>
          <div className="text-xl font-bold text-[#f97316]">
            {moeda(totalValorEstoque)}
          </div>
          <div className="text-xs text-gray-400 mt-1">avaliação atual</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">
            Requisições Pendentes
          </div>
          <div
            className={`text-3xl font-bold ${reqsPendentes > 0 ? "text-yellow-400" : "text-green-400"}`}
          >
            {reqsPendentes}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {listaReqs.length} no total
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Pedidos em Aberto</div>
          <div className="text-3xl font-bold text-blue-400">
            {pedidosAbertos}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {listaPedidos.filter((p) => p.status === "recebido").length}{" "}
            recebidos
          </div>
        </GlassCard>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {(
          [
            ["estoque", "Estoque"],
            ["requisicoes", "Requisições"],
            ["pedidos", "Pedidos de Compra"],
          ] as [Aba, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => {
              setAba(v);
              setBusca("");
              setFiltroTipo("");
              setFiltroStatusReq("");
              setFiltroStatusPed("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === v ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-white"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Filtros globais */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <select
          value={filtroCentro}
          onChange={(e) => setFiltroCentro(e.target.value as CentroCusto | "")}
          className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-w-[160px]"
        >
          <option value="">Todos os Centros</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* ── ABA: ESTOQUE ── */}
      {aba === "estoque" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                "",
                "peca",
                "oleo",
                "filtro",
                "material",
                "combustivel",
                "epi",
                "outros",
              ] as (TipoItem | "")[]
            ).map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t as TipoItem | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroTipo === t ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {t ? TIPO_LABEL[t as TipoItem] : "Todos"}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {[
                    "Código",
                    "Item",
                    "Tipo",
                    "Und.",
                    "Estoque",
                    "Mín.",
                    "Valor Unit.",
                    "Total",
                    "CC",
                    "Fornecedor",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-xs text-gray-400 font-medium pb-2 pr-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estoqueFiltrado.map((i) => {
                  const alerta = alertaEstoque(i);
                  return (
                    <tr
                      key={i.id}
                      className={`border-b border-white/5 hover:bg-white/3 ${alerta ? "bg-red-500/5" : ""}`}
                    >
                      <td className="py-3 pr-3 text-xs font-mono text-gray-400">
                        {i.codigo}
                      </td>
                      <td className="py-3 pr-3 text-white">
                        <div className="flex items-center gap-2">
                          <span>{TIPO_ICONE[i.tipo]}</span>
                          <span>{i.nome}</span>
                          {alerta && (
                            <span className="text-xs text-red-400 font-medium">
                              ⚠ BAIXO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          {TIPO_LABEL[i.tipo]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-300 text-xs">
                        {i.unidade}
                      </td>
                      <td
                        className={`py-3 pr-3 font-semibold ${alerta ? "text-red-400" : "text-white"}`}
                      >
                        {i.estoque_atual.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">
                        {i.estoque_minimo}
                      </td>
                      <td className="py-3 pr-3 text-gray-300 text-xs">
                        {moeda(i.valor_unitario)}
                      </td>
                      <td className="py-3 pr-3 text-[#f97316] font-medium text-xs">
                        {moeda(totalEstoque(i))}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {i.centro_custo}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {i.fornecedor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20">
                  <td
                    colSpan={7}
                    className="pt-3 text-xs text-gray-400 text-right pr-3 font-medium"
                  >
                    Valor total em estoque
                  </td>
                  <td className="pt-3 text-[#f97316] font-bold text-sm">
                    {moeda(
                      estoqueFiltrado.reduce((s, i) => s + totalEstoque(i), 0),
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ── ABA: REQUISIÇÕES ── */}
      {aba === "requisicoes" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(
              ["", "pendente", "aprovada", "parcial", "cancelada"] as (
                StatusReq | ""
              )[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatusReq(s as StatusReq | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatusReq === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {s ? STATUS_REQ_LABEL[s as StatusReq] : "Todas"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {reqsFiltradas.map((r) => (
              <div
                key={r.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                style={{
                  borderLeftColor: STATUS_REQ_COR[r.status],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-400 text-xs font-mono">
                        {r.codigo}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: STATUS_REQ_COR[r.status],
                          backgroundColor: `${STATUS_REQ_COR[r.status]}20`,
                        }}
                      >
                        {STATUS_REQ_LABEL[r.status]}
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {r.centro_custo}
                      </span>
                    </div>
                    <div className="text-white font-semibold mt-1">
                      {r.titulo}
                    </div>
                    <div className="text-gray-400 text-sm mt-0.5">
                      {r.solicitante}
                    </div>
                    {r.justificativa && (
                      <div className="text-gray-500 text-xs mt-1 italic">
                        {r.justificativa}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white font-bold">
                      {r.itens.length} itens
                    </div>
                    <div className="text-gray-400 text-xs">
                      prazo: {r.prazo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-500">Emissão: {r.data}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetalheReq(r)}
                      className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                    >
                      Ver Itens
                    </button>
                    {podeEditar && r.status === "pendente" && (
                      <>
                        <button
                          onClick={() => aprovarReq(r.id)}
                          className="text-xs text-green-400 hover:text-green-300 px-3 py-1 border border-green-500/30 rounded-lg transition-colors"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => abrirReq(r)}
                          className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => cancelarReq(r.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-3 py-1"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {reqsFiltradas.length === 0 && (
              <GlassCard className="text-center py-10">
                <div className="text-gray-400">
                  Nenhuma requisição encontrada.
                </div>
              </GlassCard>
            )}
          </div>
        </>
      )}

      {/* ── ABA: PEDIDOS DE COMPRA ── */}
      {aba === "pedidos" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                "",
                "rascunho",
                "enviado",
                "aguardando_entrega",
                "recebido_parcial",
                "recebido",
                "cancelado",
              ] as (StatusPedido | "")[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatusPed(s as StatusPedido | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatusPed === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {s ? STATUS_PEDIDO_LABEL[s as StatusPedido] : "Todos"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {pedidosFiltrados.map((p) => {
              const total = totalPedido(p);
              return (
                <div
                  key={p.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                  style={{
                    borderLeftColor: STATUS_PEDIDO_COR[p.status],
                    borderLeftWidth: 3,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-gray-400 text-xs font-mono">
                          {p.codigo}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            color: STATUS_PEDIDO_COR[p.status],
                            backgroundColor: `${STATUS_PEDIDO_COR[p.status]}20`,
                          }}
                        >
                          {STATUS_PEDIDO_LABEL[p.status]}
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                          {p.centro_custo}
                        </span>
                      </div>
                      <div className="text-white font-semibold mt-1">
                        {p.fornecedor}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        CNPJ: {p.cnpj} · {p.condicao_pagamento}
                      </div>
                      {p.requisicao_origem && (
                        <div className="text-gray-500 text-xs mt-0.5">
                          Origem: {p.requisicao_origem}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-white font-bold text-lg">
                        {moeda(total)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {p.itens.length} itens · entrega: {p.previsao_entrega}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500">
                      Emissão: {p.data}
                      {p.observacoes ? ` · ${p.observacoes}` : ""}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetalhePed(p)}
                        className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                      >
                        Ver Itens
                      </button>
                      {podeEditar &&
                        !["recebido", "cancelado"].includes(p.status) && (
                          <button
                            onClick={() => cancelarPedido(p.id)}
                            className="text-xs text-red-400 hover:text-red-300 px-3 py-1"
                          >
                            Cancelar
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
            {pedidosFiltrados.length === 0 && (
              <GlassCard className="text-center py-10">
                <div className="text-gray-400">Nenhum pedido encontrado.</div>
              </GlassCard>
            )}
          </div>
        </>
      )}

      {/* ── Modal detalhe requisição ── */}
      <GlassModal
        open={!!detalheReq}
        onClose={() => setDetalheReq(null)}
        title={detalheReq ? `${detalheReq.codigo} — Itens` : ""}
      >
        {detalheReq && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Centro:</span>{" "}
                <span className="text-purple-400">
                  {detalheReq.centro_custo}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Prazo:</span>{" "}
                <span className="text-white">{detalheReq.prazo}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{" "}
                <span style={{ color: STATUS_REQ_COR[detalheReq.status] }}>
                  {STATUS_REQ_LABEL[detalheReq.status]}
                </span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="text-xs text-gray-400 pb-2 pr-3">Ref.</th>
                  <th className="text-xs text-gray-400 pb-2 pr-3">Material</th>
                  <th className="text-xs text-gray-400 pb-2 pr-3 text-right">
                    Solicitado
                  </th>
                  <th className="text-xs text-gray-400 pb-2 text-right">
                    Atendido
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalheReq.itens.map((i) => (
                  <tr key={i.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 text-xs font-mono text-gray-400">
                      {i.codigo_item}
                    </td>
                    <td className="py-2 pr-3 text-white">{i.material}</td>
                    <td className="py-2 pr-3 text-gray-300 text-right">
                      {i.quantidade} {i.unidade}
                    </td>
                    <td
                      className={`py-2 text-right font-medium ${i.quantidade_atendida === i.quantidade ? "text-green-400" : i.quantidade_atendida > 0 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {i.quantidade_atendida} {i.unidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {detalheReq.justificativa && (
              <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                {detalheReq.justificativa}
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* ── Modal detalhe pedido ── */}
      <GlassModal
        open={!!detalhePed}
        onClose={() => setDetalhePed(null)}
        title={detalhePed ? `${detalhePed.codigo} — Itens` : ""}
      >
        {detalhePed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Fornecedor:</span>{" "}
                <span className="text-white">{detalhePed.fornecedor}</span>
              </div>
              <div>
                <span className="text-gray-400">CNPJ:</span>{" "}
                <span className="text-gray-300">{detalhePed.cnpj}</span>
              </div>
              <div>
                <span className="text-gray-400">Pagamento:</span>{" "}
                <span className="text-white">
                  {detalhePed.condicao_pagamento}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Entrega:</span>{" "}
                <span className="text-white">
                  {detalhePed.previsao_entrega}
                </span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="text-xs text-gray-400 pb-2 pr-3">Material</th>
                  <th className="text-xs text-gray-400 pb-2 pr-3 text-right">
                    Qtd.
                  </th>
                  <th className="text-xs text-gray-400 pb-2 pr-3 text-right">
                    Unit.
                  </th>
                  <th className="text-xs text-gray-400 pb-2 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalhePed.itens.map((i) => (
                  <tr key={i.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 text-white">{i.material}</td>
                    <td className="py-2 pr-3 text-gray-300 text-right">
                      {i.quantidade} {i.unidade}
                    </td>
                    <td className="py-2 pr-3 text-gray-300 text-right">
                      {moeda(i.valor_unitario)}
                    </td>
                    <td className="py-2 text-[#f97316] font-medium text-right">
                      {moeda(i.quantidade * i.valor_unitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20">
                  <td
                    colSpan={3}
                    className="pt-3 text-sm font-semibold text-white text-right pr-3"
                  >
                    Total
                  </td>
                  <td className="pt-3 text-[#f97316] font-bold text-right">
                    {moeda(totalPedido(detalhePed))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </GlassModal>

      {/* ── Modal criar/editar requisição ── */}
      <GlassModal
        open={modalReq}
        onClose={() => setModalReq(false)}
        title={editReq ? "Editar Requisição" : "Nova Requisição de Material"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={formReq.codigo}
                onChange={(e) =>
                  setFormReq({ ...formReq, codigo: e.target.value })
                }
                disabled={!!editReq}
                placeholder="REQ-2024-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Centro de Custo
              </label>
              <select
                value={formReq.centro_custo}
                onChange={(e) =>
                  setFormReq({
                    ...formReq,
                    centro_custo: e.target.value as CentroCusto,
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {CENTROS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título *</label>
            <input
              value={formReq.titulo}
              onChange={(e) =>
                setFormReq({ ...formReq, titulo: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Solicitante
              </label>
              <input
                value={formReq.solicitante}
                onChange={(e) =>
                  setFormReq({ ...formReq, solicitante: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={formReq.data}
                onChange={(e) =>
                  setFormReq({ ...formReq, data: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Prazo necessário
              </label>
              <input
                type="date"
                value={formReq.prazo}
                onChange={(e) =>
                  setFormReq({ ...formReq, prazo: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Justificativa
            </label>
            <textarea
              value={formReq.justificativa}
              onChange={(e) =>
                setFormReq({ ...formReq, justificativa: e.target.value })
              }
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalReq(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarReq}
              disabled={!formReq.codigo || !formReq.titulo}
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

import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type Aba = "composicoes" | "documentos" | "normas" | "orcamentos";
type StatusOrcamento =
  "elaboracao" | "revisao" | "aprovado" | "reprovado" | "enviado";

interface Composicao {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string;
  custo: number;
  rendimento: string;
  equipe: string;
}

interface Documento {
  id: number;
  codigo: string;
  titulo: string;
  tipo: "it" | "procedimento" | "drawing" | "relatorio" | "norma";
  versao: string;
  revisao: string;
  responsavel: string;
  status: "vigente" | "revisao" | "obsoleto";
}

interface Norma {
  id: number;
  codigo: string;
  titulo: string;
  orgao: string;
  aplicacao: string;
  vigencia: string;
}

interface ItemOrcamento {
  id: number;
  composicao: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  custo_unitario: number;
}

interface Orcamento {
  id: number;
  codigo: string;
  titulo: string;
  cliente: string;
  responsavel: string;
  data: string;
  validade: string;
  status: StatusOrcamento;
  itens: ItemOrcamento[];
  observacoes: string;
}

/* ── Labels e cores ─────────────────────────────────────── */

const TIPO_DOC: Record<string, string> = {
  it: "Instrução de Trabalho",
  procedimento: "Procedimento",
  drawing: "Projeto / Desenho",
  relatorio: "Relatório",
  norma: "Norma Técnica",
};

const STATUS_ORC_LABEL: Record<StatusOrcamento, string> = {
  elaboracao: "Em Elaboração",
  revisao: "Em Revisão",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  enviado: "Enviado ao Cliente",
};

const STATUS_ORC_COR: Record<StatusOrcamento, string> = {
  elaboracao: "#8b5cf6",
  revisao: "#f97316",
  aprovado: "#10b981",
  reprovado: "#ef4444",
  enviado: "#3b82f6",
};

const STATUS_DOC_COR: Record<string, string> = {
  vigente: "#10b981",
  revisao: "#f97316",
  obsoleto: "#64748b",
};

/* ── Dados fictícios ────────────────────────────────────── */

const composicoes: Composicao[] = [
  {
    id: 1,
    codigo: "COMP-001",
    descricao: "Pavimentação em CBUQ — Camada de rolamento 4cm",
    categoria: "Pavimentação",
    unidade: "t",
    custo: 580.0,
    rendimento: "120 t/dia",
    equipe: "Equipe A",
  },
  {
    id: 2,
    codigo: "COMP-002",
    descricao: "Imprimação betuminosa com CM-30",
    categoria: "Pavimentação",
    unidade: "m²",
    custo: 4.8,
    rendimento: "3.000 m²/dia",
    equipe: "Equipe A",
  },
  {
    id: 3,
    codigo: "COMP-003",
    descricao: "Corte e aterro compactado — 1ª categoria",
    categoria: "Terraplanagem",
    unidade: "m³",
    custo: 18.5,
    rendimento: "800 m³/dia",
    equipe: "Equipe B",
  },
  {
    id: 4,
    codigo: "COMP-004",
    descricao: "Compactação de aterro — 95% Proctor normal",
    categoria: "Terraplanagem",
    unidade: "m²",
    custo: 3.2,
    rendimento: "4.000 m²/dia",
    equipe: "Equipe B",
  },
  {
    id: 5,
    codigo: "COMP-005",
    descricao: "Escavação de vala para galeria pluvial",
    categoria: "Drenagem",
    unidade: "m",
    custo: 42.0,
    rendimento: "80 m/dia",
    equipe: "Equipe C",
  },
  {
    id: 6,
    codigo: "COMP-006",
    descricao: "Assentamento de manilha de concreto D=600mm",
    categoria: "Drenagem",
    unidade: "m",
    custo: 135.0,
    rendimento: "30 m/dia",
    equipe: "Equipe C",
  },
  {
    id: 7,
    codigo: "COMP-007",
    descricao: "Sinalização horizontal — faixa simples",
    categoria: "Sinalização",
    unidade: "m",
    custo: 8.5,
    rendimento: "500 m/dia",
    equipe: "Equipe A",
  },
  {
    id: 8,
    codigo: "COMP-008",
    descricao: "Roçada mecanizada de faixa de domínio",
    categoria: "Conservação",
    unidade: "km",
    custo: 480.0,
    rendimento: "10 km/dia",
    equipe: "Equipe D",
  },
  {
    id: 9,
    codigo: "COMP-009",
    descricao: "Tapa-buracos com CBUQ usinado a quente",
    categoria: "Conservação",
    unidade: "m²",
    custo: 95.0,
    rendimento: "50 m²/dia",
    equipe: "Equipe D",
  },
  {
    id: 10,
    codigo: "COMP-010",
    descricao: "Boca de lobo simples em concreto armado",
    categoria: "Drenagem",
    unidade: "un",
    custo: 2400.0,
    rendimento: "3 un/dia",
    equipe: "Equipe C",
  },
];

const documentos: Documento[] = [
  {
    id: 1,
    codigo: "IT-001",
    titulo: "Lançamento de CBUQ — Camada de rolamento",
    tipo: "it",
    versao: "Rev.03",
    revisao: "2024-05-10",
    responsavel: "Ricardo",
    status: "vigente",
  },
  {
    id: 2,
    codigo: "IT-002",
    titulo: "Escavação e Escoramento de Valas",
    tipo: "it",
    versao: "Rev.02",
    revisao: "2024-03-22",
    responsavel: "Fernanda",
    status: "vigente",
  },
  {
    id: 3,
    codigo: "IT-003",
    titulo: "Operação de Motoniveladora em Terraplenagem",
    tipo: "it",
    versao: "Rev.04",
    revisao: "2024-07-01",
    responsavel: "Ana",
    status: "vigente",
  },
  {
    id: 4,
    codigo: "IT-004",
    titulo: "Compactação com Rolo Pé de Carneiro",
    tipo: "it",
    versao: "Rev.01",
    revisao: "2023-11-15",
    responsavel: "Ricardo",
    status: "revisao",
  },
  {
    id: 5,
    codigo: "PROC-001",
    titulo: "Controle Tecnológico de Compactação",
    tipo: "procedimento",
    versao: "Rev.02",
    revisao: "2024-04-08",
    responsavel: "Fernanda",
    status: "vigente",
  },
  {
    id: 6,
    codigo: "PROC-002",
    titulo: "Gestão de Resíduos Sólidos em Obra",
    tipo: "procedimento",
    versao: "Rev.01",
    revisao: "2024-01-20",
    responsavel: "Carlos",
    status: "vigente",
  },
  {
    id: 7,
    codigo: "DES-001",
    titulo: "Projeto Geométrico — BR-163 KM 45–67",
    tipo: "drawing",
    versao: "Rev.B",
    revisao: "2024-02-14",
    responsavel: "DNIT",
    status: "vigente",
  },
  {
    id: 8,
    codigo: "DES-002",
    titulo: "Seção Tipo Pavimentação — CON-2024-001",
    tipo: "drawing",
    versao: "Rev.A",
    revisao: "2024-03-01",
    responsavel: "Ricardo",
    status: "vigente",
  },
  {
    id: 9,
    codigo: "IT-005",
    titulo: "Pintura de Ligação com RR-1C",
    tipo: "it",
    versao: "Rev.01",
    revisao: "2023-08-10",
    responsavel: "Ricardo",
    status: "obsoleto",
  },
  {
    id: 10,
    codigo: "REL-001",
    titulo: "Relatório Mensal de Controle Ambiental",
    tipo: "relatorio",
    versao: "Rev.03",
    revisao: "2024-06-01",
    responsavel: "Fernanda",
    status: "vigente",
  },
];

const normas: Norma[] = [
  {
    id: 1,
    codigo: "DNIT 031/2006-ES",
    titulo: "Pavimentos Flexíveis — Capa Selante",
    orgao: "DNIT",
    aplicacao: "Pavimentação",
    vigencia: "Vigente",
  },
  {
    id: 2,
    codigo: "DNIT 032/2005-ES",
    titulo: "Pavimentos Flexíveis — Concreto Betuminoso",
    orgao: "DNIT",
    aplicacao: "Pavimentação",
    vigencia: "Vigente",
  },
  {
    id: 3,
    codigo: "ABNT NBR 7480",
    titulo: "Aço destinado a armaduras para concreto armado",
    orgao: "ABNT",
    aplicacao: "Estruturas",
    vigencia: "Vigente",
  },
  {
    id: 4,
    codigo: "ABNT NBR 6118",
    titulo: "Projeto de estruturas de concreto — Procedimento",
    orgao: "ABNT",
    aplicacao: "Estruturas / Pontes",
    vigencia: "Vigente",
  },
  {
    id: 5,
    codigo: "DNIT 137/2010-ES",
    titulo: "Pavimentação — Imprimação com Material Betuminoso",
    orgao: "DNIT",
    aplicacao: "Pavimentação",
    vigencia: "Vigente",
  },
  {
    id: 6,
    codigo: "ABNT NBR 5752",
    titulo: "Materiais Pozolânicos",
    orgao: "ABNT",
    aplicacao: "Materiais",
    vigencia: "Vigente",
  },
  {
    id: 7,
    codigo: "DNIT 170/2022-ES",
    titulo: "Sinalização Horizontal — Especificação de Serviço",
    orgao: "DNIT",
    aplicacao: "Sinalização",
    vigencia: "Vigente",
  },
  {
    id: 8,
    codigo: "NR-18",
    titulo: "Segurança e Saúde no Trabalho na Construção",
    orgao: "MTE",
    aplicacao: "Segurança",
    vigencia: "Vigente",
  },
];

const orcamentosIniciais: Orcamento[] = [
  {
    id: 1,
    codigo: "ORC-2024-001",
    titulo: "Pavimentação Acesso Industrial — Lote 1",
    cliente: "Prefeitura de Sinop",
    responsavel: "Ricardo",
    data: "2024-06-10",
    validade: "2024-09-10",
    status: "aprovado",
    observacoes:
      "Aprovado em reunião de 15/06/2024. Contrato gerado: CON-2024-002.",
    itens: [
      {
        id: 1,
        composicao: "COMP-001",
        descricao: "Pavimentação em CBUQ",
        unidade: "t",
        quantidade: 450,
        custo_unitario: 580.0,
      },
      {
        id: 2,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa",
        unidade: "m²",
        quantidade: 12000,
        custo_unitario: 4.8,
      },
      {
        id: 3,
        composicao: "COMP-003",
        descricao: "Corte e aterro compactado",
        unidade: "m³",
        quantidade: 8500,
        custo_unitario: 18.5,
      },
      {
        id: 4,
        composicao: "COMP-007",
        descricao: "Sinalização horizontal",
        unidade: "m",
        quantidade: 2400,
        custo_unitario: 8.5,
      },
    ],
  },
  {
    id: 2,
    codigo: "ORC-2024-002",
    titulo: "Drenagem Pluvial Zona Norte — Fase 2",
    cliente: "SINFRA-MT",
    responsavel: "Fernanda",
    data: "2024-07-20",
    validade: "2024-10-20",
    status: "enviado",
    observacoes:
      "Proposta enviada em 22/07. Aguardando retorno da contratante.",
    itens: [
      {
        id: 1,
        composicao: "COMP-005",
        descricao: "Escavação de vala",
        unidade: "m",
        quantidade: 3200,
        custo_unitario: 42.0,
      },
      {
        id: 2,
        composicao: "COMP-006",
        descricao: "Assentamento de galeria",
        unidade: "m",
        quantidade: 2800,
        custo_unitario: 135.0,
      },
      {
        id: 3,
        composicao: "COMP-010",
        descricao: "Boca de lobo em concreto",
        unidade: "un",
        quantidade: 48,
        custo_unitario: 2400.0,
      },
    ],
  },
  {
    id: 3,
    codigo: "ORC-2024-003",
    titulo: "Recapeamento Av. das Araras — 2,5 km",
    cliente: "SETOP / Cuiabá",
    responsavel: "Ricardo",
    data: "2024-08-05",
    validade: "2024-11-05",
    status: "elaboracao",
    observacoes: "Em revisão com a diretoria técnica.",
    itens: [
      {
        id: 1,
        composicao: "COMP-001",
        descricao: "Pavimentação em CBUQ",
        unidade: "t",
        quantidade: 820,
        custo_unitario: 580.0,
      },
      {
        id: 2,
        composicao: "COMP-002",
        descricao: "Imprimação betuminosa",
        unidade: "m²",
        quantidade: 20000,
        custo_unitario: 4.8,
      },
      {
        id: 3,
        composicao: "COMP-009",
        descricao: "Tapa-buracos preventivo",
        unidade: "m²",
        quantidade: 350,
        custo_unitario: 95.0,
      },
      {
        id: 4,
        composicao: "COMP-007",
        descricao: "Sinalização horizontal",
        unidade: "m",
        quantidade: 5000,
        custo_unitario: 8.5,
      },
    ],
  },
  {
    id: 4,
    codigo: "ORC-2024-004",
    titulo: "Manutenção de Estradas Vicinais — Lote 3",
    cliente: "SINFRA-MT",
    responsavel: "Ana",
    data: "2024-09-01",
    validade: "2024-12-01",
    status: "revisao",
    observacoes: "Aguarda ajuste de BDI conforme tabela SICRO 2024.",
    itens: [
      {
        id: 1,
        composicao: "COMP-008",
        descricao: "Roçada mecanizada",
        unidade: "km",
        quantidade: 180,
        custo_unitario: 480.0,
      },
      {
        id: 2,
        composicao: "COMP-009",
        descricao: "Tapa-buracos CBUQ",
        unidade: "m²",
        quantidade: 1200,
        custo_unitario: 95.0,
      },
      {
        id: 3,
        composicao: "COMP-003",
        descricao: "Reaterro de erosões",
        unidade: "m³",
        quantidade: 2100,
        custo_unitario: 18.5,
      },
    ],
  },
  {
    id: 5,
    codigo: "ORC-2023-005",
    titulo: "Implantação Rede de Drenagem — Vila Nova",
    cliente: "Prefeitura de Alta Floresta",
    responsavel: "Fernanda",
    data: "2023-11-10",
    validade: "2024-02-10",
    status: "reprovado",
    observacoes: "Proposta recusada por valor acima do orçamento municipal.",
    itens: [
      {
        id: 1,
        composicao: "COMP-005",
        descricao: "Escavação de vala",
        unidade: "m",
        quantidade: 1800,
        custo_unitario: 42.0,
      },
      {
        id: 2,
        composicao: "COMP-006",
        descricao: "Assentamento de galeria",
        unidade: "m",
        quantidade: 1600,
        custo_unitario: 135.0,
      },
      {
        id: 3,
        composicao: "COMP-010",
        descricao: "Boca de lobo em concreto",
        unidade: "un",
        quantidade: 24,
        custo_unitario: 2400.0,
      },
      {
        id: 4,
        composicao: "COMP-004",
        descricao: "Compactação de aterro",
        unidade: "m²",
        quantidade: 4500,
        custo_unitario: 3.2,
      },
    ],
  },
];

/* ── Utilitários ───────────────────────────────────────── */

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function totalOrc(orc: Orcamento) {
  return orc.itens.reduce((s, i) => s + i.quantidade * i.custo_unitario, 0);
}

/* ── Formulários vazios ─────────────────────────────────── */

const FORM_COMP_VAZIO = {
  codigo: "",
  descricao: "",
  categoria: "Pavimentação",
  unidade: "m²",
  custo: "",
  rendimento: "",
  equipe: "",
};
const FORM_DOC_VAZIO = {
  codigo: "",
  titulo: "",
  tipo: "it" as Documento["tipo"],
  versao: "Rev.01",
  revisao: "",
  responsavel: "",
  status: "vigente" as Documento["status"],
};
const FORM_ORC_VAZIO = {
  codigo: "",
  titulo: "",
  cliente: "",
  responsavel: "",
  data: "",
  validade: "",
  status: "elaboracao" as StatusOrcamento,
  observacoes: "",
};
const ITEM_ORC_VAZIO = {
  composicao: "",
  descricao: "",
  unidade: "m²",
  quantidade: "",
  custo_unitario: "",
};

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Engenharia() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [aba, setAba] = useState<Aba>("composicoes");
  const [listaComp, setListaComp] = useState<Composicao[]>(composicoes);
  const [listaDocs, setListaDocs] = useState<Documento[]>(documentos);
  const [listaOrc, setListaOrc] = useState<Orcamento[]>(orcamentosIniciais);

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatusOrc, setFiltroStatusOrc] = useState<StatusOrcamento | "">(
    "",
  );

  /* Modais composição */
  const [modalComp, setModalComp] = useState(false);
  const [editComp, setEditComp] = useState<Composicao | null>(null);
  const [formComp, setFormComp] = useState({ ...FORM_COMP_VAZIO });

  /* Modais documento */
  const [modalDoc, setModalDoc] = useState(false);
  const [editDoc, setEditDoc] = useState<Documento | null>(null);
  const [formDoc, setFormDoc] = useState({ ...FORM_DOC_VAZIO });

  /* Modais orçamento */
  const [modalOrc, setModalOrc] = useState(false);
  const [detalheOrc, setDetalheOrc] = useState<Orcamento | null>(null);
  const [editOrc, setEditOrc] = useState<Orcamento | null>(null);
  const [formOrc, setFormOrc] = useState({ ...FORM_ORC_VAZIO });
  const [itensOrc, setItensOrc] = useState<(typeof ITEM_ORC_VAZIO)[]>([]);

  const categorias = [...new Set(listaComp.map((c) => c.categoria))];

  const compFiltradas = listaComp.filter((c) => {
    const ok = !filtroCategoria || c.categoria === filtroCategoria;
    const match =
      !busca ||
      c.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busca.toLowerCase());
    return ok && match;
  });

  const docsFiltrados = listaDocs.filter(
    (d) =>
      !busca ||
      d.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      d.codigo.toLowerCase().includes(busca.toLowerCase()),
  );

  const orcFiltrados = listaOrc.filter((o) => {
    const ok = !filtroStatusOrc || o.status === filtroStatusOrc;
    const match =
      !busca ||
      o.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      o.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      o.cliente.toLowerCase().includes(busca.toLowerCase());
    return ok && match;
  });

  /* ── Composições CRUD ── */
  function abrirComp(c?: Composicao) {
    setEditComp(c ?? null);
    setFormComp(
      c
        ? {
            codigo: c.codigo,
            descricao: c.descricao,
            categoria: c.categoria,
            unidade: c.unidade,
            custo: String(c.custo),
            rendimento: c.rendimento,
            equipe: c.equipe,
          }
        : { ...FORM_COMP_VAZIO },
    );
    setModalComp(true);
  }
  function salvarComp() {
    if (!formComp.codigo || !formComp.descricao) {
      toast.error("Preencha código e descrição.");
      return;
    }
    if (editComp) {
      setListaComp((p) =>
        p.map((c) =>
          c.id === editComp.id
            ? { ...c, ...formComp, custo: Number(formComp.custo) || 0 }
            : c,
        ),
      );
      toast.success("Composição atualizada.");
    } else {
      setListaComp((p) => [
        ...p,
        { id: Date.now(), ...formComp, custo: Number(formComp.custo) || 0 },
      ]);
      toast.success("Composição cadastrada.");
    }
    setModalComp(false);
  }
  function excluirComp(id: number) {
    if (!confirm("Excluir composição?")) return;
    setListaComp((p) => p.filter((c) => c.id !== id));
    toast.success("Composição excluída.");
  }

  /* ── Documentos CRUD ── */
  function abrirDoc(d?: Documento) {
    setEditDoc(d ?? null);
    setFormDoc(
      d
        ? {
            codigo: d.codigo,
            titulo: d.titulo,
            tipo: d.tipo,
            versao: d.versao,
            revisao: d.revisao,
            responsavel: d.responsavel,
            status: d.status,
          }
        : { ...FORM_DOC_VAZIO },
    );
    setModalDoc(true);
  }
  function salvarDoc() {
    if (!formDoc.codigo || !formDoc.titulo) {
      toast.error("Preencha código e título.");
      return;
    }
    if (editDoc) {
      setListaDocs((p) =>
        p.map((d) => (d.id === editDoc.id ? { ...d, ...formDoc } : d)),
      );
      toast.success("Documento atualizado.");
    } else {
      setListaDocs((p) => [...p, { id: Date.now(), ...formDoc }]);
      toast.success("Documento cadastrado.");
    }
    setModalDoc(false);
  }
  function excluirDoc(id: number) {
    if (!confirm("Excluir documento?")) return;
    setListaDocs((p) => p.filter((d) => d.id !== id));
    toast.success("Documento excluído.");
  }

  /* ── Orçamentos CRUD ── */
  function abrirOrc(o?: Orcamento) {
    setEditOrc(o ?? null);
    setFormOrc(
      o
        ? {
            codigo: o.codigo,
            titulo: o.titulo,
            cliente: o.cliente,
            responsavel: o.responsavel,
            data: o.data,
            validade: o.validade,
            status: o.status,
            observacoes: o.observacoes,
          }
        : { ...FORM_ORC_VAZIO },
    );
    setItensOrc(
      o
        ? o.itens.map((i) => ({
            composicao: i.composicao,
            descricao: i.descricao,
            unidade: i.unidade,
            quantidade: String(i.quantidade),
            custo_unitario: String(i.custo_unitario),
          }))
        : [{ ...ITEM_ORC_VAZIO }],
    );
    setModalOrc(true);
  }
  function adicionarItemOrc() {
    setItensOrc((p) => [...p, { ...ITEM_ORC_VAZIO }]);
  }
  function removerItemOrc(idx: number) {
    setItensOrc((p) => p.filter((_, i) => i !== idx));
  }
  function atualizarItemOrc(idx: number, campo: string, valor: string) {
    setItensOrc((p) =>
      p.map((item, i) => (i === idx ? { ...item, [campo]: valor } : item)),
    );
  }
  function salvarOrc() {
    if (!formOrc.codigo || !formOrc.titulo || !formOrc.cliente) {
      toast.error("Preencha código, título e cliente.");
      return;
    }
    const itensConvertidos: ItemOrcamento[] = itensOrc.map((i, idx) => ({
      id: idx + 1,
      composicao: i.composicao,
      descricao: i.descricao,
      unidade: i.unidade,
      quantidade: Number(i.quantidade) || 0,
      custo_unitario: Number(i.custo_unitario) || 0,
    }));
    if (editOrc) {
      setListaOrc((p) =>
        p.map((o) =>
          o.id === editOrc.id
            ? { ...o, ...formOrc, itens: itensConvertidos }
            : o,
        ),
      );
      toast.success("Orçamento atualizado.");
    } else {
      setListaOrc((p) => [
        { id: Date.now(), ...formOrc, itens: itensConvertidos },
        ...p,
      ]);
      toast.success("Orçamento criado.");
    }
    setModalOrc(false);
  }
  function excluirOrc(id: number) {
    if (!confirm("Excluir orçamento?")) return;
    setListaOrc((p) => p.filter((o) => o.id !== id));
    toast.success("Orçamento excluído.");
  }

  const totalAprovado = listaOrc
    .filter((o) => o.status === "aprovado")
    .reduce((s, o) => s + totalOrc(o), 0);

  /* ── Render ── */
  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Engenharia</h1>
        {podeEditar && aba !== "normas" && (
          <button
            onClick={() => {
              if (aba === "composicoes") abrirComp();
              else if (aba === "documentos") abrirDoc();
              else if (aba === "orcamentos") abrirOrc();
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            +{" "}
            {aba === "composicoes"
              ? "Nova Composição"
              : aba === "documentos"
                ? "Novo Documento"
                : "Novo Orçamento"}
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Composições</div>
          <div className="text-3xl font-bold text-white">
            {listaComp.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {categorias.length} categorias
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Documentos</div>
          <div className="text-3xl font-bold text-blue-400">
            {listaDocs.length}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {listaDocs.filter((d) => d.status === "vigente").length} vigentes
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Orçamentos</div>
          <div className="text-3xl font-bold text-purple-400">
            {listaOrc.length}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {listaOrc.filter((o) => o.status === "aprovado").length} aprovados
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Volume Aprovado</div>
          <div className="text-xl font-bold text-[#f97316]">
            {moeda(totalAprovado)}
          </div>
          <div className="text-xs text-gray-400 mt-1">orçamentos aprovados</div>
        </GlassCard>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {(
          [
            ["composicoes", "Composições"],
            ["documentos", "Documentos"],
            ["normas", "Normas"],
            ["orcamentos", "Orçamentos"],
          ] as [Aba, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => {
              setAba(v);
              setBusca("");
              setFiltroCategoria("");
              setFiltroStatusOrc("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === v ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-white"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Busca */}
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
      />

      {/* ── ABA: COMPOSIÇÕES ── */}
      {aba === "composicoes" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {["", ...categorias].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroCategoria === cat ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {cat || "Todas"}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {[
                    "Código",
                    "Descrição",
                    "Categoria",
                    "Unid.",
                    "Custo Unit.",
                    "Rendimento",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-xs text-gray-400 font-medium pb-2 pr-4"
                    >
                      {h}
                    </th>
                  ))}
                  {podeEditar && <th />}
                </tr>
              </thead>
              <tbody>
                {compFiltradas.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3 pr-4 text-xs font-mono text-gray-400">
                      {c.codigo}
                    </td>
                    <td className="py-3 pr-4 text-sm text-white">
                      {c.descricao}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-300">
                      {c.unidade}
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#f97316] font-medium">
                      {moeda(c.custo)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {c.rendimento}
                    </td>
                    {podeEditar && (
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirComp(c)}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluirComp(c.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ABA: DOCUMENTOS ── */}
      {aba === "documentos" && (
        <div className="space-y-2">
          {docsFiltrados.map((d) => (
            <div
              key={d.id}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4"
              style={{
                borderLeftColor: STATUS_DOC_COR[d.status],
                borderLeftWidth: 2,
              }}
            >
              <div className="shrink-0 text-xs font-mono text-gray-400 w-12">
                {d.versao}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{d.titulo}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {d.codigo} · {TIPO_DOC[d.tipo]} · Resp.: {d.responsavel}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: STATUS_DOC_COR[d.status],
                    backgroundColor: `${STATUS_DOC_COR[d.status]}20`,
                  }}
                >
                  {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                </span>
                <div className="text-gray-500 text-xs mt-1">{d.revisao}</div>
              </div>
              {podeEditar && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => abrirDoc(d)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirDoc(d.id)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ABA: NORMAS ── */}
      {aba === "normas" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {["Norma", "Título", "Órgão", "Aplicação", "Situação"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs text-gray-400 font-medium pb-2 pr-4"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {normas
                .filter(
                  (n) =>
                    !busca ||
                    n.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                    n.codigo.toLowerCase().includes(busca.toLowerCase()),
                )
                .map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-white/5 hover:bg-white/3"
                  >
                    <td className="py-3 pr-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                      {n.codigo}
                    </td>
                    <td className="py-3 pr-4 text-sm text-white">{n.titulo}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {n.orgao}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {n.aplicacao}
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        {n.vigencia}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ABA: ORÇAMENTOS ── */}
      {aba === "orcamentos" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                "",
                "elaboracao",
                "revisao",
                "enviado",
                "aprovado",
                "reprovado",
              ] as (StatusOrcamento | "")[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatusOrc(s as StatusOrcamento | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatusOrc === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {s ? STATUS_ORC_LABEL[s as StatusOrcamento] : "Todos"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {orcFiltrados.length === 0 ? (
              <GlassCard className="text-center py-10">
                <div className="text-gray-400">
                  Nenhum orçamento encontrado.
                </div>
              </GlassCard>
            ) : (
              orcFiltrados.map((o) => {
                const total = totalOrc(o);
                return (
                  <div
                    key={o.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                    style={{
                      borderLeftColor: STATUS_ORC_COR[o.status],
                      borderLeftWidth: 3,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-gray-400 text-xs font-mono">
                            {o.codigo}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              color: STATUS_ORC_COR[o.status],
                              backgroundColor: `${STATUS_ORC_COR[o.status]}20`,
                            }}
                          >
                            {STATUS_ORC_LABEL[o.status]}
                          </span>
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {o.titulo}
                        </div>
                        <div className="text-gray-400 text-sm mt-0.5">
                          {o.cliente}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-white font-bold text-lg">
                          {moeda(total)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {o.itens.length} itens · validade: {o.validade}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-500">
                        Resp.: {o.responsavel} · Emissão: {o.data}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetalheOrc(o)}
                          className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                        >
                          Ver Itens
                        </button>
                        {podeEditar && (
                          <>
                            <button
                              onClick={() => abrirOrc(o)}
                              className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => excluirOrc(o.id)}
                              className="text-xs text-red-400 hover:text-red-300 px-3 py-1"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── Modal detalhe orçamento ── */}
      <GlassModal
        open={!!detalheOrc}
        onClose={() => setDetalheOrc(null)}
        title={detalheOrc ? `${detalheOrc.codigo} — Itens` : ""}
      >
        {detalheOrc && (
          <div className="space-y-4">
            <div>
              <div className="text-white font-semibold">
                {detalheOrc.titulo}
              </div>
              <div className="text-gray-400 text-sm">{detalheOrc.cliente}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="text-xs text-gray-400 pb-2 pr-3">Ref.</th>
                    <th className="text-xs text-gray-400 pb-2 pr-3">
                      Descrição
                    </th>
                    <th className="text-xs text-gray-400 pb-2 pr-3">Und.</th>
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
                  {detalheOrc.itens.map((i) => (
                    <tr key={i.id} className="border-b border-white/5">
                      <td className="py-2 pr-3 text-xs font-mono text-gray-400">
                        {i.composicao}
                      </td>
                      <td className="py-2 pr-3 text-white">{i.descricao}</td>
                      <td className="py-2 pr-3 text-gray-400 text-xs">
                        {i.unidade}
                      </td>
                      <td className="py-2 pr-3 text-gray-300 text-right">
                        {i.quantidade.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 pr-3 text-gray-300 text-right">
                        {moeda(i.custo_unitario)}
                      </td>
                      <td className="py-2 text-[#f97316] font-medium text-right">
                        {moeda(i.quantidade * i.custo_unitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/20">
                    <td
                      colSpan={5}
                      className="pt-3 text-sm font-semibold text-white text-right pr-3"
                    >
                      Total Geral
                    </td>
                    <td className="pt-3 text-[#f97316] font-bold text-right">
                      {moeda(totalOrc(detalheOrc))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {detalheOrc.observacoes && (
              <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300">
                {detalheOrc.observacoes}
              </div>
            )}
          </div>
        )}
      </GlassModal>

      {/* ── Modal criar/editar orçamento ── */}
      <GlassModal
        open={modalOrc}
        onClose={() => setModalOrc(false)}
        title={editOrc ? "Editar Orçamento" : "Novo Orçamento"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={formOrc.codigo}
                onChange={(e) =>
                  setFormOrc({ ...formOrc, codigo: e.target.value })
                }
                disabled={!!editOrc}
                placeholder="ORC-2024-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={formOrc.status}
                onChange={(e) =>
                  setFormOrc({
                    ...formOrc,
                    status: e.target.value as StatusOrcamento,
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {Object.entries(STATUS_ORC_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título *</label>
            <input
              value={formOrc.titulo}
              onChange={(e) =>
                setFormOrc({ ...formOrc, titulo: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Cliente *
              </label>
              <input
                value={formOrc.cliente}
                onChange={(e) =>
                  setFormOrc({ ...formOrc, cliente: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Responsável
              </label>
              <input
                value={formOrc.responsavel}
                onChange={(e) =>
                  setFormOrc({ ...formOrc, responsavel: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={formOrc.data}
                onChange={(e) =>
                  setFormOrc({ ...formOrc, data: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Validade
              </label>
              <input
                type="date"
                value={formOrc.validade}
                onChange={(e) =>
                  setFormOrc({ ...formOrc, validade: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          {/* Itens do orçamento */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-medium">
                Itens do Orçamento
              </label>
              <button
                onClick={adicionarItemOrc}
                className="text-xs text-[#f97316] hover:text-orange-400 transition-colors"
              >
                + Adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {itensOrc.map((item, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={item.composicao}
                      onChange={(e) =>
                        atualizarItemOrc(idx, "composicao", e.target.value)
                      }
                      placeholder="COMP-001"
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                    <input
                      value={item.descricao}
                      onChange={(e) =>
                        atualizarItemOrc(idx, "descricao", e.target.value)
                      }
                      placeholder="Descrição do serviço"
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={item.unidade}
                      onChange={(e) =>
                        atualizarItemOrc(idx, "unidade", e.target.value)
                      }
                      placeholder="m²"
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItemOrc(idx, "quantidade", e.target.value)
                      }
                      placeholder="Quantidade"
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                    />
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={item.custo_unitario}
                        onChange={(e) =>
                          atualizarItemOrc(
                            idx,
                            "custo_unitario",
                            e.target.value,
                          )
                        }
                        placeholder="Custo unit."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
                      />
                      <button
                        onClick={() => removerItemOrc(idx)}
                        className="text-red-400 hover:text-red-300 px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {item.quantidade && item.custo_unitario && (
                    <div className="text-right text-xs text-[#f97316]">
                      Subtotal:{" "}
                      {moeda(
                        Number(item.quantidade) * Number(item.custo_unitario),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {itensOrc.length > 0 &&
              itensOrc.some((i) => i.quantidade && i.custo_unitario) && (
                <div className="text-right text-sm font-bold text-white mt-2 border-t border-white/10 pt-2">
                  Total:{" "}
                  {moeda(
                    itensOrc.reduce(
                      (s, i) =>
                        s +
                        (Number(i.quantidade) || 0) *
                          (Number(i.custo_unitario) || 0),
                      0,
                    ),
                  )}
                </div>
              )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Observações
            </label>
            <textarea
              value={formOrc.observacoes}
              onChange={(e) =>
                setFormOrc({ ...formOrc, observacoes: e.target.value })
              }
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setModalOrc(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarOrc}
              disabled={!formOrc.codigo || !formOrc.titulo || !formOrc.cliente}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>

      {/* ── Modal composição ── */}
      <GlassModal
        open={modalComp}
        onClose={() => setModalComp(false)}
        title={editComp ? "Editar Composição" : "Nova Composição"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={formComp.codigo}
                onChange={(e) =>
                  setFormComp({ ...formComp, codigo: e.target.value })
                }
                disabled={!!editComp}
                placeholder="COMP-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Categoria
              </label>
              <input
                value={formComp.categoria}
                onChange={(e) =>
                  setFormComp({ ...formComp, categoria: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Descrição *
            </label>
            <input
              value={formComp.descricao}
              onChange={(e) =>
                setFormComp({ ...formComp, descricao: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Unidade
              </label>
              <input
                value={formComp.unidade}
                onChange={(e) =>
                  setFormComp({ ...formComp, unidade: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Custo Unit. (R$)
              </label>
              <input
                type="number"
                value={formComp.custo}
                onChange={(e) =>
                  setFormComp({ ...formComp, custo: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Rendimento
              </label>
              <input
                value={formComp.rendimento}
                onChange={(e) =>
                  setFormComp({ ...formComp, rendimento: e.target.value })
                }
                placeholder="100 m²/dia"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Equipe</label>
            <input
              value={formComp.equipe}
              onChange={(e) =>
                setFormComp({ ...formComp, equipe: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalComp(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarComp}
              disabled={!formComp.codigo || !formComp.descricao}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>

      {/* ── Modal documento ── */}
      <GlassModal
        open={modalDoc}
        onClose={() => setModalDoc(false)}
        title={editDoc ? "Editar Documento" : "Novo Documento"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={formDoc.codigo}
                onChange={(e) =>
                  setFormDoc({ ...formDoc, codigo: e.target.value })
                }
                disabled={!!editDoc}
                placeholder="IT-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo</label>
              <select
                value={formDoc.tipo}
                onChange={(e) =>
                  setFormDoc({
                    ...formDoc,
                    tipo: e.target.value as Documento["tipo"],
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {Object.entries(TIPO_DOC).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Título *</label>
            <input
              value={formDoc.titulo}
              onChange={(e) =>
                setFormDoc({ ...formDoc, titulo: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Versão</label>
              <input
                value={formDoc.versao}
                onChange={(e) =>
                  setFormDoc({ ...formDoc, versao: e.target.value })
                }
                placeholder="Rev.01"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Data Revisão
              </label>
              <input
                type="date"
                value={formDoc.revisao}
                onChange={(e) =>
                  setFormDoc({ ...formDoc, revisao: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={formDoc.status}
                onChange={(e) =>
                  setFormDoc({
                    ...formDoc,
                    status: e.target.value as Documento["status"],
                  })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="vigente">Vigente</option>
                <option value="revisao">Em Revisão</option>
                <option value="obsoleto">Obsoleto</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Responsável
            </label>
            <input
              value={formDoc.responsavel}
              onChange={(e) =>
                setFormDoc({ ...formDoc, responsavel: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalDoc(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarDoc}
              disabled={!formDoc.codigo || !formDoc.titulo}
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

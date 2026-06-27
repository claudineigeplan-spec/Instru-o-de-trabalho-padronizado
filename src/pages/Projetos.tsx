import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type Status = "ativo" | "encerrado" | "suspenso" | "licitacao";

interface Contrato {
  id: number;
  codigo: string;
  nome: string;
  cliente: string;
  objeto: string;
  status: Status;
  valor: number;
  saldo: number;
  inicio: string;
  fim: string;
  responsavel: string;
  medicoes: number;
}

const STATUS_LABEL: Record<Status, string> = {
  ativo: "Ativo",
  encerrado: "Encerrado",
  suspenso: "Suspenso",
  licitacao: "Em Licitação",
};

const STATUS_COR: Record<Status, string> = {
  ativo: "#10b981",
  encerrado: "#64748b",
  suspenso: "#f97316",
  licitacao: "#8b5cf6",
};

const DADOS_INICIAIS: Contrato[] = [
  {
    id: 1,
    codigo: "CON-2024-001",
    nome: "Pavimentação Trecho KM 45–67",
    cliente: "DNIT / MT",
    objeto:
      "Pavimentação asfáltica em CBUQ, drenagem e sinalização horizontal no trecho KM 45 ao KM 67 da BR-163.",
    status: "ativo",
    valor: 4850000,
    saldo: 2190000,
    inicio: "2024-03-01",
    fim: "2025-02-28",
    responsavel: "Ricardo Gestor de Produção",
    medicoes: 7,
  },
  {
    id: 2,
    codigo: "CON-2024-002",
    nome: "Terraplenagem Acesso Industrial",
    cliente: "Prefeitura de Sinop",
    objeto:
      "Terraplenagem, compactação e drenagem no acesso ao Distrito Industrial Norte — 4,2 km.",
    status: "ativo",
    valor: 1200000,
    saldo: 480000,
    inicio: "2024-06-01",
    fim: "2024-12-31",
    responsavel: "Ricardo Gestor de Produção",
    medicoes: 4,
  },
  {
    id: 3,
    codigo: "CON-2024-003",
    nome: "Drenagem Pluvial Urbana — Zona Norte",
    cliente: "SINFRA-MT",
    objeto:
      "Implantação de sistema de microdrenagem pluvial, galerias e bocas de lobo em 12 ruas da Zona Norte.",
    status: "encerrado",
    valor: 890000,
    saldo: 0,
    inicio: "2023-09-01",
    fim: "2024-04-30",
    responsavel: "Ana Líder de Campo",
    medicoes: 6,
  },
  {
    id: 4,
    codigo: "CON-2024-004",
    nome: "Recapeamento Avenida Tancredo Neves",
    cliente: "SETOP / Cuiabá",
    objeto:
      "Fresagem e recapeamento asfáltico em 3,8 km da Av. Tancredo Neves, incluindo meio-fio e calçadas.",
    status: "ativo",
    valor: 2100000,
    saldo: 1540000,
    inicio: "2024-08-15",
    fim: "2025-03-15",
    responsavel: "Fernanda PCP",
    medicoes: 2,
  },
  {
    id: 5,
    codigo: "CON-2023-005",
    nome: "Construção de Pontes — Lote 3",
    cliente: "DNIT / PA",
    objeto:
      "Construção de 3 pontes em concreto armado sobre os Rios Cristalino, Preto e Verde no trecho PA-150.",
    status: "suspenso",
    valor: 7200000,
    saldo: 4800000,
    inicio: "2023-11-01",
    fim: "2025-10-31",
    responsavel: "Ricardo Gestor de Produção",
    medicoes: 3,
  },
  {
    id: 6,
    codigo: "CON-2024-006",
    nome: "Manutenção Rodovias Estaduais — Lote 8",
    cliente: "SINFRA-MT",
    objeto:
      "Conservação rotineira e corretiva de 280 km de rodovias estaduais no Lote 8 — região norte do estado.",
    status: "ativo",
    valor: 3400000,
    saldo: 2890000,
    inicio: "2024-01-01",
    fim: "2024-12-31",
    responsavel: "Ana Líder de Campo",
    medicoes: 9,
  },
  {
    id: 7,
    codigo: "CON-2024-007",
    nome: "Implantação de Rede de Fibra Óptica",
    cliente: "MT Conectado",
    objeto:
      "Lançamento de 120 km de duto e cabo de fibra óptica ao longo da MT-208.",
    status: "licitacao",
    valor: 5600000,
    saldo: 5600000,
    inicio: "2025-01-15",
    fim: "2025-12-15",
    responsavel: "—",
    medicoes: 0,
  },
];

const FORM_VAZIO = {
  codigo: "",
  nome: "",
  cliente: "",
  objeto: "",
  status: "ativo" as Status,
  valor: "",
  saldo: "",
  inicio: "",
  fim: "",
  responsavel: "",
};

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function progresso(contrato: Contrato) {
  if (contrato.valor === 0) return 0;
  return Math.round(((contrato.valor - contrato.saldo) / contrato.valor) * 100);
}

export default function Projetos() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor";

  const [contratos, setContratos] = useState<Contrato[]>(DADOS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<Status | "">("");
  const [modal, setModal] = useState(false);
  const [detalhe, setDetalhe] = useState<Contrato | null>(null);
  const [editando, setEditando] = useState<Contrato | null>(null);
  const [form, setForm] = useState({ ...FORM_VAZIO });

  const filtrados = contratos.filter((c) => {
    const ok = !filtroStatus || c.status === filtroStatus;
    const texto = busca.toLowerCase();
    const match =
      !busca ||
      c.nome.toLowerCase().includes(texto) ||
      c.cliente.toLowerCase().includes(texto) ||
      c.codigo.toLowerCase().includes(texto);
    return ok && match;
  });

  const totalAtivos = contratos.filter((c) => c.status === "ativo").length;
  const valorTotal = contratos
    .filter((c) => c.status === "ativo")
    .reduce((s, c) => s + c.valor, 0);
  const saldoTotal = contratos
    .filter((c) => c.status === "ativo")
    .reduce((s, c) => s + c.saldo, 0);

  function abrirNovo() {
    setEditando(null);
    setForm({ ...FORM_VAZIO });
    setModal(true);
  }

  function abrirEditar(c: Contrato) {
    setEditando(c);
    setForm({
      codigo: c.codigo,
      nome: c.nome,
      cliente: c.cliente,
      objeto: c.objeto,
      status: c.status,
      valor: String(c.valor),
      saldo: String(c.saldo),
      inicio: c.inicio,
      fim: c.fim,
      responsavel: c.responsavel,
    });
    setModal(true);
  }

  function salvar() {
    if (!form.codigo || !form.nome || !form.cliente) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (editando) {
      setContratos((prev) =>
        prev.map((c) =>
          c.id === editando.id
            ? {
                ...c,
                ...form,
                valor: Number(form.valor) || 0,
                saldo: Number(form.saldo) || 0,
              }
            : c,
        ),
      );
      toast.success("Contrato atualizado.");
    } else {
      const novo: Contrato = {
        id: Date.now(),
        ...form,
        valor: Number(form.valor) || 0,
        saldo: Number(form.saldo) || 0,
        medicoes: 0,
      };
      setContratos((prev) => [novo, ...prev]);
      toast.success("Contrato cadastrado.");
    }
    setModal(false);
  }

  function excluir(id: number) {
    if (!confirm("Excluir este contrato?")) return;
    setContratos((prev) => prev.filter((c) => c.id !== id));
    toast.success("Contrato excluído.");
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projetos e Contratos</h1>
        {podeEditar && (
          <button
            onClick={abrirNovo}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Contrato
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Total de Contratos</div>
          <div className="text-3xl font-bold text-white">
            {contratos.length}
          </div>
          <div className="text-xs text-green-400 mt-1">
            {totalAtivos} ativos
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Valor Contratado</div>
          <div className="text-2xl font-bold text-[#f97316]">
            {moeda(valorTotal)}
          </div>
          <div className="text-xs text-gray-400 mt-1">contratos ativos</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Saldo a Executar</div>
          <div className="text-2xl font-bold text-blue-400">
            {moeda(saldoTotal)}
          </div>
          <div className="text-xs text-gray-400 mt-1">valores em aberto</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Medições Realizadas</div>
          <div className="text-3xl font-bold text-purple-400">
            {contratos.reduce((s, c) => s + c.medicoes, 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">total geral</div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, cliente ou código..."
          className="flex-1 min-w-56 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <div className="flex gap-1 flex-wrap">
          {(["", "ativo", "suspenso", "encerrado", "licitacao"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  filtroStatus === s
                    ? "bg-[#f97316] text-white font-medium"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {s ? STATUS_LABEL[s] : "Todos"}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <GlassCard className="text-center py-10">
          <div className="text-gray-400">Nenhum contrato encontrado.</div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtrados.map((c) => {
            const pct = progresso(c);
            return (
              <div
                key={c.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-[#f97316]/20 transition-all"
                style={{
                  borderLeftColor: STATUS_COR[c.status],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-400 text-xs font-mono">
                        {c.codigo}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          color: STATUS_COR[c.status],
                          backgroundColor: `${STATUS_COR[c.status]}20`,
                        }}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                    <div className="text-white font-semibold mt-1">
                      {c.nome}
                    </div>
                    <div className="text-gray-400 text-sm mt-0.5">
                      {c.cliente}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white font-bold text-lg">
                      {moeda(c.valor)}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Saldo: {moeda(c.saldo)}
                    </div>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Execução: {pct}%</span>
                    <span>
                      {c.inicio} → {c.fim}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COR[c.status],
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-gray-500">
                    Resp.: {c.responsavel} · {c.medicoes} medição
                    {c.medicoes !== 1 ? "ões" : ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetalhe(c)}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 border border-white/10 rounded-lg"
                    >
                      Detalhes
                    </button>
                    {podeEditar && (
                      <>
                        <button
                          onClick={() => abrirEditar(c)}
                          className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 border border-white/10 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluir(c.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detalhes */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe?.codigo ?? ""}
      >
        {detalhe && (
          <div className="space-y-4">
            <div>
              <div className="text-white font-semibold text-lg">
                {detalhe.nome}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {detalhe.cliente}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-sm text-gray-300 leading-relaxed">
              {detalhe.objeto}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">
                  Valor Contratado
                </div>
                <div className="text-white font-semibold">
                  {moeda(detalhe.valor)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Saldo</div>
                <div className="text-blue-400 font-semibold">
                  {moeda(detalhe.saldo)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Início</div>
                <div className="text-white">{detalhe.inicio}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Prazo Final</div>
                <div className="text-white">{detalhe.fim}</div>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="flex-1 bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Responsável</div>
                <div className="text-white">{detalhe.responsavel}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Medições</div>
                <div className="text-purple-400 font-bold text-xl">
                  {detalhe.medicoes}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Modal criar/editar */}
      <GlassModal
        open={modal}
        onClose={() => setModal(false)}
        title={editando ? "Editar Contrato" : "Novo Contrato"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Código *
              </label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                disabled={!!editando}
                placeholder="CON-2024-001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="licitacao">Em Licitação</option>
                <option value="suspenso">Suspenso</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Nome do Contrato *
            </label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Cliente *
            </label>
            <input
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Objeto</label>
            <textarea
              value={form.objeto}
              onChange={(e) => setForm({ ...form, objeto: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Saldo (R$)
              </label>
              <input
                type="number"
                value={form.saldo}
                onChange={(e) => setForm({ ...form, saldo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Data de Término
              </label>
              <input
                type="date"
                value={form.fim}
                onChange={(e) => setForm({ ...form, fim: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
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
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModal(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={!form.codigo || !form.nome || !form.cliente}
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

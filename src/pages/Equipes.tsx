import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type StatusEquipe = "ativa" | "inativa" | "ferias";

interface Membro {
  nome: string;
  cargo: string;
  matricula: string;
  turno: string;
}

interface Equipe {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  cor: string;
  lider: string;
  contrato_atual: string;
  localizacao_atual: string;
  status: StatusEquipe;
  membros: Membro[];
  producao_mes: string;
}

/* ── Labels ──────────────────────────────────────────────── */

const STATUS_LABEL: Record<StatusEquipe, string> = {
  ativa: "Ativa",
  inativa: "Inativa",
  ferias: "Em Férias",
};
const STATUS_COR: Record<StatusEquipe, string> = {
  ativa: "#10b981",
  inativa: "#64748b",
  ferias: "#8b5cf6",
};

/* ── Dados fictícios ─────────────────────────────────────── */

const equipesIniciais: Equipe[] = [
  {
    id: 1,
    codigo: "EQP-A",
    nome: "Equipe A",
    tipo: "Pavimentação",
    cor: "#f97316",
    lider: "Ana Líder de Campo",
    contrato_atual: "CON-2024-001",
    localizacao_atual: "BR-163 KM 145–152",
    status: "ativa",
    producao_mes: "1.420 t CBUQ · 18.400 m² imprimação",
    membros: [
      {
        nome: "Ana Líder de Campo",
        cargo: "Líder / Encarregada",
        matricula: "0042",
        turno: "Dia",
      },
      {
        nome: "João Mecânico",
        cargo: "Operador de Acabadora",
        matricula: "0015",
        turno: "Dia",
      },
      {
        nome: "Carlos Fernandes",
        cargo: "Operador de Rolo",
        matricula: "0058",
        turno: "Dia",
      },
      {
        nome: "Silvio Marques",
        cargo: "Servente de Pavimentação",
        matricula: "0071",
        turno: "Dia",
      },
      {
        nome: "Raimundo Costa",
        cargo: "Servente de Pavimentação",
        matricula: "0082",
        turno: "Dia",
      },
      {
        nome: "Paulo Motorista",
        cargo: "Motorista Caminhão",
        matricula: "0029",
        turno: "Dia",
      },
    ],
  },
  {
    id: 2,
    codigo: "EQP-B",
    nome: "Equipe B",
    tipo: "Terraplanagem",
    cor: "#3b82f6",
    lider: "Fernando Encarregado",
    contrato_atual: "CON-2024-001",
    localizacao_atual: "BR-163 KM 151–155",
    status: "ativa",
    producao_mes: "22.400 m³ corte/aterro · 9.200 m² compactação",
    membros: [
      {
        nome: "Fernando Encarregado",
        cargo: "Encarregado",
        matricula: "0033",
        turno: "Dia",
      },
      {
        nome: "Pedro Operador",
        cargo: "Operador de Escavadeira",
        matricula: "0018",
        turno: "Dia",
      },
      {
        nome: "Waldemiro Op.",
        cargo: "Operador de Motoniveladora",
        matricula: "0044",
        turno: "Dia",
      },
      {
        nome: "Cícero Lima",
        cargo: "Operador de Compactador",
        matricula: "0066",
        turno: "Dia",
      },
      {
        nome: "Antônio Saraiva",
        cargo: "Servente",
        matricula: "0087",
        turno: "Dia",
      },
    ],
  },
  {
    id: 3,
    codigo: "EQP-C",
    nome: "Equipe C",
    tipo: "Drenagem",
    cor: "#06b6d4",
    lider: "Fernanda PCP",
    contrato_atual: "CON-2024-003",
    localizacao_atual: "Av. Norte — Cuiabá",
    status: "ativa",
    producao_mes: "1.680 m galeria · 18 bocas de lobo",
    membros: [
      {
        nome: "Fernanda PCP",
        cargo: "Coordenadora de Obra",
        matricula: "0022",
        turno: "Dia",
      },
      {
        nome: "Marcos Soares",
        cargo: "Operador de Mini-retro",
        matricula: "0039",
        turno: "Dia",
      },
      {
        nome: "José Drenagem",
        cargo: "Assentador de Galeria",
        matricula: "0055",
        turno: "Dia",
      },
      {
        nome: "Edilson Braga",
        cargo: "Assentador de Galeria",
        matricula: "0063",
        turno: "Dia",
      },
      {
        nome: "Valdir Souza",
        cargo: "Servente",
        matricula: "0078",
        turno: "Dia",
      },
      {
        nome: "Clóvis Matos",
        cargo: "Servente",
        matricula: "0091",
        turno: "Dia",
      },
    ],
  },
  {
    id: 4,
    codigo: "EQP-D",
    nome: "Equipe D",
    tipo: "Conservação",
    cor: "#10b981",
    lider: "Ricardo Prod.",
    contrato_atual: "CON-2024-004",
    localizacao_atual: "MT-208 KM 0–36",
    status: "ativa",
    producao_mes: "36 km roçada · 95 m² tapa-buracos",
    membros: [
      {
        nome: "Ricardo Prod.",
        cargo: "Encarregado de Conservação",
        matricula: "0031",
        turno: "Dia",
      },
      {
        nome: "Odair Pereira",
        cargo: "Operador de Trator",
        matricula: "0047",
        turno: "Dia",
      },
      {
        nome: "Benedito Alves",
        cargo: "Servente",
        matricula: "0074",
        turno: "Dia",
      },
      {
        nome: "Sandro Faria",
        cargo: "Servente",
        matricula: "0085",
        turno: "Dia",
      },
    ],
  },
  {
    id: 5,
    codigo: "EQP-E",
    nome: "Equipe E",
    tipo: "Obras de Arte",
    cor: "#8b5cf6",
    lider: "—",
    contrato_atual: "—",
    localizacao_atual: "—",
    status: "inativa",
    producao_mes: "—",
    membros: [
      {
        nome: "Hélio Carpinteiro",
        cargo: "Carpinteiro de Formas",
        matricula: "0052",
        turno: "Dia",
      },
      {
        nome: "Dirceu Ferreiro",
        cargo: "Ferreiro / Armador",
        matricula: "0069",
        turno: "Dia",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Equipes() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor";

  const [lista, setLista] = useState<Equipe[]>(equipesIniciais);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusEquipe | "">("");
  const [detalhe, setDetalhe] = useState<Equipe | null>(null);
  const [modalMembro, setModalMembro] = useState<Equipe | null>(null);
  const [formMembro, setFormMembro] = useState({
    nome: "",
    cargo: "",
    matricula: "",
    turno: "Dia",
  });

  const filtrada = lista.filter((e) => {
    const st = !filtroStatus || e.status === filtroStatus;
    const bk =
      !busca ||
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.lider.toLowerCase().includes(busca.toLowerCase()) ||
      e.tipo.toLowerCase().includes(busca.toLowerCase());
    return st && bk;
  });

  /* KPIs */
  const ativas = lista.filter((e) => e.status === "ativa").length;
  const totalMembros = lista.reduce((s, e) => s + e.membros.length, 0);
  const membrosAtivos = lista
    .filter((e) => e.status === "ativa")
    .reduce((s, e) => s + e.membros.length, 0);

  function adicionarMembro() {
    if (!modalMembro || !formMembro.nome || !formMembro.cargo) {
      toast.error("Preencha nome e cargo.");
      return;
    }
    setLista((p) =>
      p.map((e) =>
        e.id === modalMembro.id
          ? { ...e, membros: [...e.membros, { ...formMembro }] }
          : e,
      ),
    );
    setFormMembro({ nome: "", cargo: "", matricula: "", turno: "Dia" });
    toast.success("Membro adicionado.");
  }

  function removerMembro(equipeId: number, matricula: string) {
    if (!confirm("Remover membro da equipe?")) return;
    setLista((p) =>
      p.map((e) =>
        e.id === equipeId
          ? {
              ...e,
              membros: e.membros.filter((m) => m.matricula !== matricula),
            }
          : e,
      ),
    );
    toast.success("Membro removido.");
  }

  function alterarStatus(id: number, status: StatusEquipe) {
    setLista((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));
    toast.success(`Equipe marcada como: ${STATUS_LABEL[status]}`);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Equipes</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Equipes Ativas</div>
          <div className="text-3xl font-bold text-green-400">{ativas}</div>
          <div className="text-xs text-gray-400 mt-1">
            de {lista.length} cadastradas
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Colaboradores</div>
          <div className="text-3xl font-bold text-white">{totalMembros}</div>
          <div className="text-xs text-green-400 mt-1">
            {membrosAtivos} em campo hoje
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Contratos Ativos</div>
          <div className="text-3xl font-bold text-[#f97316]">
            {
              new Set(
                lista
                  .filter(
                    (e) => e.status === "ativa" && e.contrato_atual !== "—",
                  )
                  .map((e) => e.contrato_atual),
              ).size
            }
          </div>
          <div className="text-xs text-gray-400 mt-1">frentes abertas</div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Maior Equipe</div>
          <div className="text-3xl font-bold text-blue-400">
            {Math.max(...lista.map((e) => e.membros.length))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            membros na equipe maior
          </div>
        </GlassCard>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar equipe ou líder..."
          className="flex-1 min-w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#f97316]/50"
        />
        <div className="flex gap-1">
          {(["", "ativa", "inativa", "ferias"] as (StatusEquipe | "")[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s as StatusEquipe | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatus === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {s ? STATUS_LABEL[s as StatusEquipe] : "Todas"}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Cards de equipes */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtrada.map((eq) => (
          <div
            key={eq.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            style={{ borderTopColor: eq.cor, borderTopWidth: 3 }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-lg">
                      {eq.nome}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        color: STATUS_COR[eq.status],
                        backgroundColor: `${STATUS_COR[eq.status]}20`,
                      }}
                    >
                      {STATUS_LABEL[eq.status]}
                    </span>
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: eq.cor }}>
                    {eq.tipo}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {eq.membros.length}
                  </div>
                  <div className="text-gray-400 text-xs">membros</div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Líder</span>
                  <span className="text-white">{eq.lider}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 shrink-0">Contrato</span>
                  <span className="text-white">{eq.contrato_atual}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-20 shrink-0">
                    Localização
                  </span>
                  <span className="text-white">{eq.localizacao_atual}</span>
                </div>
                {eq.producao_mes !== "—" && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-20 shrink-0">
                      Produção
                    </span>
                    <span className="text-green-400">{eq.producao_mes}</span>
                  </div>
                )}
              </div>

              {/* Miniaturas dos membros */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {eq.membros.slice(0, 5).map((m) => (
                  <div
                    key={m.matricula}
                    title={`${m.nome} — ${m.cargo}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundColor: `${eq.cor}40`,
                      border: `1px solid ${eq.cor}60`,
                    }}
                  >
                    {m.nome
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                ))}
                {eq.membros.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
                    +{eq.membros.length - 5}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-4 flex gap-2 border-t border-white/10 pt-3">
              <button
                onClick={() => setDetalhe(eq)}
                className="flex-1 text-xs text-gray-400 hover:text-white py-1.5 border border-white/10 rounded-lg transition-colors"
              >
                Ver Membros
              </button>
              {podeEditar && (
                <button
                  onClick={() => {
                    setModalMembro(eq);
                    setFormMembro({
                      nome: "",
                      cargo: "",
                      matricula: "",
                      turno: "Dia",
                    });
                  }}
                  className="flex-1 text-xs text-[#f97316] hover:text-orange-400 py-1.5 border border-[#f97316]/30 rounded-lg transition-colors"
                >
                  + Membro
                </button>
              )}
              {podeEditar && (
                <select
                  value={eq.status}
                  onChange={(e) =>
                    alterarStatus(eq.id, e.target.value as StatusEquipe)
                  }
                  className="text-xs bg-transparent border border-white/10 rounded-lg px-2 text-gray-400"
                >
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                  <option value="ferias">Férias</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalhe — membros */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.nome} — Membros` : ""}
      >
        {detalhe && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">Tipo:</span>
              <span style={{ color: detalhe.cor }}>{detalhe.tipo}</span>
              <span className="text-gray-400 ml-2">Líder:</span>
              <span className="text-white">{detalhe.lider}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    {["Matrícula", "Nome", "Cargo", "Turno"].map((h) => (
                      <th
                        key={h}
                        className="text-xs text-gray-400 font-medium pb-2 pr-3"
                      >
                        {h}
                      </th>
                    ))}
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {detalhe.membros.map((m) => (
                    <tr key={m.matricula} className="border-b border-white/5">
                      <td className="py-2 pr-3 font-mono text-xs text-gray-400">
                        {m.matricula}
                      </td>
                      <td className="py-2 pr-3 text-white">{m.nome}</td>
                      <td className="py-2 pr-3 text-gray-300 text-xs">
                        {m.cargo}
                      </td>
                      <td className="py-2 pr-3 text-gray-400 text-xs">
                        {m.turno}
                      </td>
                      {podeEditar && (
                        <td className="py-2">
                          <button
                            onClick={() =>
                              removerMembro(detalhe.id, m.matricula)
                            }
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Modal adicionar membro */}
      <GlassModal
        open={!!modalMembro}
        onClose={() => setModalMembro(null)}
        title={`Adicionar Membro — ${modalMembro?.nome}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nome *</label>
              <input
                value={formMembro.nome}
                onChange={(e) =>
                  setFormMembro({ ...formMembro, nome: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Matrícula
              </label>
              <input
                value={formMembro.matricula}
                onChange={(e) =>
                  setFormMembro({ ...formMembro, matricula: e.target.value })
                }
                placeholder="0099"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Cargo *</label>
            <input
              value={formMembro.cargo}
              onChange={(e) =>
                setFormMembro({ ...formMembro, cargo: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Turno</label>
            <select
              value={formMembro.turno}
              onChange={(e) =>
                setFormMembro({ ...formMembro, turno: e.target.value })
              }
              className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="Dia">Dia</option>
              <option value="Noite">Noite</option>
              <option value="Revezamento">Revezamento</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalMembro(null)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={adicionarMembro}
              disabled={!formMembro.nome || !formMembro.cargo}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Adicionar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

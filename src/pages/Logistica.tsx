import { useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

type StatusViagem = "programada" | "em_andamento" | "concluida" | "cancelada";
type TipoVeiculo = "caminhao" | "van" | "pickup" | "carreta" | "tanque";

interface Veiculo {
  placa: string;
  modelo: string;
  tipo: TipoVeiculo;
  motorista: string;
  status: "disponivel" | "em_viagem" | "manutencao";
  km_atual: number;
}

interface Viagem {
  id: number;
  codigo: string;
  veiculo_placa: string;
  veiculo_modelo: string;
  motorista: string;
  origem: string;
  destino: string;
  finalidade: string;
  centro_custo: string;
  data_saida: string;
  hora_saida: string;
  data_previsao: string;
  km_saida: number;
  km_chegada: number;
  status: StatusViagem;
  carga: string;
  observacoes: string;
}

interface AbastecimentoRegistro {
  id: number;
  veiculo_placa: string;
  veiculo_modelo: string;
  data: string;
  km: number;
  litros: number;
  valor_litro: number;
  posto: string;
  motorista: string;
  centro_custo: string;
}

type Aba = "viagens" | "frota" | "abastecimentos";

/* ── Labels e cores ─────────────────────────────────────── */

const STATUS_VIAGEM_LABEL: Record<StatusViagem, string> = {
  programada: "Programada",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
const STATUS_VIAGEM_COR: Record<StatusViagem, string> = {
  programada: "#8b5cf6",
  em_andamento: "#f97316",
  concluida: "#10b981",
  cancelada: "#64748b",
};

const STATUS_FROTA_COR: Record<string, string> = {
  disponivel: "#10b981",
  em_viagem: "#f97316",
  manutencao: "#ef4444",
};
const STATUS_FROTA_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  em_viagem: "Em Viagem",
  manutencao: "Manutenção",
};

/* ── Dados fictícios ────────────────────────────────────── */

const frota: Veiculo[] = [
  {
    placa: "CMB-5523",
    modelo: "Caminhão Basculante MB Axor 2644",
    tipo: "caminhao",
    motorista: "Paulo Motorista",
    status: "em_viagem",
    km_atual: 184220,
  },
  {
    placa: "CMB-4417",
    modelo: "Caminhão Volvo FH460 — Betoneira",
    tipo: "caminhao",
    motorista: "Fernando Enc.",
    status: "disponivel",
    km_atual: 97480,
  },
  {
    placa: "CMB-6610",
    modelo: "Caminhão Tanque Volvo FMX 420",
    tipo: "tanque",
    motorista: "Waldemiro Op.",
    status: "em_viagem",
    km_atual: 211840,
  },
  {
    placa: "VAN-1102",
    modelo: "Van Sprinter 415 — Transporte",
    tipo: "van",
    motorista: "—",
    status: "disponivel",
    km_atual: 52300,
  },
  {
    placa: "PCK-0841",
    modelo: "Pickup Hilux SRX 4x4 2022",
    tipo: "pickup",
    motorista: "Ricardo (Produção)",
    status: "em_viagem",
    km_atual: 38920,
  },
  {
    placa: "CRT-9910",
    modelo: "Carreta Graneleira Randon RK",
    tipo: "carreta",
    motorista: "—",
    status: "manutencao",
    km_atual: 308740,
  },
];

const viagensIniciais: Viagem[] = [
  {
    id: 1,
    codigo: "VGM-2024-0841",
    veiculo_placa: "CMB-5523",
    veiculo_modelo: "MB Axor 2644",
    motorista: "Paulo Motorista",
    origem: "Pátio Central — Sinop/MT",
    destino: "BR-163 KM 147 — Frente de obra",
    finalidade: "Transporte de CBUQ usinado para pavimentação",
    centro_custo: "Conserva DER",
    data_saida: "2024-06-27",
    hora_saida: "06:30",
    data_previsao: "2024-06-27",
    km_saida: 184020,
    km_chegada: 0,
    status: "em_andamento",
    carga: "18t CBUQ",
    observacoes: "3ª viagem do dia.",
  },
  {
    id: 2,
    codigo: "VGM-2024-0840",
    veiculo_placa: "CMB-6610",
    veiculo_modelo: "Volvo FMX 420",
    motorista: "Waldemiro Op.",
    origem: "Posto Petrobras — BR-163 KM 320",
    destino: "Pátio Central — Sinop/MT",
    finalidade: "Abastecimento de frota — diesel S-10",
    centro_custo: "Produção",
    data_saida: "2024-06-27",
    hora_saida: "05:45",
    data_previsao: "2024-06-27",
    km_saida: 211640,
    km_chegada: 0,
    status: "em_andamento",
    carga: "15.000L diesel S-10",
    observacoes: "",
  },
  {
    id: 3,
    codigo: "VGM-2024-0839",
    veiculo_placa: "PCK-0841",
    veiculo_modelo: "Hilux SRX 4x4",
    motorista: "Ricardo (Produção)",
    origem: "Escritório Sinop",
    destino: "SINFRA — Cuiabá/MT",
    finalidade: "Entrega de BM e documentação contratual",
    centro_custo: "Engenharia",
    data_saida: "2024-06-27",
    hora_saida: "07:00",
    data_previsao: "2024-06-27",
    km_saida: 38760,
    km_chegada: 0,
    status: "em_andamento",
    carga: "Documentação",
    observacoes: "Retorno previsto 18h.",
  },
  {
    id: 4,
    codigo: "VGM-2024-0838",
    veiculo_placa: "CMB-5523",
    veiculo_modelo: "MB Axor 2644",
    motorista: "Paulo Motorista",
    origem: "Pátio Central — Sinop/MT",
    destino: "BR-163 KM 147",
    finalidade: "Transporte de CBUQ",
    centro_custo: "Conserva DER",
    data_saida: "2024-06-26",
    hora_saida: "06:30",
    data_previsao: "2024-06-26",
    km_saida: 183820,
    km_chegada: 184020,
    status: "concluida",
    carga: "18t CBUQ",
    observacoes: "2ª viagem do dia 26/06.",
  },
  {
    id: 5,
    codigo: "VGM-2024-0837",
    veiculo_placa: "CMB-4417",
    veiculo_modelo: "Volvo FH460",
    motorista: "Fernando Enc.",
    origem: "Pátio Central — Sinop/MT",
    destino: "Acesso Industrial — Parque Emp.",
    finalidade: "Transporte de concreto usinado",
    centro_custo: "Engenharia",
    data_saida: "2024-06-26",
    hora_saida: "08:00",
    data_previsao: "2024-06-26",
    km_saida: 97320,
    km_chegada: 97480,
    status: "concluida",
    carga: "8m³ concreto",
    observacoes: "",
  },
  {
    id: 6,
    codigo: "VGM-2024-0820",
    veiculo_placa: "CRT-9910",
    veiculo_modelo: "Randon RK",
    motorista: "—",
    origem: "Pátio Central — Sinop/MT",
    destino: "Pedreira Central — Nova Mutum/MT",
    finalidade: "Carga de brita para estoque",
    centro_custo: "Terraplanagem",
    data_saida: "2024-06-25",
    hora_saida: "05:30",
    data_previsao: "2024-06-25",
    km_saida: 308480,
    km_chegada: 308740,
    status: "concluida",
    carga: '30t brita 3/4"',
    observacoes:
      "Retornou com 30t. Carreta em manutenção preventiva desde 26/06.",
  },
];

const abastecimentos: AbastecimentoRegistro[] = [
  {
    id: 1,
    veiculo_placa: "CMB-5523",
    veiculo_modelo: "MB Axor 2644",
    data: "2024-06-26",
    km: 183820,
    litros: 280,
    valor_litro: 6.45,
    posto: "Posto Boa Viagem — Sinop",
    motorista: "Paulo Motorista",
    centro_custo: "Conserva DER",
  },
  {
    id: 2,
    veiculo_placa: "CMB-6610",
    veiculo_modelo: "Volvo FMX 420",
    data: "2024-06-25",
    km: 211480,
    litros: 420,
    valor_litro: 6.45,
    posto: "Petrobras — BR-163 KM 320",
    motorista: "Waldemiro Op.",
    centro_custo: "Produção",
  },
  {
    id: 3,
    veiculo_placa: "CMB-4417",
    veiculo_modelo: "Volvo FH460",
    data: "2024-06-25",
    km: 97240,
    litros: 190,
    valor_litro: 6.45,
    posto: "Posto Boa Viagem — Sinop",
    motorista: "Fernando Enc.",
    centro_custo: "Engenharia",
  },
  {
    id: 4,
    veiculo_placa: "PCK-0841",
    veiculo_modelo: "Hilux SRX",
    data: "2024-06-24",
    km: 38680,
    litros: 55,
    valor_litro: 6.45,
    posto: "Posto Central — Sinop",
    motorista: "Ricardo (Produção)",
    centro_custo: "Engenharia",
  },
  {
    id: 5,
    veiculo_placa: "VAN-1102",
    veiculo_modelo: "Sprinter 415",
    data: "2024-06-24",
    km: 52220,
    litros: 62,
    valor_litro: 6.45,
    posto: "Posto Boa Viagem — Sinop",
    motorista: "Ana Líder",
    centro_custo: "Geral",
  },
  {
    id: 6,
    veiculo_placa: "CRT-9910",
    veiculo_modelo: "Randon RK",
    data: "2024-06-23",
    km: 308340,
    litros: 510,
    valor_litro: 6.45,
    posto: "Petrobras — BR-163 KM 320",
    motorista: "—",
    centro_custo: "Terraplanagem",
  },
  {
    id: 7,
    veiculo_placa: "CMB-5523",
    veiculo_modelo: "MB Axor 2644",
    data: "2024-06-22",
    km: 183600,
    litros: 295,
    valor_litro: 6.42,
    posto: "Posto Boa Viagem — Sinop",
    motorista: "Paulo Motorista",
    centro_custo: "Conserva DER",
  },
  {
    id: 8,
    veiculo_placa: "CMB-6610",
    veiculo_modelo: "Volvo FMX 420",
    data: "2024-06-21",
    km: 211180,
    litros: 430,
    valor_litro: 6.42,
    posto: "Petrobras — BR-163 KM 320",
    motorista: "Waldemiro Op.",
    centro_custo: "Produção",
  },
];

/* ── Utilitários ─────────────────────────────────────────── */

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */

export default function Logistica() {
  const { user } = useAuth();
  const toast = useToast();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";

  const [aba, setAba] = useState<Aba>("viagens");
  const [listaViagens, setListaViagens] = useState<Viagem[]>(viagensIniciais);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusViagem | "">("");
  const [detalhe, setDetalhe] = useState<Viagem | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    veiculo_placa: "",
    motorista: "",
    origem: "",
    destino: "",
    finalidade: "",
    centro_custo: "Produção",
    data_saida: "",
    hora_saida: "",
    carga: "",
    observacoes: "",
  });

  const viagensFiltradas = listaViagens.filter((v) => {
    const st = !filtroStatus || v.status === filtroStatus;
    const bk =
      !busca ||
      v.motorista.toLowerCase().includes(busca.toLowerCase()) ||
      v.destino.toLowerCase().includes(busca.toLowerCase()) ||
      v.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      v.veiculo_placa.toLowerCase().includes(busca.toLowerCase());
    return st && bk;
  });

  const abastFiltrados = abastecimentos.filter(
    (a) =>
      !busca ||
      a.veiculo_placa.toLowerCase().includes(busca.toLowerCase()) ||
      a.motorista.toLowerCase().includes(busca.toLowerCase()),
  );

  /* KPIs */
  const emViagem = frota.filter((f) => f.status === "em_viagem").length;
  const disponiveis = frota.filter((f) => f.status === "disponivel").length;
  const emManutencao = frota.filter((f) => f.status === "manutencao").length;
  const totalCombustivel = abastecimentos.reduce(
    (s, a) => s + a.litros * a.valor_litro,
    0,
  );

  function concluirViagem(id: number) {
    setListaViagens((p) =>
      p.map((v) =>
        v.id === id
          ? {
              ...v,
              status: "concluida",
              km_chegada: v.km_saida + Math.floor(Math.random() * 200) + 50,
            }
          : v,
      ),
    );
    toast.success("Viagem concluída.");
  }
  function cancelarViagem(id: number) {
    if (!confirm("Cancelar viagem?")) return;
    setListaViagens((p) =>
      p.map((v) => (v.id === id ? { ...v, status: "cancelada" } : v)),
    );
    toast.success("Viagem cancelada.");
  }
  function salvarViagem() {
    if (!form.codigo || !form.veiculo_placa || !form.destino) {
      toast.error("Preencha código, veículo e destino.");
      return;
    }
    const veiculo = frota.find((f) => f.placa === form.veiculo_placa);
    const nova: Viagem = {
      id: Date.now(),
      ...form,
      veiculo_modelo: veiculo?.modelo ?? form.veiculo_placa,
      km_saida: veiculo?.km_atual ?? 0,
      km_chegada: 0,
      data_previsao: form.data_saida,
      status: "programada",
    };
    setListaViagens((p) => [nova, ...p]);
    toast.success("Viagem programada.");
    setModalNovo(false);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Logística</h1>
        {podeEditar && aba === "viagens" && (
          <button
            onClick={() => {
              setForm({
                codigo: "",
                veiculo_placa: "",
                motorista: "",
                origem: "Pátio Central — Sinop/MT",
                destino: "",
                finalidade: "",
                centro_custo: "Produção",
                data_saida: new Date().toISOString().split("T")[0],
                hora_saida: "",
                carga: "",
                observacoes: "",
              });
              setModalNovo(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nova Viagem
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Veículos em Viagem</div>
          <div className="text-3xl font-bold text-[#f97316]">{emViagem}</div>
          <div className="text-xs text-gray-400 mt-1">
            de {frota.length} na frota
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Disponíveis</div>
          <div className="text-3xl font-bold text-green-400">{disponiveis}</div>
          <div className="text-xs text-red-400 mt-1">
            {emManutencao} em manutenção
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Viagens (mês)</div>
          <div className="text-3xl font-bold text-white">
            {listaViagens.filter((v) => v.status !== "cancelada").length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {listaViagens.filter((v) => v.status === "concluida").length}{" "}
            concluídas
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-gray-400 text-xs mb-1">Combustível (mês)</div>
          <div className="text-xl font-bold text-[#f97316]">
            {moeda(totalCombustivel)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {abastecimentos
              .reduce((s, a) => s + a.litros, 0)
              .toLocaleString("pt-BR")}{" "}
            L abastecidos
          </div>
        </GlassCard>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {(
          [
            ["viagens", "Viagens"],
            ["frota", "Frota"],
            ["abastecimentos", "Abastecimentos"],
          ] as [Aba, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => {
              setAba(v);
              setBusca("");
              setFiltroStatus("");
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

      {/* ── ABA: VIAGENS ── */}
      {aba === "viagens" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(
              ["", "programada", "em_andamento", "concluida", "cancelada"] as (
                StatusViagem | ""
              )[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s as StatusViagem | "")}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filtroStatus === s ? "bg-[#f97316] text-white font-medium" : "bg-white/5 text-gray-400 hover:text-white"}`}
              >
                {s ? STATUS_VIAGEM_LABEL[s as StatusViagem] : "Todas"}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {viagensFiltradas.map((v) => (
              <div
                key={v.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
                style={{
                  borderLeftColor: STATUS_VIAGEM_COR[v.status],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-400 text-xs font-mono">
                        {v.codigo}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_VIAGEM_COR[v.status],
                          backgroundColor: `${STATUS_VIAGEM_COR[v.status]}20`,
                        }}
                      >
                        {STATUS_VIAGEM_LABEL[v.status]}
                      </span>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {v.centro_custo}
                      </span>
                    </div>
                    <div className="text-white font-semibold mt-1">
                      {v.finalidade}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded">
                        {v.origem}
                      </span>
                      <span className="text-gray-600">→</span>
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded">
                        {v.destino}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1.5">
                      {v.veiculo_placa} · {v.veiculo_modelo} · Motorista:{" "}
                      {v.motorista}
                      {v.carga ? ` · Carga: ${v.carga}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-white font-medium">{v.data_saida}</div>
                    <div className="text-gray-400 text-xs">{v.hora_saida}</div>
                    {v.km_chegada > 0 && (
                      <div className="text-green-400 text-xs mt-1">
                        {(v.km_chegada - v.km_saida).toLocaleString("pt-BR")} km
                      </div>
                    )}
                  </div>
                </div>
                {podeEditar && v.status === "em_andamento" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setDetalhe(v)}
                      className="text-xs text-gray-400 hover:text-white px-3 py-1 border border-white/10 rounded-lg transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => concluirViagem(v.id)}
                      className="text-xs text-green-400 hover:text-green-300 px-3 py-1 border border-green-500/30 rounded-lg transition-colors"
                    >
                      Concluir
                    </button>
                    <button
                      onClick={() => cancelarViagem(v.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-3 py-1"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {v.status === "concluida" && (
                  <div className="mt-2 text-xs text-gray-500">
                    {v.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ABA: FROTA ── */}
      {aba === "frota" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frota
            .filter(
              (f) =>
                !busca ||
                f.placa.toLowerCase().includes(busca.toLowerCase()) ||
                f.modelo.toLowerCase().includes(busca.toLowerCase()) ||
                f.motorista.toLowerCase().includes(busca.toLowerCase()),
            )
            .map((f) => (
              <div
                key={f.placa}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
                style={{
                  borderTopColor: STATUS_FROTA_COR[f.status],
                  borderTopWidth: 3,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-white font-bold">
                      {f.placa}
                    </div>
                    <div className="text-gray-300 text-sm mt-0.5">
                      {f.modelo}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      color: STATUS_FROTA_COR[f.status],
                      backgroundColor: `${STATUS_FROTA_COR[f.status]}20`,
                    }}
                  >
                    {STATUS_FROTA_LABEL[f.status]}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Motorista</span>
                    <span className="text-white">{f.motorista}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">KM atual</span>
                    <span className="text-white">
                      {f.km_atual.toLocaleString("pt-BR")} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo</span>
                    <span className="text-gray-300 capitalize">{f.tipo}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── ABA: ABASTECIMENTOS ── */}
      {aba === "abastecimentos" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  "Data",
                  "Placa / Veículo",
                  "Motorista",
                  "KM",
                  "Litros",
                  "R$/L",
                  "Total",
                  "Posto",
                  "CC",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-xs text-gray-400 font-medium pb-2 pr-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {abastFiltrados.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-white/5 hover:bg-white/3"
                >
                  <td className="py-3 pr-3 text-xs text-gray-300">{a.data}</td>
                  <td className="py-3 pr-3">
                    <div className="font-mono text-white text-xs">
                      {a.veiculo_placa}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {a.veiculo_modelo}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-gray-300 text-xs">
                    {a.motorista}
                  </td>
                  <td className="py-3 pr-3 text-gray-300 text-xs">
                    {a.km.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 pr-3 text-white font-medium text-xs">
                    {a.litros.toLocaleString("pt-BR")} L
                  </td>
                  <td className="py-3 pr-3 text-gray-300 text-xs">
                    {moeda(a.valor_litro)}
                  </td>
                  <td className="py-3 pr-3 text-[#f97316] font-medium text-xs">
                    {moeda(a.litros * a.valor_litro)}
                  </td>
                  <td className="py-3 pr-3 text-gray-400 text-xs">{a.posto}</td>
                  <td className="py-3">
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      {a.centro_custo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/20">
                <td
                  colSpan={4}
                  className="pt-3 text-xs text-gray-400 text-right pr-3 font-medium"
                >
                  Total
                </td>
                <td className="pt-3 text-white font-bold text-xs">
                  {abastFiltrados
                    .reduce((s, a) => s + a.litros, 0)
                    .toLocaleString("pt-BR")}{" "}
                  L
                </td>
                <td />
                <td className="pt-3 text-[#f97316] font-bold text-xs">
                  {moeda(
                    abastFiltrados.reduce(
                      (s, a) => s + a.litros * a.valor_litro,
                      0,
                    ),
                  )}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modal detalhe viagem */}
      <GlassModal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.codigo}` : ""}
      >
        {detalhe && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400">Veículo:</span>{" "}
                <span className="text-white">
                  {detalhe.veiculo_placa} — {detalhe.veiculo_modelo}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Motorista:</span>{" "}
                <span className="text-white">{detalhe.motorista}</span>
              </div>
              <div>
                <span className="text-gray-400">Saída:</span>{" "}
                <span className="text-white">
                  {detalhe.data_saida} {detalhe.hora_saida}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Centro:</span>{" "}
                <span className="text-purple-400">{detalhe.centro_custo}</span>
              </div>
              <div>
                <span className="text-gray-400">Origem:</span>{" "}
                <span className="text-white">{detalhe.origem}</span>
              </div>
              <div>
                <span className="text-gray-400">Destino:</span>{" "}
                <span className="text-white">{detalhe.destino}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Finalidade</div>
              <div className="text-white text-sm">{detalhe.finalidade}</div>
              {detalhe.carga && (
                <div className="text-gray-400 text-xs mt-1">
                  Carga: {detalhe.carga}
                </div>
              )}
            </div>
            {detalhe.observacoes && (
              <div className="text-xs text-gray-400">{detalhe.observacoes}</div>
            )}
          </div>
        )}
      </GlassModal>

      {/* Modal nova viagem */}
      <GlassModal
        open={modalNovo}
        onClose={() => setModalNovo(false)}
        title="Programar Viagem"
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
                placeholder="VGM-2024-0842"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Veículo *
              </label>
              <select
                value={form.veiculo_placa}
                onChange={(e) => {
                  const v = frota.find((f) => f.placa === e.target.value);
                  setForm({
                    ...form,
                    veiculo_placa: e.target.value,
                    motorista: v?.motorista ?? form.motorista,
                  });
                }}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Selecione...</option>
                {frota
                  .filter((f) => f.status === "disponivel")
                  .map((f) => (
                    <option key={f.placa} value={f.placa}>
                      {f.placa} — {f.modelo}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Motorista
              </label>
              <input
                value={form.motorista}
                onChange={(e) =>
                  setForm({ ...form, motorista: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Centro de Custo
              </label>
              <select
                value={form.centro_custo}
                onChange={(e) =>
                  setForm({ ...form, centro_custo: e.target.value })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {[
                  "Engenharia",
                  "Conserva DER",
                  "Terraplanagem",
                  "Manutenção",
                  "Produção",
                  "Geral",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Data de Saída
              </label>
              <input
                type="date"
                value={form.data_saida}
                onChange={(e) =>
                  setForm({ ...form, data_saida: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Hora de Saída
              </label>
              <input
                type="time"
                value={form.hora_saida}
                onChange={(e) =>
                  setForm({ ...form, hora_saida: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Origem</label>
            <input
              value={form.origem}
              onChange={(e) => setForm({ ...form, origem: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Destino *
            </label>
            <input
              value={form.destino}
              onChange={(e) => setForm({ ...form, destino: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Finalidade
            </label>
            <input
              value={form.finalidade}
              onChange={(e) => setForm({ ...form, finalidade: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Carga / Observações
            </label>
            <input
              value={form.carga}
              onChange={(e) => setForm({ ...form, carga: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalNovo(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={salvarViagem}
              disabled={!form.codigo || !form.veiculo_placa || !form.destino}
              className="bg-[#f97316] disabled:opacity-40 hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Programar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}

import { Link } from "react-router-dom";

const BENEFICIOS = [
  {
    icon: "📁",
    titulo: "Contratos",
    descricao:
      "Gestão completa do portfólio de contratos. Saldo, ciclos, serviços e medições em um só lugar.",
  },
  {
    icon: "🗓️",
    titulo: "PCP / Planejamento",
    descricao:
      "Programação diária, semanal e mensal de equipes, serviços e frentes de trabalho.",
  },
  {
    icon: "📲",
    titulo: "Apontamento de Campo",
    descricao:
      "Registro de produção de campo em tempo real. Substitui planilhas e aplicativos externos.",
  },
  {
    icon: "📐",
    titulo: "Medição",
    descricao:
      "Apuração automática de serviços executados. Do apontamento ao boletim de medição.",
  },
  {
    icon: "🛠️",
    titulo: "Manutenção",
    descricao:
      "Gestão da frota e equipamentos. Ordens de serviço, preventiva e corretiva integradas ao planejamento.",
  },
  {
    icon: "📦",
    titulo: "Suprimentos",
    descricao:
      "Controle de estoque, requisições e insumos. Integrado ao planejamento e à produção.",
  },
  {
    icon: "⚙️",
    titulo: "Engenharia",
    descricao:
      "Instruções de trabalho, composições de serviço e documentos técnicos para todos os setores.",
  },
  {
    icon: "🚛",
    titulo: "Logística",
    descricao:
      "Alocação de veículos, roteiros e deslocamentos integrados ao planejamento de campo.",
  },
  {
    icon: "👷",
    titulo: "Equipes",
    descricao:
      "Gestão de colaboradores, líderes e frentes. Produtividade e histórico por equipe.",
  },
  {
    icon: "📊",
    titulo: "Relatórios Executivos",
    descricao:
      "Indicadores consolidados para gestão e diretoria. Planejado x realizado, custos e produtividade.",
  },
];

const FLUXO = [
  {
    num: "1",
    titulo: "Operador faz o checklist",
    desc: "Inspeção pré-operacional registrada no celular antes de ligar o equipamento.",
    cor: "#a78bfa",
  },
  {
    num: "2",
    titulo: "Anomalia gera alerta",
    desc: "Item crítico reprovado cria alerta imediato para o gestor e o mecânico.",
    cor: "#f97316",
  },
  {
    num: "3",
    titulo: "OS criada com IT vinculada",
    desc: "Ordem de manutenção é aberta com a instrução de trabalho correta já anexada.",
    cor: "#3b82f6",
  },
  {
    num: "4",
    titulo: "Mecânico executa passo a passo",
    desc: "Cada etapa da IT é confirmada no sistema. Nada é esquecido.",
    cor: "#10b981",
  },
  {
    num: "5",
    titulo: "Gestão aprova e fecha",
    desc: "Gestor valida a OS, o histórico é registrado e o equipamento volta ao trecho.",
    cor: "#f5c518",
  },
];

const PERFIS = [
  {
    role: "Diretoria",
    sub: "gestor",
    cor: "#f5c518",
    desc: "Indicadores, relatórios de custo e disponibilidade de frota.",
  },
  {
    role: "Gestor de Manutenção",
    sub: "gestor",
    cor: "#f97316",
    desc: "Gestão plena: frota, planos preventivos, OS e equipe.",
  },
  {
    role: "Gestor de Produção",
    sub: "lider_campo",
    cor: "#3b82f6",
    desc: "Programa disponibilidade de equipamentos por trecho/contrato.",
  },
  {
    role: "Gestor de Suprimentos",
    sub: "lider_campo",
    cor: "#06b6d4",
    desc: "Controla estoque de peças; recebe alertas de reposição.",
  },
  {
    role: "PCP",
    sub: "lider_campo",
    cor: "#8b5cf6",
    desc: "Acompanha execução de OS e identifica gargalos na programação.",
  },
  {
    role: "Mecânico",
    sub: "mecanico",
    cor: "#10b981",
    desc: "Executa e registra cada passo da instrução de trabalho.",
  },
  {
    role: "Operador de Máquinas",
    sub: "operador",
    cor: "#a78bfa",
    desc: "Preenche checklist e reporta falhas antes de operar.",
  },
  {
    role: "Motorista",
    sub: "operador",
    cor: "#64748b",
    desc: "Checklist diário de caminhão e solicitação de manutenção.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="font-bold text-white text-xl tracking-wide">
              PRIMUS
            </span>
            <span className="font-bold text-[#f97316] text-xl"> SGI</span>
          </div>
          <Link
            to="/login"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Acessar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#f97316]/10 border border-[#f97316]/30 rounded-full px-4 py-1.5 text-sm text-[#f97316]">
            Plataforma Real-time Integrada de Management Unificado e Sistemas
          </div>
          <h2 className="text-5xl font-bold leading-tight">
            Do planejamento ao campo,
            <br />
            <span className="text-[#f97316]">tudo em um lugar.</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Do contrato à medição, do planejamento ao campo — o PRIMUS integra
            contratos, equipes, produção, manutenção e suprimentos em uma única
            plataforma. Rastreabilidade total, eliminação de retrabalho e visão
            executiva em tempo real para quem decide.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
            >
              Acessar o PRIMUS
            </Link>
            <a
              href="#fluxo"
              className="text-gray-400 hover:text-white px-6 py-3 rounded-xl border border-white/10 hover:border-white/30 transition-all text-sm"
            >
              Ver como funciona ↓
            </a>
          </div>
        </div>
      </section>

      {/* Fluxo operacional */}
      <section id="fluxo" className="py-20 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-3">
            Como funciona o fluxo
          </h3>
          <p className="text-gray-400 text-center mb-12">
            Do checklist do operador à liberação pelo gestor — tudo rastreado.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {FLUXO.map((f, i) => (
              <div key={f.num} className="flex-1 relative">
                <div
                  className="bg-white/5 border border-white/10 rounded-xl p-5 h-full"
                  style={{ borderTopColor: f.cor, borderTopWidth: 3 }}
                >
                  <div
                    className="text-2xl font-bold mb-2"
                    style={{ color: f.cor }}
                  >
                    {f.num}
                  </div>
                  <div className="text-white text-sm font-medium mb-1">
                    {f.titulo}
                  </div>
                  <div className="text-gray-400 text-xs leading-relaxed">
                    {f.desc}
                  </div>
                </div>
                {i < FLUXO.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-gray-600 text-lg">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-3">Por que usar?</h3>
          <p className="text-gray-400 text-center mb-12">
            Cada funcionalidade resolve um problema real da operação.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFICIOS.map((b) => (
              <div
                key={b.titulo}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#f97316]/30 transition-all"
              >
                <div className="text-3xl mb-4">{b.icon}</div>
                <h4 className="font-semibold text-white mb-2">{b.titulo}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {b.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfis */}
      <section className="py-20 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-3">
            Feito para toda a equipe
          </h3>
          <p className="text-gray-400 text-center mb-12">
            Cada perfil vê e faz exatamente o que precisa. Sem complexidade
            desnecessária.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERFIS.map((p) => (
              <div
                key={p.role}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3"
                style={{ borderLeftColor: p.cor, borderLeftWidth: 3 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: `${p.cor}20`, color: p.cor }}
                >
                  {p.role[0]}
                </div>
                <div>
                  <div className="font-medium text-xs" style={{ color: p.cor }}>
                    {p.role}
                  </div>
                  <div className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold">
            O sistema que sua operação estava esperando.
          </h3>
          <p className="text-gray-400">
            Do contrato ao faturamento, do planejamento ao apontamento de campo
            — o PRIMUS conecta cada setor, elimina retrabalho e entrega visão
            executiva para quem decide.
          </p>
          <Link
            to="/login"
            className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-10 py-3 rounded-xl text-lg transition-colors"
          >
            Acessar o PRIMUS
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-600 text-sm">
        PRIMUS — Sistema de Gestão Integrado · Contratos · PCP · Produção ·
        Engenharia · Manutenção · Suprimentos · Logística · Medição · Relatórios
      </footer>
    </div>
  );
}

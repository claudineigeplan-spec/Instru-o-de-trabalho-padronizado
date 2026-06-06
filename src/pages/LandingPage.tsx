import { Link } from "react-router-dom";

const BENEFICIOS = [
  {
    icon: "✅",
    titulo: "Checklists Pré-Operacionais",
    descricao:
      "Motoristas e operadores registram inspeções diárias no celular. Anomalias disparam OS automaticamente — o trecho não para por falha evitável.",
  },
  {
    icon: "📝",
    titulo: "Instruções de Trabalho Padronizadas",
    descricao:
      "Cada manutenção tem seu passo a passo aprovado pela gestão. O mecânico executa com consistência, sem improvisar.",
  },
  {
    icon: "🔗",
    titulo: "Integração entre Departamentos",
    descricao:
      "Manutenção, Produção, Suprimentos e PCP trabalham na mesma base. Cada área vê o que precisa e age no momento certo.",
  },
  {
    icon: "📦",
    titulo: "Estoque de Peças e Insumos",
    descricao:
      "Controle de estoque mínimo com alertas automáticos. Suprimentos recebe aviso antes de faltar peça na bancada.",
  },
  {
    icon: "🔔",
    titulo: "Alertas Automáticos de Vencimento",
    descricao:
      "O sistema avisa quando a manutenção vence pelo horímetro, hodômetro ou calendário. Nada passa em branco.",
  },
  {
    icon: "📊",
    titulo: "Relatórios para a Diretoria",
    descricao:
      "Histórico completo de intervenções, custo por equipamento, desempenho de mecânicos e disponibilidade de frota.",
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
            <span className="font-bold text-white text-lg">Gestão </span>
            <span className="font-bold text-[#f97316] text-lg">Integrada</span>
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
            🔗 Manutenção · Frota · Suprimentos
          </div>
          <h2 className="text-5xl font-bold leading-tight">
            O elo que conecta
            <br />
            <span className="text-[#f97316]">manutenção, produção</span>
            <br />e suprimentos
          </h2>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Checklists digitais e instruções de trabalho padronizadas garantem
            que nenhum equipamento fique parado no trecho por falta de peça,
            falha de programação ou manutenção esquecida.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors"
            >
              Entrar na plataforma
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
            Pronto para integrar sua operação?
          </h3>
          <p className="text-gray-400">
            Checklists, instruções de trabalho e ordens de manutenção em um
            único sistema. Nenhum equipamento parado por falta de comunicação.
          </p>
          <Link
            to="/login"
            className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-10 py-3 rounded-xl text-lg transition-colors"
          >
            Acessar a plataforma
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-600 text-sm">
        Gestão Integrada — Manutenção · Frota · Suprimentos · Produção
      </footer>
    </div>
  );
}

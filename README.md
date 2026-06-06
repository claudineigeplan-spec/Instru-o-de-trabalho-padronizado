# Instrução de Trabalho — Gestão de Manutenção de Roçadeiras

Plataforma web para gestão de manutenção preventiva e corretiva de roçadeiras, conectando Gestores, Líderes de Campo, Mecânicos e Operadores.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 11 / PHP 8.4 + MySQL 8 + Sanctum |
| Frontend | React 19 + TypeScript 5 + Vite + Tailwind CSS 4 |
| Infra | Docker + Docker Compose + Nginx |

## Início rápido

```bash
# 1. Clone e instale
git clone <repo>
cd Instrução-de-trabalho-padronizado
make install

# 2. Suba o ambiente (após a primeira instalação)
make up
npm run dev
```

Acesso: `http://localhost:5173`

## Credenciais padrão

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Gestor | gestor@instrucao.com | 123456 |
| Líder de Campo | lider@instrucao.com | 123456 |
| Mecânico | mecanico@instrucao.com | 123456 |
| Operador | operador@instrucao.com | 123456 |

## Perfis e permissões

| Perfil | Permissões |
|--------|-----------|
| **Gestor** | Acesso total — usuários, relatórios, configurações, aprovações |
| **Líder de Campo** | Ordens de manutenção, instruções, planos, estoque, equipe |
| **Mecânico** | Execução de ordens, instruções publicadas, checklists |
| **Operador** | Checklists pré-operacionais, leitura de ordens próprias |

## Módulos

- **Dashboard** — visão geral de métricas por perfil
- **Roçadeiras** — cadastro e controle de status (ativo / em manutenção / inativo)
- **Instruções de Trabalho** — procedimentos com passos sequenciais, tipo e status por fluxo
- **Ordens de Manutenção** — ciclo completo com atribuição de mecânico, vínculo com IT e execução de passos
- **Checklists** — formulários pré-operacionais diários com histórico; anomalias críticas geram OS automáticas
- **Planos de Manutenção** — gatilhos por horas/dias com antecedência de alerta
- **Alertas** — notificações internas filtradas por perfil (OS atribuída, status, manutenção vencida)
- **Estoque** — peças, óleos e filtros com estoque mínimo
- **Relatórios** — visão gerencial por período com desempenho de mecânicos e ranking de roçadeiras (gestor)

## Comandos Make

```bash
make install    # primeira vez — instala tudo
make up         # sobe containers (API + DB + Nginx)
make down       # derruba containers
make fresh      # recria banco e roda seeder (após mudanças de migration)
make seed       # apenas seeders
make migrate    # apenas migrations
make shell      # shell no container PHP
make thinker    # Laravel Tinker
make db         # MySQL CLI (banco manutencao)
make logs       # logs do container PHP
make send       # lint + commit + push (não rode git diretamente)
```

## Estrutura de pastas

```
/
├── backend/              # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/     # AlertaService, lógica de negócio
│   └── database/
│       ├── migrations/
│       └── seeders/
├── src/
│   ├── pages/            # Páginas React
│   ├── components/
│   │   ├── ui/           # GlassCard, GlassModal, StatusBadge, ...
│   │   └── layout/       # AppLayout, Sidebar, TopBar
│   ├── services/         # Comunicação com a API (axios)
│   ├── hooks/            # useAuth, useToast, useModalClose
│   ├── utils/            # format.ts
│   └── types/            # index.ts — tipos compartilhados
├── docker/               # Dockerfiles + Nginx config
├── Makefile
├── docker-compose.yml
└── package.json
```

## Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#0a1628` | Fundo principal |
| Card/Active | `#1e3a8a` | Cards, botão ativo, sidebar |
| Accent/CTA | `#f97316` | Botões de ação, badges, destaques |
| Texto primário | `#ffffff` | Títulos e conteúdo |
| Texto secundário | `#9ca3af` | Labels e metadados |

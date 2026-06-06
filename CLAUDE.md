# CLAUDE.md — Instrução de Trabalho

Guia de contexto para assistência de IA neste projeto. Leia antes de qualquer alteração.

## Regra nº 1: NÃO faça commits automáticos

Nunca rode `git commit`, `git push` ou `git add` por conta própria. O versionamento
é sempre disparado manualmente pelo desenvolvedor através do comando `make send`,
que pede a mensagem do commit.

## Padrão de idioma

- Todo o projeto é escrito em **português do Brasil**, com acentuação correta e obrigatória.
- Mensagens de UI, comentários de código, mensagens de erro e de commit seguem o mesmo padrão.
- Identificadores de código (variáveis, funções, classes) ficam em inglês; textos visíveis ao usuário ficam em português.

## Stack de tecnologia

**Backend** (`backend/`)
- Laravel 11+ / PHP 8.4+
- MySQL 8 (banco `manutencao`)
- Laravel Sanctum (autenticação via token Bearer)
- Arquitetura MVC + API REST JSON

**Frontend** (raiz do repositório)
- React 19 + TypeScript 5+
- Vite
- Tailwind CSS 4
- React Router

**Infraestrutura**
- Docker + Docker Compose
- Nginx como proxy reverso
- Makefile obrigatório para todos os comandos

## Estrutura de pastas

```
/
├── backend/        # Aplicação Laravel (API)
├── src/
│   ├── pages/      # Páginas React (rotas)
│   ├── components/ # Componentes reutilizáveis (ui/ e layout/)
│   ├── services/   # Camada de comunicação com a API (axios)
│   ├── hooks/      # Hooks e contextos React (useAuth, useToast)
│   ├── utils/      # Funções utilitárias (formatação, status)
│   └── types/      # Tipos TypeScript compartilhados
├── docker/         # Dockerfiles e configs do Nginx
├── CLAUDE.md
├── README.md
├── Makefile
├── docker-compose.yml
└── package.json
```

## Perfis de usuário

| Role         | Label           | Permissões principais                                          |
|--------------|-----------------|----------------------------------------------------------------|
| `gestor`     | Gestor          | Acesso total — usuários, relatórios, configurações             |
| `lider_campo`| Líder de Campo  | Ordens, equipe, planos de manutenção, estoque                  |
| `mecanico`   | Mecânico        | Execução de ordens e instruções de trabalho                    |
| `operador`   | Operador        | Checklists pré-operacionais e solicitações de manutenção       |

Usuários padrão (senha: `123456`):
- `gestor@instrucao.com`
- `lider@instrucao.com`
- `mecanico@instrucao.com`
- `operador@instrucao.com`

## Comandos Make

Nunca use `php artisan` diretamente — sempre passe pelo Makefile.

| Comando       | Descrição                                       |
|---------------|-------------------------------------------------|
| `make install`| Instala tudo e prepara o ambiente               |
| `make up`     | Sobe os containers (API + DB + Nginx)           |
| `make down`   | Derruba os containers                           |
| `make dev`    | Inicia o servidor de desenvolvimento do Vite    |
| `make migrate`| Roda as migrations                              |
| `make fresh`  | Recria o banco e roda os seeders                |
| `make seed`   | Roda apenas os seeders                          |
| `make send`   | Aplica lint, pede a mensagem e cria o commit    |
| `make db`     | Abre o cliente MySQL (banco `manutencao`)       |
| `make logs`   | Acompanha os logs do container PHP              |
| `make thinker`| Abre o Laravel Tinker                           |
| `make shell`  | Abre um shell no container PHP                  |

## Convenções de código

**React**
- Apenas componentes funcionais, sempre com hooks.
- Props tipadas com `interface`.
- Chamadas à API ficam isoladas em `services/` — nunca use `fetch`/`axios` diretamente em componentes.

**Laravel**
- Controllers retornam sempre JSON consistente.
- Validação via `FormRequest`.
- Transformação de resposta via API Resources.
- Regras de negócio vivem em `app/Services/` — controllers ficam enxutos.

**Banco de dados**
- Toda tabela tem `id()`, `timestamps()` e `softDeletes()`.
- Relacionamentos com `foreignId(...)->constrained()->onDelete('cascade')`.
- Seeders sempre idempotentes, usando `updateOrCreate()`.

## Padrões de UI

- Identidade visual **Glass Design** com paleta **azul-rei + laranja**:
  - Background: `#0a1628` (azul marinho escuro)
  - Active/cards: `#1e3a8a` (azul-rei)
  - Accent/CTA: `#f97316` (laranja)
  - Branco e tons de cinza para textos secundários
- SPA: navegação sem recarregar, com transições suaves.
- Responsivo: mobile, tablet e desktop.

### Modais

- Fecham ao pressionar **ESC** e ao **clicar fora** do conteúdo (no overlay).
- Use sempre `components/ui/GlassModal.tsx` — não reimplemente esse comportamento.

### Toasts e tratamento de erro

- Feedback via `hooks/useToast.tsx`, nunca via `alert()`.
- Erros devem virar mensagens claras em português.
- Use `resolveErrorMessage()` de `services/api.ts` para traduzir falhas de API.

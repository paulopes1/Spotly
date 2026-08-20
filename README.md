# Spotly AI

Plataforma que ajuda empreendedores a encontrar o ponto comercial ideal para alugar.
O usuário descreve o que precisa em linguagem natural — *"quero abrir uma academia em
Pinheiros, pagando até 10 mil de aluguel"* — e a IA interpreta a frase, cruza com a
base de imóveis, calcula uma **compatibilidade 0–100%** por imóvel e explica em
português os **prós e contras** de cada ponto, com mapa interativo e cards rankeados.

Visual implementado fielmente a partir do design system **Coral Energy** (Google Stitch).

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Frontend  | Next.js 14 (App Router) · TypeScript · Tailwind (tokens do DESIGN.md) · react-map-gl (Mapbox GL ou MapLibre) |
| Backend   | NestJS · TypeScript · TypeORM · arquitetura modular (`ai`, `scoring`, `search`, `auth`, `users`, `properties`) |
| Banco     | PostgreSQL 16 |
| IA        | OpenAI GPT-4o (extração de variáveis + prós/contras) com **fallback determinístico** — o produto funciona de ponta a ponta sem chave |

## Arquitetura do fluxo core

```
frase do usuário
   │  POST /api/search
   ▼
AiService.extractParams()      → GPT-4o (JSON mode) ou parser pt-BR (regex/dicionários)
   ▼
PropertiesRepository           → filtra cidade/bairro/orçamento (tolerância 25%)
   ▼
ScoringService                 → score 0–100 determinístico, pesos POR TIPO DE NEGÓCIO
   │                             (fluxo, concorrência, renda, âncoras, orçamento)
   ▼
AiService.generateProsCons()   → UMA chamada batch p/ os top 8 (custo ~1/8 de N chamadas)
   ▼
Persistência (Search + SearchResult) → histórico do dashboard
```

Decisões importantes:

- **Score separado da IA**: o número é auditável, testável, instantâneo e grátis.
  A IA interpreta a entrada e redige a explicação — nunca inventa o ranking.
- **`PropertiesRepository` é uma abstração**: hoje lê a base seed no Postgres;
  para plugar uma API real de imóveis basta criar outra implementação da classe
  e trocar o provider em `properties.module.ts`.
- **Degradação graciosa da IA**: timeout, 429 (cota estourada) ou resposta
  malformada caem no motor local — o usuário nunca vê um erro 500 por causa da
  OpenAI. O campo `aiProvider` de cada busca registra qual motor respondeu.
- **Sessão**: access token JWT de 15 min (só em memória no browser) + refresh
  token opaco rotativo de 7 dias em cookie httpOnly, hasheado (SHA-256) no banco.
- **Custos protegidos**: rate limit global 60 req/min, 10 buscas/min por IP
  (cada busca pode disparar 2 chamadas de IA), input limitado a 500 caracteres.

## Como rodar localmente

Pré-requisitos: **Node 18+**, **Docker** (ou um PostgreSQL 16 local).

### 1. Banco de dados

```bash
docker compose up -d          # sobe o Postgres em localhost:5432 (user/senha/db: spotly)
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # ajuste se necessário (ver variáveis abaixo)
npm install
npm run start:dev             # sobe a API em http://localhost:3001/api
                              # (as tabelas são criadas automaticamente na 1ª subida)
```

Em outro terminal, popule a base de imóveis:

```bash
cd backend
npm run db:seed               # 28 imóveis comerciais reais(istas) de São Paulo
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # abre http://localhost:3000
```

### 4. Testar

Abra `http://localhost:3000` e busque, por exemplo:

> quero abrir uma academia em Pinheiros, pagando até 10 mil de aluguel

## Variáveis de ambiente

### `backend/.env`

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://spotly:spotly@localhost:5432/spotly` (default do docker-compose) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | Troque por valores longos e aleatórios em produção |
| `JWT_ACCESS_TTL` | — | Validade do access token (default `15m`) |
| `JWT_REFRESH_TTL_DAYS` | — | Validade do refresh token (default `7`) |
| `OPENAI_API_KEY` | — | **Opcional.** Sem ela, roda em "modo demo" com o motor determinístico. Com ela, GPT-4o assume extração + prós/contras |
| `OPENAI_MODEL` | — | Default `gpt-4o` |
| `PORT` | — | Default `3001` |
| `CORS_ORIGIN` | — | Default `http://localhost:3000` |

### `frontend/.env.local`

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | URL da API (default `http://localhost:3001`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | — | **Opcional.** Com token → Mapbox GL (`light-v11`). Sem token → MapLibre GL com tiles OSM gratuitos (OpenFreeMap), sem cadastro |

## Estrutura

```
spotly/
├── docker-compose.yml         # PostgreSQL 16
├── backend/
│   └── src/
│       ├── ai/                # OpenAiService + FallbackAiService + fachada AiService
│       ├── scoring/           # motor de compatibilidade 0–100
│       ├── search/            # orquestração do fluxo core
│       ├── auth/              # JWT + refresh rotativo em cookie httpOnly
│       ├── users/             # perfil + dashboard (stats/histórico)
│       ├── properties/        # abstração de acesso a imóveis (trocável por API real)
│       ├── database/          # entities TypeORM + seed de São Paulo
│       └── common/            # catálogo de tipos de negócio (keywords + pesos)
└── frontend/
    └── src/
        ├── app/               # landing, resultados/[id], dashboard, login, cadastro
        ├── components/        # PropertyCard, ScoreRing, MapPanel, Sidebar, TopNav…
        └── lib/               # api client (refresh silencioso), auth context, tipos
```

## Próximos passos sugeridos

1. Integração com uma API real de imóveis (implementar `PropertiesRepository`).
2. Dados urbanos reais (fluxo/concorrência) via provedores de mobilidade + Places.
3. Imóveis salvos/favoritos (a UI da sidebar já reserva o espaço).
4. Migrations TypeORM no lugar de `synchronize` antes de ir a produção.
5. Cache de extração (frases idênticas não precisam chamar a OpenAI de novo).

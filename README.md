# Spotly AI

Plataforma que ajuda empreendedores a encontrar o ponto comercial ideal para alugar.
O usuário descreve o que precisa em linguagem natural — *"quero abrir uma academia em
Pinheiros, pagando até 10 mil de aluguel"* — e a IA interpreta a frase, cruza com a
base de imóveis, calcula uma **compatibilidade 0–100%** por imóvel e explica em
português os **prós e contras** de cada ponto, com mapa interativo e cards rankeados.

Visual implementado fielmente a partir do design system **Coral Energy** (Google Stitch).

## Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Busca** (`/`) | Campo único em linguagem natural — sem formulário de filtros |
| **Resultados** (`/resultados/[id]`) | Cards rankeados por compatibilidade, com prós/contras da IA, detalhamento do score e mapa interativo sincronizado |
| **Sensor de Valorização** (`/valorizacao`) | Bairros de SP ranqueados por potencial de valorização, a partir de obras de infraestrutura reais (metrô, saúde, educação) com fonte citada |
| **Imóveis Salvos** (`/salvos`) | Favoritar imóveis durante a busca e revisitar depois |
| **Dashboard** (`/dashboard`) | Estatísticas de uso, histórico de buscas e gráficos (compatibilidade média por tipo de negócio, bairros mais pesquisados) |

Autenticação por e-mail/senha; a busca também funciona para visitantes não logados.

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Frontend  | Next.js 14 (App Router) · TypeScript · Tailwind (tokens do DESIGN.md) · react-map-gl (Mapbox GL ou MapLibre) |
| Backend   | NestJS · TypeScript · TypeORM · arquitetura modular (`ai`, `scoring`, `search`, `auth`, `users`, `properties`, `appreciation`) |
| Banco     | PostgreSQL 16 |
| IA        | OpenAI GPT-4o (extração de variáveis + prós/contras) com **fallback determinístico** — o produto funciona de ponta a ponta sem chave |
| Integrações opcionais | Pexels (fotos reais dos imóveis no seed) · portal de dados abertos do Metrô-SP (confirmação de estações) |

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
   │                             × fator de proximidade do bairro pedido
   ▼
AiService.generateProsCons()   → UMA chamada batch p/ os top 8 (custo ~1/8 de N chamadas)
   ▼
Persistência (Search + SearchResult) → histórico do dashboard
```

Decisões importantes:

- **Score separado da IA**: o número é auditável, testável, instantâneo e grátis.
  A IA interpreta a entrada e redige a explicação — nunca inventa o ranking.
- **Proximidade é multiplicativa, não mais um critério**: os cinco critérios com
  pesos por tipo de negócio somam o score bruto; a distância até o bairro pedido
  entra depois como fator em `[0.4, 1.0]`. Assim ela afeta **todos** os tipos de
  negócio igualmente, e um imóvel a 20km nunca vence um equivalente ao lado só
  por ter bons fundamentos. `sp-locations.ts` é a fonte única de bairros —
  cadastrar um bairro lá o torna reconhecível na extração *e* no cálculo de
  distância de uma vez só.
- **`PropertiesRepository` é uma abstração**: hoje lê a base seed no Postgres;
  para plugar uma API real de imóveis basta criar outra implementação da classe
  e trocar o provider em `properties.module.ts`.
- **Degradação graciosa em toda integração externa**: OpenAI, Pexels e o portal
  do Metrô seguem o mesmo padrão — se a chamada falhar (timeout, 429, resposta
  malformada, chave ausente), o sistema cai num caminho local em vez de quebrar.
  O campo `aiProvider` de cada busca registra qual motor respondeu.
- **Sessão**: access token JWT de 15 min (só em memória no browser) + refresh
  token opaco rotativo de 7 dias em cookie httpOnly, hasheado (SHA-256) no banco.
- **Custos protegidos**: rate limit global 60 req/min, 10 buscas/min por IP
  (cada busca pode disparar 2 chamadas de IA), input limitado a 500 caracteres.

## Sensor de Valorização — de onde vêm os dados

O indicador cruza projetos de infraestrutura urbana com os bairros da base e
calcula, por decaimento com a distância, um score relativo de valorização.

A origem dos dados é **híbrida, por necessidade**: nenhum portal público de São
Paulo expõe hoje uma API estruturada de obras *planejadas* por bairro — GeoSampa
serve camadas GIS (WFS/shapefile) de infraestrutura já existente, o portal do
Metrô publica expansão só em relatórios PDF, e CNES/INEP registram apenas
unidades em operação. Então:

- **Base curada** (`common/urban-projects.ts`): ~20 projetos reais verificados um
  a um (estações das Linhas 6-Laranja, 17-Ouro e 15-Prata, UPAs/UBSs, CEUs e
  escolas), cada um com `sourceUrl` apontando para a prefeitura, o Metrô ou
  veículo de imprensa — os links ficam clicáveis na própria tela.
- **Confirmação ao vivo** (`appreciation/metro-stations.ts`): consulta o portal
  de dados abertos do Metrô-SP e marca com um selo as estações que constam na
  lista oficial atual. Se a chamada falhar, o selo some e o resto continua igual.

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
npm run db:seed               # 30 imóveis comerciais reais(istas) de São Paulo
```

> Com `PEXELS_API_KEY` preenchida, o seed baixa fotos reais por tipo de imóvel
> (5 chamadas no total). Sem a chave, usa placeholders — o seed não quebra.

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
| `PEXELS_API_KEY` | — | **Opcional.** Fotos reais dos imóveis no seed. Chave gratuita e instantânea em pexels.com/api |
| `PORT` | — | Default `3001` |
| `CORS_ORIGIN` | — | Lista separada por vírgula. Default `http://localhost:3000` |

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
│       ├── appreciation/      # sensor de valorização + integração com o Metrô-SP
│       ├── auth/              # JWT + refresh rotativo em cookie httpOnly
│       ├── users/             # perfil, dashboard (stats/histórico) e imóveis salvos
│       ├── properties/        # abstração de acesso a imóveis (trocável por API real)
│       ├── database/          # entities TypeORM + seed de São Paulo + fotos (Pexels)
│       └── common/            # tipos de negócio, bairros de SP, projetos urbanos
└── frontend/
    └── src/
        ├── app/               # landing, resultados/[id], valorizacao, salvos, dashboard, login, cadastro
        ├── components/        # PropertyCard, ScoreRing, MapPanel, AppreciationMap, DashboardCharts, Sidebar…
        └── lib/               # api client (refresh silencioso), auth context, tipos
```

## Escopo

Projeto acadêmico (TCC). A base de imóveis é uma amostra curada de 30 pontos
comerciais de São Paulo, não uma integração com portal imobiliário real — mas a
camada de acesso a dados já foi desenhada para essa troca (ver
`PropertiesRepository` acima).

## Próximos passos sugeridos

1. Integração com uma API real de imóveis (implementar `PropertiesRepository`).
2. Dados urbanos reais (fluxo/concorrência) via provedores de mobilidade + Places.
3. Preferências de busca salvas por usuário (tipo de negócio, bairro e orçamento padrão).
4. Migrations TypeORM no lugar de `synchronize` antes de ir a produção.
5. Cache de extração (frases idênticas não precisam chamar a OpenAI de novo).
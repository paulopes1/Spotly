/**
 * Base curada de projetos de infraestrutura urbana de São Paulo (metrô/trem,
 * saúde e educação) usada pelo indicador de valorização por região.
 *
 * Por quê curada em vez de puxada de uma API ao vivo: pesquisamos as fontes
 * de dados abertos reais de SP (GeoSampa, portal de transparência do Metrô,
 * dados.prefeitura.sp.gov.br, CNES/INEP) e nenhuma expõe uma lista
 * estruturada e atualizada de obras PLANEJADAS/em andamento por bairro —
 * só infraestrutura já existente, relatórios em PDF, ou exigem parsing de
 * GIS (WFS/shapefile) sem sequer garantir o campo "planejado". Ver
 * metro-stations.service.ts para a parte que É consumida de uma API real.
 *
 * Cada item foi verificado contra uma fonte pública real (prefeitura,
 * Metrô/CPTM ou veículo de notícia estabelecido) — o link fica em
 * `sourceUrl` para checagem/citação (inclusive na banca do TCC).
 * Coordenadas são aproximações em nível de bairro/endereço, não
 * geocodificação de precisão — suficiente para o indicador, não para uso
 * cadastral.
 */

export type UrbanProjectType = 'metro' | 'hospital' | 'escola';
export type UrbanProjectStatus = 'em_obras' | 'planejado' | 'recem_inaugurado';

export interface UrbanProject {
  id: string;
  name: string;
  type: UrbanProjectType;
  /** Bairro/região mais próxima — só para exibição, o score usa lat/lng. */
  neighborhood: string;
  lat: number;
  lng: number;
  status: UrbanProjectStatus;
  year: number;
  description: string;
  sourceName: string;
  sourceUrl: string;
}

export const URBAN_PROJECTS: UrbanProject[] = [
  // ── Metrô / trem ──────────────────────────────────────────────────
  {
    id: 'metro-perdizes-l6',
    name: 'Estação Perdizes (Linha 6-Laranja)',
    type: 'metro',
    neighborhood: 'Perdizes',
    lat: -23.534,
    lng: -46.678,
    status: 'recem_inaugurado',
    year: 2026,
    description:
      'Uma das seis estações da Linha 6-Laranja que entraram em operação assistida (gratuita, horário limitado) em 3 de julho de 2026, após cerca de uma década de obras.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2026/07/02/linha-6-laranja-primeira-etapa/',
  },
  {
    id: 'metro-sesc-pompeia-l6',
    name: 'Estação Sesc-Pompeia (Linha 6-Laranja)',
    type: 'metro',
    neighborhood: 'Pompeia',
    lat: -23.527,
    lng: -46.683,
    status: 'recem_inaugurado',
    year: 2026,
    description: 'Nova estação da Linha 6-Laranja servindo a Pompeia, aberta no primeiro trecho operacional em 3 de julho de 2026.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2026/07/02/linha-6-laranja-primeira-etapa/',
  },
  {
    id: 'metro-agua-branca-l6',
    name: 'Estação Água Branca (Linha 6-Laranja)',
    type: 'metro',
    neighborhood: 'Água Branca',
    lat: -23.524,
    lng: -46.666,
    status: 'recem_inaugurado',
    year: 2026,
    description:
      'Estação da Linha 6-Laranja na Água Branca, uma das seis primeiras abertas em julho de 2026 (havia atingido 97% de conclusão das obras, a mais avançada da linha).',
    sourceName: 'Exame',
    sourceUrl: 'https://exame.com/brasil/linha-6-laranja-atinge-80-das-obras-e-deve-iniciar-operacao-em-2026/',
  },
  {
    id: 'metro-higienopolis-l6',
    name: 'Estação Higienópolis-Mackenzie (Linha 6-Laranja)',
    type: 'metro',
    neighborhood: 'Higienópolis',
    lat: -23.543,
    lng: -46.657,
    status: 'em_obras',
    year: 2027,
    description:
      'Estação do trecho central da Linha 6-Laranja, parte da segunda fase de entrega prevista para 2027, com conexão à Universidade Mackenzie.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2025/07/18/estacoes-da-linha-6-laranja-metro-sao-paulo/',
  },
  {
    id: 'metro-morumbi-l17',
    name: 'Estação Morumbi (Linha 17-Ouro)',
    type: 'metro',
    neighborhood: 'Morumbi',
    lat: -23.605,
    lng: -46.698,
    status: 'recem_inaugurado',
    year: 2026,
    description:
      'Estação do monotrilho que integra a Linha 17-Ouro à Linha 9-Esmeralda da CPTM, aberta no primeiro trecho comercial em 31 de março de 2026.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2026/03/27/inauguracao-linha-17-ouro-monotrilho-congonhas/',
  },
  {
    id: 'metro-brooklin-l17',
    name: 'Estação Brooklin Paulista (Linha 17-Ouro)',
    type: 'metro',
    neighborhood: 'Brooklin',
    lat: -23.615,
    lng: -46.687,
    status: 'recem_inaugurado',
    year: 2026,
    description: 'Estação do monotrilho Linha 17-Ouro servindo o Brooklin, aberta em 31 de março de 2026, ligando o bairro em direção ao Aeroporto de Congonhas.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2026/03/27/inauguracao-linha-17-ouro-monotrilho-congonhas/',
  },
  {
    id: 'metro-vila-cordeiro-l17',
    name: 'Estação Vila Cordeiro (Linha 17-Ouro)',
    type: 'metro',
    neighborhood: 'Itaim Bibi',
    lat: -23.608,
    lng: -46.679,
    status: 'recem_inaugurado',
    year: 2026,
    description: 'Estação do monotrilho Linha 17-Ouro próxima ao Itaim Bibi/Vila Cordeiro, parte do trecho inaugurado em 31 de março de 2026.',
    sourceName: 'Mobilidade360',
    sourceUrl: 'https://mobilidade360.com.br/2026/03/27/inauguracao-linha-17-ouro-monotrilho-congonhas/',
  },
  {
    id: 'metro-ipiranga-l15',
    name: 'Estação Ipiranga (Linha 15-Prata)',
    type: 'metro',
    neighborhood: 'Ipiranga',
    lat: -23.592,
    lng: -46.602,
    status: 'em_obras',
    year: 2027,
    description:
      'Nova estação do monotrilho CPTM/Metrô em obras como parte da extensão da Linha 15-Prata em direção ao Jacu-Pêssego, com abertura prevista para 2027.',
    sourceName: 'Metrô CPTM',
    sourceUrl: 'https://www.metrocptm.com.br/estacao-ipiranga-da-linha-15-prata-ganha-primeiras-colunas/',
  },

  // ── Saúde ─────────────────────────────────────────────────────────
  {
    id: 'saude-upa-lapa',
    name: 'UPA Lapa (Vila Hamburguesa)',
    type: 'hospital',
    neighborhood: 'Lapa',
    lat: -23.528,
    lng: -46.715,
    status: 'recem_inaugurado',
    year: 2025,
    description: '33ª Unidade de Pronto Atendimento da cidade, unidade de emergência 24h de R$31 milhões inaugurada em 28 de janeiro de 2025 na Vila Hamburguesa.',
    sourceName: 'Prefeitura de São Paulo',
    sourceUrl: 'https://prefeitura.sp.gov.br/w/na-lapa-prefeitura-inaugura-33%C2%AA-upa-da-cidade-com-investimento-de-r-31-milh%C3%B5es',
  },
  {
    id: 'saude-upa-sacoma',
    name: 'UPA Dr. Augusto Gomes de Mattos',
    type: 'hospital',
    neighborhood: 'Ipiranga',
    lat: -23.605,
    lng: -46.607,
    status: 'recem_inaugurado',
    year: 2025,
    description: '34ª UPA da cidade, unidade de emergência 24h reformada no Sacomã com capacidade para ~21 mil atendimentos/mês, inaugurada por volta de 15 de abril de 2025.',
    sourceName: 'Prefeitura de São Paulo (Subprefeitura Ipiranga)',
    sourceUrl:
      'https://prefeitura.sp.gov.br/web/ipiranga/w/nova-upa-%C3%A9-inaugurada-na-regi%C3%A3o-do-ipiranga-e-poder%C3%A1-realizar-at%C3%A9-21-mil-atendimentos-por-m%C3%AAs',
  },
  {
    id: 'saude-ubs-vila-arriete',
    name: 'UBS Vila Arriete',
    type: 'hospital',
    neighborhood: 'Santo Amaro',
    lat: -23.666,
    lng: -46.702,
    status: 'recem_inaugurado',
    year: 2025,
    description: 'UBS reconstruída na Av. Nossa Senhora do Sabará, quadruplicando a capacidade para 7.370 atendimentos/mês, inaugurada em 8 de abril de 2025.',
    sourceName: 'Prefeitura de São Paulo (Subprefeitura Santo Amaro)',
    sourceUrl:
      'https://prefeitura.sp.gov.br/web/santo_amaro/w/nova-ubs-vila-arriete-%C3%A9-inaugurada-com-estrutura-ampliada-e-mais-atendimentos-para-a-popula%C3%A7%C3%A3o',
  },
  {
    id: 'saude-ubs-helena-rezek',
    name: 'UBS Helena Miguel Rezek',
    type: 'hospital',
    neighborhood: 'Butantã',
    lat: -23.598,
    lng: -46.77,
    status: 'recem_inaugurado',
    year: 2026,
    description: '482ª UBS da cidade, construída para atender o novo polo habitacional Reserva Raposo (~80 mil moradores) no Butantã, inaugurada em 12 de maio de 2026.',
    sourceName: 'Prefeitura de São Paulo (Secretaria Municipal da Saúde)',
    sourceUrl:
      'https://prefeitura.sp.gov.br/web/saude/w/prefeitura-entrega-ubs-helena-miguel-rezek-para-atender-novo-polo-habitacional-no-butant%C3%A3',
  },
  {
    id: 'saude-ubs-vila-joaniza',
    name: 'UBS Vila Joaniza',
    type: 'hospital',
    neighborhood: 'Cidade Ademar',
    lat: -23.68,
    lng: -46.67,
    status: 'recem_inaugurado',
    year: 2026,
    description: 'Nova UBS cerca de 7x maior que a anterior (1.740 m²), inaugurada em 2 de junho de 2026 na Cidade Ademar, zona sul.',
    sourceName: 'Grupo Sul News',
    sourceUrl: 'https://gruposulnews.com.br/prefeitura-entrega-nova-ubs-vila-joaniza-na-zona-sul-mais-moderna-e-com-estrutura-7-vezes-maior/',
  },
  {
    id: 'saude-hm-saboya',
    name: 'Hospital Municipal Dr. Arthur Ribeiro de Saboya (ampliação)',
    type: 'hospital',
    neighborhood: 'Jabaquara',
    lat: -23.646,
    lng: -46.643,
    status: 'em_obras',
    year: 2025,
    description:
      'Reforma/ampliação de R$46,5 milhões (programa Avança Saúde SP II) adicionando leitos e modernizando emergência/UTI — obras iniciadas em maio de 2024 com conclusão prevista para fim de 2025.',
    sourceName: 'Câmara Municipal de São Paulo',
    sourceUrl: 'https://www.saopaulo.sp.leg.br/blog/camara-de-sp-participa-de-assinatura-para-inicio-de-obras-em-quatro-hospitais-da-cidade/',
  },
  {
    id: 'saude-hm-hungria',
    name: 'Hospital Municipal Dr. José Soares Hungria (ampliação)',
    type: 'hospital',
    neighborhood: 'Pirituba',
    lat: -23.488,
    lng: -46.71,
    status: 'em_obras',
    year: 2025,
    description:
      'Reforma de R$46,9 milhões adicionando leitos e modernizando capacidade cirúrgica/imagem no programa Avança Saúde SP II, obras iniciadas em maio de 2024.',
    sourceName: 'Prefeitura de São Paulo',
    sourceUrl:
      'https://prefeitura.sp.gov.br/w/prefeitura-anuncia-investimento-de-r-207-milh%C3%B5es-para-abrir-259-leitos-e-fazer-grandes-reformas-em-quatro-hospitais-municipais',
  },
  {
    id: 'saude-hm-montenegro',
    name: 'Hospital Municipal Dr. Benedicto Montenegro (novo complexo)',
    type: 'hospital',
    neighborhood: 'Sapopemba',
    lat: -23.586,
    lng: -46.503,
    status: 'em_obras',
    year: 2027,
    description:
      'Modernização de R$318 milhões ampliando a capacidade de 69 para 312 leitos, mais uma nova UPA 24h anexa, com conclusão prevista para o segundo semestre de 2027.',
    sourceName: 'Prefeitura de São Paulo',
    sourceUrl: 'https://prefeitura.sp.gov.br/w/prefeitura-investe-mais-de-r-318-milh%C3%B5es-em-novo-complexo-de-sa%C3%BAde-em-sapopemba',
  },

  // ── Educação ──────────────────────────────────────────────────────
  {
    id: 'edu-emei-antonio-ermirio',
    name: 'EMEI Antônio Ermírio de Moraes',
    type: 'escola',
    neighborhood: 'Jardim Helena',
    lat: -23.495,
    lng: -46.47,
    status: 'recem_inaugurado',
    year: 2026,
    description:
      'Escola municipal de educação infantil em tempo integral (225 crianças, 4-5 anos) com painéis solares e reaproveitamento de água da chuva, inaugurada em 20 de julho de 2026.',
    sourceName: 'Itaquera em Notícias',
    sourceUrl: 'https://itaqueraemnoticias.com.br/noticia/169219/prefeitura-inaugura-escola-no-jardim-helena-e-marca-retorno-de-mais-1-milhao-alunos',
  },
  {
    id: 'edu-ceu-padre-chicao',
    name: 'CEU Padre Chicão (com EMEF Magda Becker Soares)',
    type: 'escola',
    neighborhood: 'Grajaú',
    lat: -23.745,
    lng: -46.698,
    status: 'recem_inaugurado',
    year: 2026,
    description:
      '63º CEU (Centro Educacional Unificado) da cidade, complexo de 15.000 m² com EMEF de tempo integral, inaugurado em 4 de fevereiro de 2026 em novo conjunto habitacional do Grajaú.',
    sourceName: 'Prefeitura de São Paulo',
    sourceUrl: 'https://prefeitura.sp.gov.br/w/prefeitura-inaugura-63%C2%BA-ceu-da-cidade-e-emef-em-hor%C3%A1rio-integral-em-futuro-conjunto-habitacional-no-graja%C3%BA',
  },
  {
    id: 'edu-ceu-papa-francisco',
    name: 'CEU Papa Francisco (com EMEF Marina Colasanti)',
    type: 'escola',
    neighborhood: 'Sapopemba',
    lat: -23.587,
    lng: -46.501,
    status: 'recem_inaugurado',
    year: 2025,
    description: '60º CEU da cidade, complexo de educação/cultura/esporte em PPP atendendo ~7 mil pessoas/dia, inaugurado em 4 de julho de 2025 em Sapopemba.',
    sourceName: 'Secretaria Municipal de Educação (SME-SP)',
    sourceUrl: 'https://educacao.sme.prefeitura.sp.gov.br/noticias/prefeitura-de-sp-inaugura-novo-ceu-com-capacidade-para-atender-quase-7-mil-pessoas-na-zona-leste/',
  },
  {
    id: 'edu-cei-maria-beatriz',
    name: 'Centro de Educação Infantil (CEI) Maria Beatriz Nascimento',
    type: 'escola',
    neighborhood: 'Tremembé',
    lat: -23.468,
    lng: -46.628,
    status: 'recem_inaugurado',
    year: 2025,
    description:
      'Novo centro de educação infantil de mais de 1.000 m² para ~200 crianças (0-3 anos), com painéis solares e reúso de água, inaugurado em 31 de março de 2025 em Vila Mazzei/Tremembé.',
    sourceName: 'Prefeitura de São Paulo (Secretaria Municipal de Infraestrutura e Obras)',
    sourceUrl: 'https://prefeitura.sp.gov.br/web/obras/w/prefeitura-inaugura-o-centro-de-educacao-infantil-maria-beatriz-nascimento-na-zona-norte',
  },
];

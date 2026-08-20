/**
 * Base seed de imóveis comerciais para locação em São Paulo.
 *
 * Dados mockados mas realistas: coordenadas verdadeiras dos bairros, aluguéis
 * compatíveis com o mercado e índices urbanos coerentes (ex.: Largo da Batata
 * tem fluxo altíssimo e renda média; Oscar Freire tem renda altíssima e fluxo
 * médio). Para trocar por uma API real de imóveis, basta materializar as
 * mesmas colunas a partir do provedor externo — ver PropertiesRepository.
 */

export interface SeedProperty {
  title: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  rentPrice: number;
  areaM2: number;
  propertyType: string;
  description: string;
  footTraffic: number;
  avgIncomeIndex: number;
  competitorCounts: Record<string, number>;
  anchors: string[];
}

export const SEED_PROPERTIES: SeedProperty[] = [
  // ── Pinheiros ───────────────────────────────────────────────────
  {
    title: 'Loja ampla no Largo da Batata',
    address: 'R. Butantã, 120 — Pinheiros',
    neighborhood: 'Pinheiros',
    lat: -23.5665, lng: -46.6939,
    rentPrice: 9500, areaM2: 180, propertyType: 'loja_rua',
    description: 'Salão livre com pé-direito alto, vitrine de 8m e acesso direto à saída do metrô.',
    footTraffic: 95, avgIncomeIndex: 68,
    competitorCounts: { academia: 2, cafeteria: 9, restaurante: 14, bar: 11, loja_roupas: 6, farmacia: 3, salao_beleza: 4, petshop: 1, coworking: 3, padaria: 2, mercado: 2, clinica: 2 },
    anchors: ['Metrô Faria Lima', 'Largo da Batata', 'Teatro Tucarena'],
  },
  {
    title: 'Galpão adaptável na Rua dos Pinheiros',
    address: 'R. dos Pinheiros, 870 — Pinheiros',
    neighborhood: 'Pinheiros',
    lat: -23.5658, lng: -46.6822,
    rentPrice: 14000, areaM2: 420, propertyType: 'galpao',
    description: 'Antigo depósito com estrutura para reforço de piso, ideal para academia ou dark kitchen.',
    footTraffic: 78, avgIncomeIndex: 74,
    competitorCounts: { academia: 3, cafeteria: 12, restaurante: 22, bar: 9, loja_roupas: 8, farmacia: 4, salao_beleza: 6, petshop: 2, coworking: 4, padaria: 3, mercado: 3, clinica: 5 },
    anchors: ['Metrô Fradique Coutinho', 'Mercado de Pinheiros'],
  },
  {
    title: 'Casa comercial na Fradique Coutinho',
    address: 'R. Fradique Coutinho, 450 — Pinheiros',
    neighborhood: 'Pinheiros',
    lat: -23.5621, lng: -46.6878,
    rentPrice: 8200, areaM2: 140, propertyType: 'casa_comercial',
    description: 'Sobrado reformado com quintal, vocação para gastronomia ou estúdio boutique.',
    footTraffic: 72, avgIncomeIndex: 76,
    competitorCounts: { academia: 1, cafeteria: 10, restaurante: 18, bar: 12, loja_roupas: 7, farmacia: 2, salao_beleza: 5, petshop: 2, coworking: 2, padaria: 2, mercado: 1, clinica: 3 },
    anchors: ['Metrô Fradique Coutinho', 'Praça Benedito Calixto'],
  },
  {
    title: 'Loja de esquina na Teodoro Sampaio',
    address: 'R. Teodoro Sampaio, 1980 — Pinheiros',
    neighborhood: 'Pinheiros',
    lat: -23.5602, lng: -46.6944,
    rentPrice: 6800, areaM2: 95, propertyType: 'loja_rua',
    description: 'Esquina movimentada no polo de comércio musical e médico, vitrine dupla.',
    footTraffic: 88, avgIncomeIndex: 62,
    competitorCounts: { academia: 2, cafeteria: 6, restaurante: 9, bar: 4, loja_roupas: 11, farmacia: 5, salao_beleza: 7, petshop: 1, coworking: 1, padaria: 3, mercado: 2, clinica: 8 },
    anchors: ['Hospital das Clínicas', 'Metrô Clínicas', 'Comércio Teodoro Sampaio'],
  },
  {
    title: 'Sala comercial vista Faria Lima',
    address: 'Av. Brig. Faria Lima, 1461 — Pinheiros',
    neighborhood: 'Pinheiros',
    lat: -23.5741, lng: -46.6891,
    rentPrice: 12500, areaM2: 110, propertyType: 'sala_comercial',
    description: 'Andar alto em edifício corporativo AAA, ideal para clínica premium ou coworking.',
    footTraffic: 70, avgIncomeIndex: 92,
    competitorCounts: { academia: 3, cafeteria: 14, restaurante: 16, bar: 5, loja_roupas: 4, farmacia: 3, salao_beleza: 3, petshop: 0, coworking: 6, padaria: 1, mercado: 1, clinica: 6 },
    anchors: ['Shopping Iguatemi', 'Metrô Faria Lima', 'Parque do Povo'],
  },

  // ── Vila Madalena ───────────────────────────────────────────────
  {
    title: 'Loja charmosa na Harmonia',
    address: 'R. Harmonia, 277 — Vila Madalena',
    neighborhood: 'Vila Madalena',
    lat: -23.5535, lng: -46.6903,
    rentPrice: 7200, areaM2: 85, propertyType: 'loja_rua',
    description: 'Fachada de vidro em rua de bares e ateliês, público jovem e criativo.',
    footTraffic: 80, avgIncomeIndex: 71,
    competitorCounts: { academia: 1, cafeteria: 11, restaurante: 15, bar: 18, loja_roupas: 9, farmacia: 1, salao_beleza: 4, petshop: 1, coworking: 3, padaria: 1, mercado: 1, clinica: 1 },
    anchors: ['Beco do Batman', 'Praça Pôr do Sol'],
  },
  {
    title: 'Sobrado comercial na Wisard',
    address: 'R. Wisard, 500 — Vila Madalena',
    neighborhood: 'Vila Madalena',
    lat: -23.5556, lng: -46.6889,
    rentPrice: 10500, areaM2: 210, propertyType: 'casa_comercial',
    description: 'Três pavimentos com terraço, licença prévia para funcionamento noturno.',
    footTraffic: 76, avgIncomeIndex: 73,
    competitorCounts: { academia: 2, cafeteria: 9, restaurante: 13, bar: 16, loja_roupas: 7, farmacia: 1, salao_beleza: 3, petshop: 1, coworking: 2, padaria: 1, mercado: 1, clinica: 1 },
    anchors: ['Beco do Batman', 'Metrô Vila Madalena'],
  },
  {
    title: 'Espaço térreo próximo ao metrô',
    address: 'R. Heitor Penteado, 1200 — Vila Madalena',
    neighborhood: 'Vila Madalena',
    lat: -23.5468, lng: -46.6926,
    rentPrice: 5400, areaM2: 120, propertyType: 'loja_rua',
    description: 'Salão retangular sem colunas a 200m do metrô, estacionamento conveniado.',
    footTraffic: 82, avgIncomeIndex: 64,
    competitorCounts: { academia: 2, cafeteria: 5, restaurante: 8, bar: 6, loja_roupas: 4, farmacia: 3, salao_beleza: 5, petshop: 2, coworking: 1, padaria: 2, mercado: 2, clinica: 2 },
    anchors: ['Metrô Vila Madalena', 'Terminal de ônibus Vila Madalena'],
  },

  // ── Jardins ─────────────────────────────────────────────────────
  {
    title: 'Flagship na Oscar Freire',
    address: 'R. Oscar Freire, 725 — Jardins',
    neighborhood: 'Jardins',
    lat: -23.5622, lng: -46.6693,
    rentPrice: 28000, areaM2: 160, propertyType: 'loja_rua',
    description: 'Endereço de luxo com vitrine dupla na rua mais valorizada do varejo nacional.',
    footTraffic: 74, avgIncomeIndex: 98,
    competitorCounts: { academia: 1, cafeteria: 13, restaurante: 17, bar: 6, loja_roupas: 24, farmacia: 2, salao_beleza: 8, petshop: 1, coworking: 2, padaria: 1, mercado: 1, clinica: 7 },
    anchors: ['Oscar Freire', 'Metrô Oscar Freire'],
  },
  {
    title: 'Sala para clínica na Al. Santos',
    address: 'Al. Santos, 2100 — Jardins',
    neighborhood: 'Jardins',
    lat: -23.5679, lng: -46.6595,
    rentPrice: 9800, areaM2: 130, propertyType: 'sala_comercial',
    description: 'Conjunto com recepção pronta e 4 salas, prédio com gerador e vaga para clientes.',
    footTraffic: 60, avgIncomeIndex: 94,
    competitorCounts: { academia: 2, cafeteria: 8, restaurante: 12, bar: 3, loja_roupas: 5, farmacia: 4, salao_beleza: 6, petshop: 1, coworking: 3, padaria: 1, mercado: 1, clinica: 11 },
    anchors: ['Parque Trianon', 'Metrô Trianon-Masp', 'Av. Paulista'],
  },
  {
    title: 'Loja na Alameda Lorena',
    address: 'Al. Lorena, 1500 — Jardins',
    neighborhood: 'Jardins',
    lat: -23.5648, lng: -46.6656,
    rentPrice: 15500, areaM2: 100, propertyType: 'loja_rua',
    description: 'Ponto consolidado de moda e beleza, público AB com alto tíquete médio.',
    footTraffic: 66, avgIncomeIndex: 96,
    competitorCounts: { academia: 1, cafeteria: 9, restaurante: 11, bar: 4, loja_roupas: 18, farmacia: 2, salao_beleza: 9, petshop: 1, coworking: 1, padaria: 1, mercado: 1, clinica: 5 },
    anchors: ['Oscar Freire', 'Shopping Cidade Jardim (linha de ônibus direta)'],
  },

  // ── Itaim Bibi ──────────────────────────────────────────────────
  {
    title: 'Térreo corporativo na João Cachoeira',
    address: 'R. João Cachoeira, 899 — Itaim Bibi',
    neighborhood: 'Itaim Bibi',
    lat: -23.5852, lng: -46.6773,
    rentPrice: 11800, areaM2: 150, propertyType: 'loja_rua',
    description: 'Loja de rua no eixo de escritórios, movimento intenso no almoço e happy hour.',
    footTraffic: 84, avgIncomeIndex: 90,
    competitorCounts: { academia: 4, cafeteria: 16, restaurante: 24, bar: 10, loja_roupas: 12, farmacia: 3, salao_beleza: 7, petshop: 2, coworking: 5, padaria: 2, mercado: 2, clinica: 4 },
    anchors: ['Av. Faria Lima', 'Av. Juscelino Kubitschek', 'Parque do Povo'],
  },
  {
    title: 'Andar livre para academia — Itaim',
    address: 'R. Pedroso Alvarenga, 1245 — Itaim Bibi',
    neighborhood: 'Itaim Bibi',
    lat: -23.5836, lng: -46.6742,
    rentPrice: 19500, areaM2: 520, propertyType: 'sala_comercial',
    description: 'Laje de 520m² com reforço estrutural e dois elevadores de serviço; vestiários prontos.',
    footTraffic: 68, avgIncomeIndex: 91,
    competitorCounts: { academia: 5, cafeteria: 12, restaurante: 19, bar: 8, loja_roupas: 9, farmacia: 2, salao_beleza: 5, petshop: 1, coworking: 4, padaria: 1, mercado: 2, clinica: 5 },
    anchors: ['Av. Faria Lima', 'Colégio Itaim'],
  },
  {
    title: 'Quiosque-loja na Horácio Lafer',
    address: 'R. Horácio Lafer, 160 — Itaim Bibi',
    neighborhood: 'Itaim Bibi',
    lat: -23.5878, lng: -46.6795,
    rentPrice: 4900, areaM2: 45, propertyType: 'loja_galeria',
    description: 'Espaço compacto em galeria com fluxo garantido de executivos, ideal para café ou grab-and-go.',
    footTraffic: 79, avgIncomeIndex: 89,
    competitorCounts: { academia: 2, cafeteria: 10, restaurante: 14, bar: 5, loja_roupas: 6, farmacia: 2, salao_beleza: 4, petshop: 1, coworking: 3, padaria: 1, mercado: 1, clinica: 3 },
    anchors: ['Av. Juscelino Kubitschek', 'Vila Olímpia (limite)'],
  },

  // ── Moema ───────────────────────────────────────────────────────
  {
    title: 'Loja família na Av. Lavandisca',
    address: 'Av. Lavandisca, 741 — Moema',
    neighborhood: 'Moema',
    lat: -23.6043, lng: -46.6674,
    rentPrice: 8900, areaM2: 170, propertyType: 'loja_rua',
    description: 'Bairro residencial de alto padrão, forte demanda por serviços de conveniência e saúde.',
    footTraffic: 64, avgIncomeIndex: 88,
    competitorCounts: { academia: 3, cafeteria: 7, restaurante: 13, bar: 5, loja_roupas: 8, farmacia: 4, salao_beleza: 8, petshop: 3, coworking: 1, padaria: 3, mercado: 2, clinica: 6 },
    anchors: ['Shopping Ibirapuera', 'Metrô Moema', 'Parque Ibirapuera'],
  },
  {
    title: 'Espaço térreo na Al. dos Maracatins',
    address: 'Al. dos Maracatins, 1120 — Moema',
    neighborhood: 'Moema',
    lat: -23.6079, lng: -46.6641,
    rentPrice: 6200, areaM2: 105, propertyType: 'loja_rua',
    description: 'Rua gastronômica de Moema, movimento noturno consistente durante a semana.',
    footTraffic: 71, avgIncomeIndex: 86,
    competitorCounts: { academia: 2, cafeteria: 6, restaurante: 19, bar: 9, loja_roupas: 5, farmacia: 2, salao_beleza: 5, petshop: 2, coworking: 1, padaria: 2, mercado: 1, clinica: 4 },
    anchors: ['Metrô Eucaliptos', 'Shopping Ibirapuera'],
  },

  // ── Vila Mariana ────────────────────────────────────────────────
  {
    title: 'Loja ao lado do metrô Ana Rosa',
    address: 'R. Domingos de Morais, 2100 — Vila Mariana',
    neighborhood: 'Vila Mariana',
    lat: -23.5814, lng: -46.6386,
    rentPrice: 7600, areaM2: 125, propertyType: 'loja_rua',
    description: 'Corredor de passagem entre dois metrôs, alto fluxo de estudantes e trabalhadores.',
    footTraffic: 91, avgIncomeIndex: 70,
    competitorCounts: { academia: 4, cafeteria: 8, restaurante: 12, bar: 6, loja_roupas: 9, farmacia: 5, salao_beleza: 6, petshop: 2, coworking: 2, padaria: 3, mercado: 3, clinica: 5 },
    anchors: ['Metrô Ana Rosa', 'Metrô Vila Mariana', 'ESPM'],
  },
  {
    title: 'Casa comercial próxima à ESPM',
    address: 'R. Joaquim Távora, 780 — Vila Mariana',
    neighborhood: 'Vila Mariana',
    lat: -23.5867, lng: -46.6413,
    rentPrice: 5800, areaM2: 160, propertyType: 'casa_comercial',
    description: 'Casa com 6 salas e jardim, vocação para escola, clínica ou estúdio fitness boutique.',
    footTraffic: 62, avgIncomeIndex: 75,
    competitorCounts: { academia: 2, cafeteria: 6, restaurante: 9, bar: 4, loja_roupas: 3, farmacia: 2, salao_beleza: 4, petshop: 2, coworking: 1, padaria: 2, mercado: 1, clinica: 4 },
    anchors: ['ESPM', 'Metrô Ana Rosa'],
  },

  // ── República / Centro ──────────────────────────────────────────
  {
    title: 'Loja de alto fluxo na Av. São João',
    address: 'Av. São João, 439 — República',
    neighborhood: 'República',
    lat: -23.5424, lng: -46.6394,
    rentPrice: 4200, areaM2: 140, propertyType: 'loja_rua',
    description: 'Fluxo massivo de pedestres no centro histórico; excelente custo por m².',
    footTraffic: 98, avgIncomeIndex: 42,
    competitorCounts: { academia: 3, cafeteria: 12, restaurante: 20, bar: 8, loja_roupas: 17, farmacia: 6, salao_beleza: 9, petshop: 1, coworking: 4, padaria: 4, mercado: 3, clinica: 5 },
    anchors: ['Metrô República', 'Theatro Municipal', 'Vale do Anhangabaú'],
  },
  {
    title: 'Sobreloja na Barão de Itapetininga',
    address: 'R. Barão de Itapetininga, 255 — República',
    neighborhood: 'República',
    lat: -23.5443, lng: -46.6421,
    rentPrice: 2900, areaM2: 90, propertyType: 'loja_galeria',
    description: 'Calçadão exclusivo de pedestres, aluguel acessível para operação enxuta.',
    footTraffic: 96, avgIncomeIndex: 40,
    competitorCounts: { academia: 2, cafeteria: 9, restaurante: 14, bar: 5, loja_roupas: 21, farmacia: 4, salao_beleza: 11, petshop: 0, coworking: 3, padaria: 3, mercado: 2, clinica: 4 },
    anchors: ['Metrô República', 'Praça Ramos de Azevedo'],
  },

  // ── Tatuapé ─────────────────────────────────────────────────────
  {
    title: 'Loja na R. Tuiuti com estacionamento',
    address: 'R. Tuiuti, 1800 — Tatuapé',
    neighborhood: 'Tatuapé',
    lat: -23.5386, lng: -46.5754,
    rentPrice: 5600, areaM2: 200, propertyType: 'loja_rua',
    description: 'Polo comercial da zona leste, 8 vagas próprias, público familiar consolidado.',
    footTraffic: 75, avgIncomeIndex: 66,
    competitorCounts: { academia: 3, cafeteria: 5, restaurante: 11, bar: 6, loja_roupas: 10, farmacia: 5, salao_beleza: 7, petshop: 3, coworking: 1, padaria: 4, mercado: 3, clinica: 5 },
    anchors: ['Shopping Metrô Tatuapé', 'Metrô Tatuapé'],
  },
  {
    title: 'Galpão para fitness na R. Cantagalo',
    address: 'R. Cantagalo, 950 — Tatuapé',
    neighborhood: 'Tatuapé',
    lat: -23.5421, lng: -46.5698,
    rentPrice: 9200, areaM2: 480, propertyType: 'galpao',
    description: 'Vão livre de 480m² com mezanino, pé-direito de 6m e fachada para avenida.',
    footTraffic: 58, avgIncomeIndex: 64,
    competitorCounts: { academia: 2, cafeteria: 4, restaurante: 8, bar: 4, loja_roupas: 6, farmacia: 3, salao_beleza: 5, petshop: 2, coworking: 1, padaria: 3, mercado: 2, clinica: 3 },
    anchors: ['Shopping Anália Franco (2km)', 'Praça Silvio Romero'],
  },

  // ── Santa Cecília / Higienópolis ────────────────────────────────
  {
    title: 'Loja gourmet na R. das Palmeiras',
    address: 'R. das Palmeiras, 210 — Santa Cecília',
    neighborhood: 'Santa Cecília',
    lat: -23.5399, lng: -46.6524,
    rentPrice: 6400, areaM2: 110, propertyType: 'loja_rua',
    description: 'Bairro em plena valorização gastronômica, público jovem-adulto de alto consumo.',
    footTraffic: 69, avgIncomeIndex: 72,
    competitorCounts: { academia: 1, cafeteria: 8, restaurante: 13, bar: 9, loja_roupas: 4, farmacia: 2, salao_beleza: 3, petshop: 1, coworking: 2, padaria: 2, mercado: 2, clinica: 2 },
    anchors: ['Metrô Santa Cecília', 'Shopping Pátio Higienópolis'],
  },
  {
    title: 'Sala em edifício médico — Higienópolis',
    address: 'Av. Higienópolis, 360 — Higienópolis',
    neighborhood: 'Higienópolis',
    lat: -23.5439, lng: -46.6572,
    rentPrice: 7800, areaM2: 95, propertyType: 'sala_comercial',
    description: 'Prédio com alvará de saúde, portaria 24h e público de renda alta no entorno.',
    footTraffic: 55, avgIncomeIndex: 93,
    competitorCounts: { academia: 2, cafeteria: 6, restaurante: 9, bar: 3, loja_roupas: 5, farmacia: 3, salao_beleza: 5, petshop: 1, coworking: 1, padaria: 2, mercado: 1, clinica: 9 },
    anchors: ['Shopping Pátio Higienópolis', 'Universidade Mackenzie'],
  },

  // ── Brooklin / Vila Olímpia ─────────────────────────────────────
  {
    title: 'Térreo em torre corporativa — Vila Olímpia',
    address: 'R. Gomes de Carvalho, 1510 — Vila Olímpia',
    neighborhood: 'Vila Olímpia',
    lat: -23.5955, lng: -46.6863,
    rentPrice: 13200, areaM2: 190, propertyType: 'loja_rua',
    description: 'Base de torre AAA com 4 mil funcionários no prédio; fluxo cativo de segunda a sexta.',
    footTraffic: 77, avgIncomeIndex: 87,
    competitorCounts: { academia: 3, cafeteria: 13, restaurante: 21, bar: 7, loja_roupas: 5, farmacia: 3, salao_beleza: 4, petshop: 1, coworking: 6, padaria: 1, mercado: 2, clinica: 3 },
    anchors: ['Shopping Vila Olímpia', 'Estação Vila Olímpia (CPTM)'],
  },
  {
    title: 'Loja de vizinhança no Brooklin',
    address: 'R. Barão do Triunfo, 640 — Brooklin',
    neighborhood: 'Brooklin',
    lat: -23.6142, lng: -46.6811,
    rentPrice: 5100, areaM2: 130, propertyType: 'loja_rua',
    description: 'Rua de comércio local com forte senso de comunidade; ótimo para pet, beleza e alimentação.',
    footTraffic: 61, avgIncomeIndex: 80,
    competitorCounts: { academia: 2, cafeteria: 5, restaurante: 10, bar: 5, loja_roupas: 4, farmacia: 3, salao_beleza: 6, petshop: 2, coworking: 1, padaria: 3, mercado: 2, clinica: 3 },
    anchors: ['Metrô Brooklin', 'Colégio Visconde de Porto Seguro'],
  },

  // ── Perdizes ────────────────────────────────────────────────────
  {
    title: 'Loja na R. Cardoso de Almeida',
    address: 'R. Cardoso de Almeida, 980 — Perdizes',
    neighborhood: 'Perdizes',
    lat: -23.5372, lng: -46.6721,
    rentPrice: 6900, areaM2: 115, propertyType: 'loja_rua',
    description: 'Entre a PUC e o Allianz Parque; mistura de estudantes e famílias de renda alta.',
    footTraffic: 73, avgIncomeIndex: 82,
    competitorCounts: { academia: 3, cafeteria: 9, restaurante: 12, bar: 8, loja_roupas: 5, farmacia: 3, salao_beleza: 5, petshop: 2, coworking: 1, padaria: 3, mercado: 2, clinica: 4 },
    anchors: ['PUC-SP', 'Allianz Parque', 'Shopping Bourbon'],
  },
  {
    title: 'Andar livre para estúdio — Perdizes',
    address: 'R. Monte Alegre, 428 — Perdizes',
    neighborhood: 'Perdizes',
    lat: -23.5405, lng: -46.6759,
    rentPrice: 8800, areaM2: 260, propertyType: 'sala_comercial',
    description: 'Segundo andar com entrada independente, piso reforçado e 6 vagas.',
    footTraffic: 59, avgIncomeIndex: 84,
    competitorCounts: { academia: 2, cafeteria: 7, restaurante: 9, bar: 5, loja_roupas: 3, farmacia: 2, salao_beleza: 4, petshop: 1, coworking: 2, padaria: 2, mercado: 1, clinica: 5 },
    anchors: ['PUC-SP', 'Shopping Bourbon'],
  },

  // ── Morumbi ─────────────────────────────────────────────────────
  {
    title: 'Loja em galeria no Shopping Morumbi',
    address: 'Av. Roque Petroni Júnior, 1089 — Morumbi',
    neighborhood: 'Morumbi',
    lat: -23.6228, lng: -46.7008,
    rentPrice: 16500, areaM2: 140, propertyType: 'loja_galeria',
    description: 'Galeria comercial anexa a um dos shoppings mais tradicionais da zona sul, fluxo de público AB.',
    footTraffic: 72, avgIncomeIndex: 90,
    competitorCounts: { academia: 2, cafeteria: 9, restaurante: 15, bar: 3, loja_roupas: 14, farmacia: 3, salao_beleza: 6, petshop: 1, coworking: 2, padaria: 1, mercado: 1, clinica: 4 },
    anchors: ['Shopping Morumbi', 'Hospital Albert Einstein'],
  },
  {
    title: 'Sala térrea na Giovanni Gronchi',
    address: 'Av. Giovanni Gronchi, 4200 — Morumbi',
    neighborhood: 'Morumbi',
    lat: -23.6015, lng: -46.7255,
    rentPrice: 9200, areaM2: 100, propertyType: 'sala_comercial',
    description: 'Avenida residencial de alto padrão, próxima a colégios e condomínios fechados.',
    footTraffic: 48, avgIncomeIndex: 95,
    competitorCounts: { academia: 1, cafeteria: 3, restaurante: 5, bar: 1, loja_roupas: 2, farmacia: 2, salao_beleza: 3, petshop: 1, coworking: 0, padaria: 2, mercado: 2, clinica: 3 },
    anchors: ['Colégio Rio Branco', 'Parque Burle Marx'],
  },
];

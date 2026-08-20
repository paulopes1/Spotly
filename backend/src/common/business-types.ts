/**
 * Catálogo de tipos de negócio conhecidos pelo Spotly.
 *
 * Cada perfil concentra três coisas:
 *  1. keywords  — como o fallback determinístico reconhece o tipo na frase;
 *  2. weights   — quanto cada critério pesa no score (uma academia depende
 *                 menos de fluxo de calçada do que uma cafeteria, p.ex.);
 *  3. contexto  — renda-alvo do público, área mínima recomendada e que
 *                 âncoras realmente importam para aquele negócio.
 *
 * Adicionar um novo tipo de negócio = adicionar uma entrada aqui.
 */

export interface ScoringWeights {
  footTraffic: number;
  competition: number;
  income: number;
  anchors: number;
  budget: number;
}

export interface BusinessProfile {
  slug: string;
  label: string;
  keywords: string[];
  /** categoria usada em Property.competitorCounts para concorrência direta */
  competitorCategory: string;
  weights: ScoringWeights;
  /** índice de renda (0–100) do público ideal do negócio */
  idealIncomeIndex: number;
  /** tolerância da curva de renda (desvio) — maior = menos sensível */
  incomeSigma: number;
  /** palavras que tornam uma âncora relevante para este negócio */
  anchorKeywords: string[];
  /** área mínima recomendada em m² (usada como sinal, não como filtro duro) */
  recommendedMinAreaM2?: number;
}

const P = (p: Omit<BusinessProfile, 'slug'> & { slug: string }): BusinessProfile => p;

export const BUSINESS_PROFILES: BusinessProfile[] = [
  P({
    slug: 'academia',
    label: 'Academia',
    keywords: ['academia', 'crossfit', 'box de crossfit', 'estúdio de pilates', 'pilates', 'fitness', 'musculação', 'yoga'],
    competitorCategory: 'academia',
    // Academia é negócio de destino: as pessoas vão até ela. Fluxo de calçada
    // pesa menos; concorrência direta e adequação do imóvel/orçamento pesam mais.
    weights: { footTraffic: 0.15, competition: 0.3, income: 0.2, anchors: 0.1, budget: 0.25 },
    idealIncomeIndex: 70,
    incomeSigma: 25,
    anchorKeywords: ['metrô', 'estação', 'faculdade', 'universidade', 'colégio', 'escritório', 'corporativ', 'parque'],
    recommendedMinAreaM2: 200,
  }),
  P({
    slug: 'cafeteria',
    label: 'Cafeteria',
    keywords: ['cafeteria', 'café', 'coffee shop', 'cafe'],
    competitorCategory: 'cafeteria',
    // Cafeteria vive de impulso e passagem: fluxo é rei.
    weights: { footTraffic: 0.35, competition: 0.2, income: 0.2, anchors: 0.15, budget: 0.1 },
    idealIncomeIndex: 75,
    incomeSigma: 22,
    anchorKeywords: ['metrô', 'estação', 'escritório', 'corporativ', 'faculdade', 'universidade', 'shopping', 'teatro', 'hospital'],
    recommendedMinAreaM2: 40,
  }),
  P({
    slug: 'restaurante',
    label: 'Restaurante',
    keywords: ['restaurante', 'bistrô', 'bistro', 'hamburgueria', 'pizzaria', 'lanchonete', 'comida'],
    competitorCategory: 'restaurante',
    weights: { footTraffic: 0.3, competition: 0.15, income: 0.2, anchors: 0.2, budget: 0.15 },
    idealIncomeIndex: 72,
    incomeSigma: 25,
    anchorKeywords: ['metrô', 'escritório', 'corporativ', 'shopping', 'teatro', 'bar', 'faculdade'],
    recommendedMinAreaM2: 80,
  }),
  P({
    slug: 'bar',
    label: 'Bar',
    keywords: ['bar', 'pub', 'cervejaria', 'choperia', 'boteco'],
    competitorCategory: 'bar',
    // Em bares, aglomeração de concorrentes é sinal POSITIVO de polo boêmio —
    // o serviço de scoring trata isso via clusterBonus.
    weights: { footTraffic: 0.3, competition: 0.1, income: 0.15, anchors: 0.25, budget: 0.2 },
    idealIncomeIndex: 65,
    incomeSigma: 28,
    anchorKeywords: ['metrô', 'teatro', 'beco', 'praça', 'faculdade', 'universidade'],
    recommendedMinAreaM2: 90,
  }),
  P({
    slug: 'loja_roupas',
    label: 'Loja de Roupas',
    keywords: ['loja de roupa', 'loja de roupas', 'moda', 'boutique', 'vestuário', 'brechó'],
    competitorCategory: 'loja_roupas',
    weights: { footTraffic: 0.3, competition: 0.15, income: 0.25, anchors: 0.15, budget: 0.15 },
    idealIncomeIndex: 80,
    incomeSigma: 20,
    anchorKeywords: ['shopping', 'metrô', 'calçadão', 'oscar freire'],
    recommendedMinAreaM2: 50,
  }),
  P({
    slug: 'farmacia',
    label: 'Farmácia',
    keywords: ['farmácia', 'drogaria'],
    competitorCategory: 'farmacia',
    weights: { footTraffic: 0.3, competition: 0.3, income: 0.1, anchors: 0.15, budget: 0.15 },
    idealIncomeIndex: 60,
    incomeSigma: 35,
    anchorKeywords: ['hospital', 'clínica', 'metrô', 'mercado'],
    recommendedMinAreaM2: 60,
  }),
  P({
    slug: 'petshop',
    label: 'Pet Shop',
    keywords: ['pet shop', 'petshop', 'pet', 'veterinári', 'banho e tosa'],
    competitorCategory: 'petshop',
    weights: { footTraffic: 0.2, competition: 0.3, income: 0.25, anchors: 0.05, budget: 0.2 },
    idealIncomeIndex: 78,
    incomeSigma: 20,
    anchorKeywords: ['parque', 'praça', 'residencial'],
    recommendedMinAreaM2: 60,
  }),
  P({
    slug: 'salao_beleza',
    label: 'Salão de Beleza',
    keywords: ['salão de beleza', 'salão', 'barbearia', 'estética', 'manicure', 'cabeleireiro'],
    competitorCategory: 'salao_beleza',
    weights: { footTraffic: 0.2, competition: 0.3, income: 0.25, anchors: 0.05, budget: 0.2 },
    idealIncomeIndex: 74,
    incomeSigma: 24,
    anchorKeywords: ['metrô', 'shopping', 'escritório'],
    recommendedMinAreaM2: 40,
  }),
  P({
    slug: 'coworking',
    label: 'Coworking',
    keywords: ['coworking', 'escritório compartilhado', 'espaço de trabalho'],
    competitorCategory: 'coworking',
    weights: { footTraffic: 0.1, competition: 0.25, income: 0.2, anchors: 0.25, budget: 0.2 },
    idealIncomeIndex: 82,
    incomeSigma: 18,
    anchorKeywords: ['metrô', 'estação', 'faria lima', 'corporativ', 'escritório', 'faculdade'],
    recommendedMinAreaM2: 150,
  }),
  P({
    slug: 'padaria',
    label: 'Padaria',
    keywords: ['padaria', 'confeitaria', 'doceria'],
    competitorCategory: 'padaria',
    weights: { footTraffic: 0.3, competition: 0.25, income: 0.1, anchors: 0.1, budget: 0.25 },
    idealIncomeIndex: 60,
    incomeSigma: 35,
    anchorKeywords: ['metrô', 'residencial', 'praça', 'colégio'],
    recommendedMinAreaM2: 80,
  }),
  P({
    slug: 'clinica',
    label: 'Clínica',
    keywords: ['clínica', 'consultório', 'odontológic', 'dentista', 'fisioterapia', 'psicologia', 'médic'],
    competitorCategory: 'clinica',
    weights: { footTraffic: 0.1, competition: 0.2, income: 0.3, anchors: 0.15, budget: 0.25 },
    idealIncomeIndex: 85,
    incomeSigma: 18,
    anchorKeywords: ['hospital', 'metrô', 'clínicas', 'universidade'],
    recommendedMinAreaM2: 80,
  }),
  P({
    slug: 'mercado',
    label: 'Mercado / Minimercado',
    keywords: ['mercado', 'minimercado', 'mercearia', 'empório', 'hortifruti'],
    competitorCategory: 'mercado',
    weights: { footTraffic: 0.25, competition: 0.3, income: 0.1, anchors: 0.1, budget: 0.25 },
    idealIncomeIndex: 55,
    incomeSigma: 40,
    anchorKeywords: ['residencial', 'metrô', 'praça'],
    recommendedMinAreaM2: 100,
  }),
];

/** Perfil genérico usado quando o tipo de negócio não está no catálogo. */
export const GENERIC_PROFILE: BusinessProfile = {
  slug: 'generico',
  label: 'Negócio',
  keywords: [],
  competitorCategory: '',
  weights: { footTraffic: 0.25, competition: 0.15, income: 0.2, anchors: 0.15, budget: 0.25 },
  idealIncomeIndex: 70,
  incomeSigma: 30,
  anchorKeywords: ['metrô', 'shopping', 'estação'],
};

export function findProfile(slug: string): BusinessProfile {
  return BUSINESS_PROFILES.find((b) => b.slug === slug) ?? { ...GENERIC_PROFILE, slug, label: slug };
}

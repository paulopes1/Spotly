import { Injectable } from '@nestjs/common';
import { Property } from '../database/entities/property.entity';
import { ParsedSearchParams } from '../ai/types';
import { BusinessProfile, findProfile } from '../common/business-types';
import { haversineKm, resolveNeighborhoodCentroid } from '../common/sp-locations';

export interface ScoreDetail {
  score: number; // 0–100 final
  breakdown: {
    footTraffic: number;
    competition: number;
    income: number;
    anchors: number;
    budget: number;
    proximity: number;
  };
  directCompetitors: number;
  /** Distância em km até o centro do bairro pedido; null se o bairro não foi reconhecido. */
  distanceKm: number | null;
}

/**
 * Motor de compatibilidade 0–100.
 *
 * Decisão arquitetural: o score é 100% determinístico e separado da IA.
 * Motivos: (a) auditável — conseguimos explicar cada ponto do número;
 * (b) grátis e instantâneo — não gastamos tokens para ranquear 30 imóveis;
 * (c) testável — pesos podem ser calibrados com testes de regressão.
 * A IA entra antes (interpretar a frase) e depois (explicar o resultado).
 *
 * score = Σ (critério_normalizado × peso_do_tipo_de_negócio)
 */
@Injectable()
export class ScoringService {
  score(property: Property, params: ParsedSearchParams): ScoreDetail {
    const profile = findProfile(params.tipo_negocio);
    const w = profile.weights;

    const footTraffic = this.footTrafficScore(property);
    const { score: competition, count } = this.competitionScore(property, profile);
    const income = this.incomeScore(property, profile);
    const anchors = this.anchorScore(property, profile, params);
    const budget = this.budgetScore(property, params, profile);

    const raw =
      footTraffic * w.footTraffic +
      competition * w.competition +
      income * w.income +
      anchors * w.anchors +
      budget * w.budget;

    // Proximidade geográfica: penalidade MULTIPLICATIVA em relação ao bairro
    // pedido, aplicada por cima da soma ponderada acima — não é mais um
    // critério entre os outros porque precisa afetar TODOS os negócios da
    // mesma forma, independente do tipo. Sem isso, quando o bairro pedido
    // não tinha imóvel cadastrado (ex.: Morumbi), a busca expandia pra
    // cidade inteira e o ranking ignorava completamente a distância —
    // um imóvel a 20km podia "ganhar" só por ter bons fundamentos.
    // Fica em [0.4, 1.0]: mesmo um imóvel longe ainda aparece (com nota
    // menor) em vez de sumir, mas nunca vence um equivalente mais perto.
    const { factor: proximityFactor, distanceKm } = this.proximityScore(property, params);
    const adjusted = raw * (0.4 + 0.6 * proximityFactor);

    return {
      score: Math.round(Math.max(0, Math.min(100, adjusted))),
      breakdown: {
        footTraffic: Math.round(footTraffic),
        competition: Math.round(competition),
        income: Math.round(income),
        anchors: Math.round(anchors),
        budget: Math.round(budget),
        proximity: Math.round(proximityFactor * 100),
      },
      directCompetitors: count,
      distanceKm,
    };
  }

  /**
   * Distância até o centro do bairro pedido, convertida em fator 0–1 por
   * decaimento exponencial (0km → 1.0; ~3km → 0.47; ~6km → 0.22; ~12km →
   * 0.05). Sem bairro reconhecido na tabela de centróides (cidade genérica,
   * bairro raro/não cadastrado), fica neutro — não penaliza nem favorece.
   */
  private proximityScore(
    p: Property,
    params: ParsedSearchParams,
  ): { factor: number; distanceKm: number | null } {
    const bairro = params.localizacao.bairro;
    if (!bairro) return { factor: 1, distanceKm: null };

    const target = resolveNeighborhoodCentroid(bairro);
    if (!target) return { factor: 1, distanceKm: null };

    const distanceKm = haversineKm(target, { lat: p.lat, lng: p.lng });
    return { factor: Math.exp(-distanceKm / 4), distanceKm: Math.round(distanceKm * 10) / 10 };
  }

  /** Fluxo já vem normalizado 0–100 na base. */
  private footTrafficScore(p: Property): number {
    return p.footTraffic;
  }

  /**
   * Concorrência direta: decaimento exponencial com o nº de concorrentes.
   * 0 concorrentes = 100; ~3 = 55; ~6 = 30...
   * Exceção: negócios "de polo" (bar, restaurante) recebem um bônus quando há
   * alguns concorrentes — aglomeração atrai público (efeito rua gastronômica).
   */
  private competitionScore(p: Property, profile: BusinessProfile): { score: number; count: number } {
    const counts = (p.competitorCounts ?? {}) as Record<string, number>;
    const count = profile.competitorCategory ? counts[profile.competitorCategory] ?? 0 : 0;

    let score = 100 * Math.exp(-count / 5);

    const clusterBusinesses = ['bar', 'restaurante'];
    if (clusterBusinesses.includes(profile.slug) && count >= 3 && count <= 15) {
      score = Math.min(100, score + 35); // polo consolidado > deserto
    }
    return { score, count };
  }

  /**
   * Perfil socioeconômico: curva gaussiana em torno da renda ideal do público
   * do negócio. Um mercado popular perto de renda altíssima pontua menos que
   * uma clínica premium, e vice-versa.
   */
  private incomeScore(p: Property, profile: BusinessProfile): number {
    const diff = p.avgIncomeIndex - profile.idealIncomeIndex;
    return 100 * Math.exp(-(diff * diff) / (2 * profile.incomeSigma * profile.incomeSigma));
  }

  /**
   * Âncoras: cada âncora relevante para o negócio soma mais que âncoras
   * genéricas. "Perto de metrô" nas preferências do usuário aumenta o peso
   * de âncoras de transporte.
   */
  private anchorScore(p: Property, profile: BusinessProfile, params: ParsedSearchParams): number {
    if (p.anchors.length === 0) return 20;

    const wantsTransit = params.preferencias.some((pref) => /metr[oô]|transporte/i.test(pref));
    let score = 30;
    for (const anchor of p.anchors) {
      const a = anchor.toLowerCase();
      const relevant = profile.anchorKeywords.some((k) => a.includes(k));
      const isTransit = /metrô|estação|cptm|terminal/i.test(anchor);
      if (relevant) score += 25;
      else score += 10;
      if (wantsTransit && isTransit) score += 15;
    }
    return Math.min(100, score);
  }

  /**
   * Orçamento: dentro do teto = 100 com bônus de folga leve; acima do teto
   * decai rápido (10% acima ainda é "negociável", 25% acima praticamente
   * elimina). Sem orçamento informado, o critério fica neutro (70) para não
   * distorcer o ranking.
   */
  private budgetScore(p: Property, params: ParsedSearchParams, profile: BusinessProfile): number {
    const budget = params.orcamento_max;
    let score: number;
    if (!budget) {
      score = 70;
    } else {
      const ratio = p.rentPrice / budget;
      if (ratio <= 1) {
        // Dentro do orçamento: 100. Folga extrema (< 40% do teto) pode indicar
        // imóvel aquém da necessidade — leve desconto.
        score = ratio < 0.4 ? 88 : 100;
      } else if (ratio <= 1.1) score = 65;
      else if (ratio <= 1.25) score = 35;
      else score = 5;
    }

    // Sinal de adequação de área: imóvel muito menor que o recomendado para o
    // tipo de negócio derruba a viabilidade prática do ponto.
    const minArea = params.area_min_m2 ?? profile.recommendedMinAreaM2;
    if (minArea && p.areaM2 < minArea) {
      score *= Math.max(0.35, p.areaM2 / minArea);
    }
    return score;
  }
}

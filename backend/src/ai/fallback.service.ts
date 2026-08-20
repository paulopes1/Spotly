import { Injectable } from '@nestjs/common';
import { BUSINESS_PROFILES } from '../common/business-types';
import { SP_NEIGHBORHOOD_NAMES } from '../common/sp-locations';
import { ParsedSearchParams, PropertyForExplanation, ProsConsList } from './types';

/**
 * Motor determinístico de interpretação e redação.
 *
 * Existe por dois motivos:
 *  1. O produto precisa funcionar de ponta a ponta sem chave da OpenAI
 *     (modo demo / desenvolvimento local);
 *  2. É o plano B em produção quando a OpenAI falha, dá timeout ou a cota
 *     estoura — o usuário recebe um resultado um pouco menos rico em vez
 *     de um erro 500.
 *
 * A extração usa regex + dicionários pt-BR; os prós/contras usam templates
 * parametrizados pelos dados reais do imóvel (contagem de concorrentes,
 * âncoras nominais, distância do orçamento), o que evita o tom genérico.
 */
@Injectable()
export class FallbackAiService {
  /**
   * Bairros conhecidos — mesma fonte usada pelo cálculo de distância do
   * scoring (SP_NEIGHBORHOOD_NAMES). Antes eram duas listas separadas e
   * desalinhadas: um bairro podia ter coordenada cadastrada mas não ser
   * reconhecido aqui na extração (ou vice-versa), gerando buscas que
   * ignoravam o bairro pedido silenciosamente.
   */
  private readonly knownNeighborhoods = SP_NEIGHBORHOOD_NAMES;

  private readonly knownCities = ['São Paulo', 'Belo Horizonte', 'Rio de Janeiro', 'Curitiba'];

  // ── Extração ──────────────────────────────────────────────────────────
  extractParams(query: string): ParsedSearchParams {
    const normalized = this.normalize(query);

    // Tipo de negócio: primeiro keyword do catálogo que aparecer na frase.
    let matched = BUSINESS_PROFILES.find((b) =>
      b.keywords.some((k) => normalized.includes(this.normalize(k))),
    );

    // Bairro: procura nomes conhecidos na frase.
    const bairro = this.knownNeighborhoods.find((n) => normalized.includes(this.normalize(n))) ?? null;
    const cidade = this.knownCities.find((c) => normalized.includes(this.normalize(c))) ?? 'São Paulo';

    // Orçamento: cobre "10 mil", "10k", "R$ 10.000", "10000 reais", "até 8.500".
    const orcamento = this.extractBudget(normalized);

    // Área mínima: "pelo menos 200m2", "200 metros".
    const areaMatch = normalized.match(/(\d{2,4})\s*(?:m2|m²|metros)/);
    const area = areaMatch ? Number(areaMatch[1]) : null;

    // Preferências adicionais simples (sinais que o scoring/LLM podem usar).
    const preferencias: string[] = [];
    if (/metr[oô]|estac[aã]o/.test(normalized)) preferencias.push('perto de metrô');
    if (/estacionamento|vaga/.test(normalized)) preferencias.push('com estacionamento');
    if (/esquina/.test(normalized)) preferencias.push('loja de esquina');
    if (/movimento|fluxo/.test(normalized)) preferencias.push('alto fluxo de pessoas');
    if (/barat|econ[oô]mic/.test(normalized)) preferencias.push('custo baixo');

    const profile = matched ?? null;
    return {
      tipo_negocio: profile?.slug ?? 'generico',
      tipo_negocio_label: profile?.label ?? 'Negócio',
      localizacao: { bairro, cidade },
      orcamento_max: orcamento,
      area_min_m2: area,
      preferencias,
    };
  }

  private extractBudget(text: string): number | null {
    // "ate 10 mil", "10k", "r$ 9.500", "9500 reais", "orcamento de 12000"
    const patterns: [RegExp, (m: RegExpMatchArray) => number][] = [
      [/(\d+(?:[.,]\d+)?)\s*mil/, (m) => parseFloat(m[1].replace(',', '.')) * 1000],
      [/(\d+(?:[.,]\d+)?)\s*k\b/, (m) => parseFloat(m[1].replace(',', '.')) * 1000],
      [/r\$\s*([\d.]+(?:,\d+)?)/, (m) => this.parseBRL(m[1])],
      [/([\d.]{4,})\s*(?:reais|de aluguel)/, (m) => this.parseBRL(m[1])],
      [/(?:ate|orcamento(?:\s+de)?|maximo(?:\s+de)?|pagando(?:\s+ate)?)\s+([\d.]{3,})/, (m) => this.parseBRL(m[1])],
    ];
    for (const [re, fn] of patterns) {
      const m = text.match(re);
      if (m) {
        const v = fn(m);
        if (Number.isFinite(v) && v >= 300 && v <= 1_000_000) return Math.round(v);
      }
    }
    return null;
  }

  private parseBRL(s: string): number {
    // "9.500" → 9500 (ponto como separador de milhar), "9500" → 9500
    return Number(s.replace(/\./g, '').replace(',', '.'));
  }

  private normalize(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // ── Prós/contras por template ─────────────────────────────────────────
  generateProsCons(params: ParsedSearchParams, properties: PropertyForExplanation[]): ProsConsList {
    const label = params.tipo_negocio_label.toLowerCase();
    return properties.map((p) => {
      const pros: string[] = [];
      const cons: string[] = [];

      // Fluxo de pessoas
      if (p.footTraffic >= 85) pros.push(`Fluxo de pedestres entre os mais altos da região (índice ${p.footTraffic}/100) — visibilidade constante para ${this.plural(label)}.`);
      else if (p.footTraffic >= 65) pros.push(`Movimento de rua consistente (índice ${p.footTraffic}/100), suficiente para gerar demanda espontânea.`);
      else cons.push(`Fluxo de calçada modesto (índice ${p.footTraffic}/100) — o negócio dependerá mais de divulgação e clientela de destino.`);

      // Concorrência direta
      if (p.directCompetitors === 0) pros.push(`Nenhum concorrente direto num raio de 500m — oportunidade de ser a primeira opção do bairro.`);
      else if (p.directCompetitors <= 2) pros.push(`Apenas ${p.directCompetitors} concorrente${p.directCompetitors > 1 ? 's' : ''} direto${p.directCompetitors > 1 ? 's' : ''} próximo${p.directCompetitors > 1 ? 's' : ''} — mercado validado sem saturação.`);
      else if (p.directCompetitors >= 5) cons.push(`${p.directCompetitors} concorrentes diretos num raio de 500m — será preciso um diferencial claro para se destacar.`);
      else cons.push(`${p.directCompetitors} concorrentes diretos no entorno imediato exigem posicionamento bem definido.`);

      // Renda / perfil socioeconômico
      if (p.avgIncomeIndex >= 85) pros.push(`Entorno de renda alta (índice ${p.avgIncomeIndex}/100) em ${p.neighborhood}, favorável a tíquete médio elevado.`);
      else if (p.avgIncomeIndex <= 45) cons.push(`Renda média do entorno mais baixa (índice ${p.avgIncomeIndex}/100) — precificação precisa ser popular.`);

      // Âncoras
      if (p.anchors.length > 0) pros.push(`Pontos âncora a poucos minutos: ${p.anchors.slice(0, 3).join(', ')}.`);
      else cons.push('Sem geradores de fluxo relevantes (metrô, shopping, universidade) no entorno imediato.');

      // Orçamento
      if (params.orcamento_max) {
        const ratio = p.rentPrice / params.orcamento_max;
        if (ratio <= 0.85) pros.push(`Aluguel de R$ ${p.rentPrice.toLocaleString('pt-BR')} fica ${Math.round((1 - ratio) * 100)}% abaixo do seu teto — sobra caixa para reforma e marketing.`);
        else if (ratio <= 1) pros.push(`Aluguel de R$ ${p.rentPrice.toLocaleString('pt-BR')} cabe no orçamento informado.`);
        else cons.push(`Aluguel de R$ ${p.rentPrice.toLocaleString('pt-BR')} ultrapassa seu teto em ${Math.round((ratio - 1) * 100)}% — exigiria negociação.`);
      }

      // Área
      if (params.area_min_m2 && p.areaM2 < params.area_min_m2) {
        cons.push(`Área de ${p.areaM2}m² abaixo dos ${params.area_min_m2}m² desejados.`);
      }

      // Distância do bairro pedido (só quando o imóvel está fora dele)
      const bairroPedido = params.localizacao.bairro;
      const foraDoBairro = bairroPedido && !this.sameNeighborhood(bairroPedido, p.neighborhood);
      if (foraDoBairro && p.distanceKm !== null) {
        if (p.distanceKm <= 2) {
          pros.push(`A ${p.distanceKm.toFixed(1)}km de ${bairroPedido} — bem próximo do bairro pedido, em ${p.neighborhood}.`);
        } else {
          cons.push(`Fica em ${p.neighborhood}, a ${p.distanceKm.toFixed(1)}km de ${bairroPedido} — fora do bairro pedido originalmente.`);
        }
      }

      return {
        propertyId: p.id,
        pros: pros.slice(0, 4).length ? pros.slice(0, 4) : ['Imóvel disponível dentro dos critérios da busca.'],
        cons: cons.slice(0, 4).length ? cons.slice(0, 4) : ['Nenhum ponto de atenção relevante identificado nos dados disponíveis.'],
      };
    });
  }

  private sameNeighborhood(a: string, b: string): boolean {
    return this.normalize(a) === this.normalize(b) || this.normalize(b).includes(this.normalize(a));
  }

  private plural(label: string): string {
    return label.endsWith('a') || label.endsWith('e') || label.endsWith('o') ? `uma ${label}` : `um ${label}`;
  }
}

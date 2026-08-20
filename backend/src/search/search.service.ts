import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { PropertyForExplanation } from '../ai/types';
import { findProfile } from '../common/business-types';
import { Search } from '../database/entities/search.entity';
import { SearchResult } from '../database/entities/search-result.entity';
import { PropertiesRepository } from '../properties/properties.repository';
import { ScoringService } from '../scoring/scoring.service';

/** Quantos imóveis recebem prós/contras da IA (controle de custo de tokens). */
const MAX_RESULTS = 8;

/**
 * Orquestrador do fluxo core:
 *   frase → extração (IA) → candidatos (repo) → score (determinístico)
 *        → top N → prós/contras (IA, batch) → persistência → resposta.
 */
@Injectable()
export class SearchService {
  constructor(
    private readonly ai: AiService,
    private readonly scoring: ScoringService,
    private readonly properties: PropertiesRepository,
    @InjectRepository(Search) private readonly searches: Repository<Search>,
    @InjectRepository(SearchResult) private readonly results: Repository<SearchResult>,
  ) {}

  async run(query: string, userId?: string) {
    // 1. Interpretar a frase
    const { params, provider } = await this.ai.extractParams(query);

    // 2. Buscar candidatos e 3. ranquear
    const candidates = await this.properties.findCandidates(params);
    const scored = candidates
      .map((property) => ({ property, detail: this.scoring.score(property, params) }))
      .sort((a, b) => b.detail.score - a.detail.score)
      .slice(0, MAX_RESULTS);

    // 4. Prós/contras via IA (uma única chamada batch para os top N)
    const forExplanation: PropertyForExplanation[] = scored.map(({ property, detail }) => ({
      id: property.id,
      title: property.title,
      address: property.address,
      neighborhood: property.neighborhood,
      rentPrice: property.rentPrice,
      areaM2: property.areaM2,
      propertyType: property.propertyType,
      footTraffic: property.footTraffic,
      avgIncomeIndex: property.avgIncomeIndex,
      directCompetitors: detail.directCompetitors,
      anchors: property.anchors,
      score: detail.score,
      scoreBreakdown: detail.breakdown,
      distanceKm: detail.distanceKm,
    }));
    const { prosCons } = await this.ai.generateProsCons(params, forExplanation);
    const prosConsById = new Map(prosCons.map((pc) => [pc.propertyId, pc]));

    // 5. Persistir a busca + resultados (alimenta o histórico do dashboard)
    const search = await this.searches.save(
      this.searches.create({
        userId: userId ?? null,
        rawQuery: query,
        parsedParams: params as unknown as Record<string, unknown>,
        aiProvider: provider,
        results: scored.map(({ property, detail }) =>
          this.results.create({
            propertyId: property.id,
            score: detail.score,
            scoreBreakdown: detail.breakdown,
            pros: prosConsById.get(property.id)?.pros ?? [],
            cons: prosConsById.get(property.id)?.cons ?? [],
          }),
        ),
      }),
    );

    return this.getById(search.id, userId);
  }

  async getById(searchId: string, userId?: string) {
    const search = await this.searches.findOne({
      where: { id: searchId },
      relations: { results: { property: true } },
      order: { results: { score: 'DESC' } },
    });
    // Buscas anônimas são acessíveis por link; buscas de um usuário são privadas.
    if (!search || (search.userId && search.userId !== userId)) {
      throw new NotFoundException('Busca não encontrada.');
    }

    const params = search.parsedParams as { tipo_negocio?: string };
    return {
      id: search.id,
      query: search.rawQuery,
      params: search.parsedParams,
      businessLabel: findProfile(params?.tipo_negocio ?? 'generico').label,
      aiProvider: search.aiProvider,
      createdAt: search.createdAt,
      results: search.results.map((r) => ({
        id: r.id,
        score: r.score,
        scoreBreakdown: r.scoreBreakdown,
        pros: r.pros,
        cons: r.cons,
        property: {
          id: r.property.id,
          title: r.property.title,
          address: r.property.address,
          neighborhood: r.property.neighborhood,
          city: r.property.city,
          lat: r.property.lat,
          lng: r.property.lng,
          rentPrice: r.property.rentPrice,
          areaM2: r.property.areaM2,
          propertyType: r.property.propertyType,
          imageUrl: r.property.imageUrl,
          description: r.property.description,
        },
      })),
    };
  }
}

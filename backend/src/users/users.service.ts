import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { findProfile } from '../common/business-types';
import { Property } from '../database/entities/property.entity';
import { SavedProperty } from '../database/entities/saved-property.entity';
import { Search } from '../database/entities/search.entity';
import { SearchResult } from '../database/entities/search-result.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Search) private readonly searches: Repository<Search>,
    @InjectRepository(SearchResult) private readonly results: Repository<SearchResult>,
    @InjectRepository(SavedProperty) private readonly saved: Repository<SavedProperty>,
    @InjectRepository(Property) private readonly properties: Repository<Property>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  /** Estatísticas de uso + histórico de buscas para o dashboard. */
  async getDashboard(userId: string) {
    const user = await this.getProfile(userId);

    const history = await this.searches.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
      relations: { results: { property: true } },
    });

    const totalSearches = await this.searches.countBy({ userId });
    const agg = await this.results
      .createQueryBuilder('r')
      .innerJoin('r.search', 's')
      .where('s.userId = :userId', { userId })
      .select('COUNT(r.id)', 'count')
      .addSelect('COALESCE(MAX(r.score), 0)', 'max')
      .addSelect('COALESCE(AVG(r.score), 0)', 'avg')
      .getRawOne<{ count: string; max: string; avg: string }>();

    return {
      user,
      stats: {
        totalSearches,
        propertiesAnalyzed: Number(agg?.count ?? 0),
        bestScore: Number(agg?.max ?? 0),
        avgScore: Math.round(Number(agg?.avg ?? 0)),
      },
      history: history.map((s) => {
        const params = s.parsedParams as {
          tipo_negocio?: string;
          localizacao?: { bairro?: string | null; cidade?: string };
          orcamento_max?: number | null;
        };
        const top = [...s.results].sort((a, b) => b.score - a.score)[0];
        return {
          id: s.id,
          query: s.rawQuery,
          businessLabel: findProfile(params?.tipo_negocio ?? 'generico').label,
          neighborhood: params?.localizacao?.bairro ?? params?.localizacao?.cidade ?? null,
          budget: params?.orcamento_max ?? null,
          resultCount: s.results.length,
          topResult: top
            ? {
                score: top.score,
                title: top.property.title,
                neighborhood: top.property.neighborhood,
              }
            : null,
          createdAt: s.createdAt,
        };
      }),
    };
  }

  // ── Imóveis salvos ────────────────────────────────────────────────

  /** Lista completa (tela "Imóveis Salvos"): dados do imóvel + quando foi salvo. */
  async listSaved(userId: string) {
    const rows = await this.saved.find({
      where: { userId },
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.id,
      savedAt: r.createdAt,
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
    }));
  }

  /** Só os IDs (usado nas telas de busca/resultados pra saber quais corações preencher). */
  async listSavedIds(userId: string): Promise<string[]> {
    const rows = await this.saved.find({ where: { userId }, select: { propertyId: true } });
    return rows.map((r) => r.propertyId);
  }

  /** Idempotente: salvar de novo um imóvel já salvo não duplica nem dá erro. */
  async saveProperty(userId: string, propertyId: string) {
    const existing = await this.saved.findOne({ where: { userId, propertyId } });
    if (existing) return { id: existing.id, savedAt: existing.createdAt };

    const property = await this.properties.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado.');

    const row = await this.saved.save(this.saved.create({ userId, propertyId }));
    return { id: row.id, savedAt: row.createdAt };
  }

  async unsaveProperty(userId: string, propertyId: string): Promise<void> {
    await this.saved.delete({ userId, propertyId });
  }
}

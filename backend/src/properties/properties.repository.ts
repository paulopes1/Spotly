import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, LessThanOrEqual, Repository } from 'typeorm';
import { ParsedSearchParams } from '../ai/types';
import { Property } from '../database/entities/property.entity';

/**
 * Contrato de acesso a imóveis.
 *
 * Decisão arquitetural: o resto do sistema (search/scoring) só conhece esta
 * abstração. Hoje a implementação lê do Postgres (base seed); quando houver
 * integração com uma API real de imóveis (portais/CRMs imobiliários),
 * cria-se outra implementação e troca-se o provider no módulo — zero mudança
 * nos consumidores.
 */
export abstract class PropertiesRepository {
  abstract findCandidates(params: ParsedSearchParams): Promise<Property[]>;
  abstract findById(id: string): Promise<Property | null>;
}

@Injectable()
export class DbPropertiesRepository extends PropertiesRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repo: Repository<Property>,
  ) {
    super();
  }

  async findCandidates(params: ParsedSearchParams): Promise<Property[]> {
    const { localizacao, orcamento_max } = params;

    // Filtros duros: cidade sempre; orçamento com tolerância de 25% (imóveis
    // um pouco acima do teto ainda aparecem, mas penalizados no score —
    // aluguel comercial é negociável). Bairro é filtro PREFERENCIAL: primeiro
    // tentamos o bairro pedido; se retornar pouca coisa, expandimos para a
    // cidade (o usuário vê opções vizinhas em vez de uma tela vazia).
    const base = {
      city: ILike(localizacao.cidade),
      ...(orcamento_max ? { rentPrice: LessThanOrEqual(Math.round(orcamento_max * 1.25)) } : {}),
    };

    if (localizacao.bairro) {
      const inNeighborhood = await this.repo.find({
        where: { ...base, neighborhood: ILike(`%${localizacao.bairro}%`) },
      });
      if (inNeighborhood.length >= 3) return inNeighborhood;

      // Expansão: bairro pedido + resto da cidade (o scoring naturalmente
      // favorece o que estiver mais aderente).
      const cityWide = await this.repo.find({ where: base });
      const ids = new Set(inNeighborhood.map((p) => p.id));
      return [...inNeighborhood, ...cityWide.filter((p) => !ids.has(p.id))];
    }

    return this.repo.find({ where: base });
  }

  findById(id: string): Promise<Property | null> {
    return this.repo.findOneBy({ id });
  }
}

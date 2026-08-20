import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SearchResult } from './search-result.entity';

/**
 * Imóvel comercial disponível para locação.
 *
 * Decisão: os atributos "urbanos" (fluxo, concorrência, renda do entorno,
 * âncoras) moram na própria tabela no MVP. Numa integração real, esses dados
 * viriam de provedores externos (mobilidade urbana, Google Places etc.) e
 * seriam materializados aqui por um job — o resto do sistema não muda.
 */
@Entity('properties')
@Index(['city', 'neighborhood'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  address!: string;

  @Column()
  neighborhood!: string;

  @Column()
  city!: string;

  @Column({ default: 'SP' })
  state!: string;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  /** R$/mês */
  @Index()
  @Column({ type: 'int' })
  rentPrice!: number;

  @Column({ type: 'int' })
  areaM2!: number;

  /** loja_rua | loja_galeria | galpao | sala_comercial | casa_comercial */
  @Column()
  propertyType!: string;

  @Column()
  imageUrl!: string;

  @Column({ type: 'text' })
  description!: string;

  // ── Atributos urbanos usados pelo scoring ───────────────────────
  /** fluxo de pedestres 0–100 (índice normalizado) */
  @Column({ type: 'int' })
  footTraffic!: number;

  /** renda média do entorno 0–100 (100 = mais alta) */
  @Column({ type: 'int' })
  avgIncomeIndex!: number;

  /** concorrentes diretos num raio de 500m, por categoria: {"academia": 3, ...} */
  @Column({ type: 'jsonb', default: {} })
  competitorCounts!: Record<string, number>;

  /** pontos âncora próximos (geradores de fluxo) */
  @Column({ type: 'text', array: true, default: [] })
  anchors!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => SearchResult, (r) => r.property)
  results!: SearchResult[];
}

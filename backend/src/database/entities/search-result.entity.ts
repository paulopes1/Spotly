import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { Search } from './search.entity';

@Entity('search_results')
export class SearchResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Search, (s) => s.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'searchId' })
  search!: Search;

  @Index()
  @Column({ type: 'uuid' })
  searchId!: string;

  @ManyToOne(() => Property, (p) => p.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property!: Property;

  @Column({ type: 'uuid' })
  propertyId!: string;

  /** 0–100 */
  @Column({ type: 'int' })
  score!: number;

  /** detalhe por critério: {"footTraffic": 82, "competition": 60, ...} */
  @Column({ type: 'jsonb' })
  scoreBreakdown!: Record<string, number>;

  /** prós/contras gerados pela IA, em pt-BR */
  @Column({ type: 'text', array: true, default: [] })
  pros!: string[];

  @Column({ type: 'text', array: true, default: [] })
  cons!: string[];
}

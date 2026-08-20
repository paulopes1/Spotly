import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SearchResult } from './search-result.entity';
import { User } from './user.entity';

@Entity('searches')
@Index(['userId', 'createdAt'])
export class Search {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Buscas anônimas são permitidas (landing sem login). */
  @ManyToOne(() => User, (u) => u.searches, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  /** A frase original digitada pelo usuário. */
  @Column({ type: 'text' })
  rawQuery!: string;

  /** Variáveis estruturadas extraídas pela IA. */
  @Column({ type: 'jsonb' })
  parsedParams!: Record<string, unknown>;

  /** "openai" | "fallback" — rastreia qual motor interpretou a busca. */
  @Column()
  aiProvider!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => SearchResult, (r) => r.search, { cascade: ['insert'] })
  results!: SearchResult[];
}

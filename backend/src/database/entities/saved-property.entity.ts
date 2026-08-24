import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';

/**
 * Imóvel favoritado por um usuário — independente de qualquer busca
 * específica (o usuário pode salvar um imóvel visto em resultados de
 * buscas diferentes, ou revisitar depois sem lembrar a busca original).
 * Por isso não guarda score/prós/contras aqui: esses são contextuais a uma
 * busca (tipo de negócio, orçamento) e não fazem sentido "soltos".
 */
@Entity('saved_properties')
@Index(['userId', 'propertyId'], { unique: true })
export class SavedProperty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  propertyId!: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property!: Property;

  @CreateDateColumn()
  createdAt!: Date;
}

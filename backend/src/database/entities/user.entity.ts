import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Search } from './search.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Search, (s) => s.user)
  searches!: Search[];

  @OneToMany(() => RefreshToken, (t) => t.user)
  refreshTokens!: RefreshToken[];
}

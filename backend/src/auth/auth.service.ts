import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User } from '../database/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

/**
 * Modelo de sessão:
 *  - access token JWT curto (15min) — vai no header Authorization e vive só
 *    em memória no frontend (nunca em localStorage → reduz superfície XSS);
 *  - refresh token opaco (não-JWT) de 7 dias — vai num cookie httpOnly e é
 *    guardado no banco com SHA-256 para permitir ROTAÇÃO (cada uso troca o
 *    token) e revogação no logout. Token rotacionado não pode ser reusado.
 */
@Injectable()
export class AuthService {
  private readonly refreshTtlDays: number;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken) private readonly tokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.refreshTtlDays = Number(config.get('JWT_REFRESH_TTL_DAYS') ?? 7);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.findOneBy({ email })) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }
    const user = await this.users.save(
      this.users.create({
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 12),
      }),
    );
    return this.issueSession(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ email: dto.email.toLowerCase() });
    // Mesma mensagem para e-mail inexistente e senha errada — não vaza quais
    // e-mails existem na base (enumeração de usuários).
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }
    return this.issueSession(user.id, user.email, user.name);
  }

  async refresh(rawToken: string | undefined) {
    if (!rawToken) throw new UnauthorizedException('Sessão expirada.');
    const stored = await this.tokens.findOne({
      where: { tokenHash: this.hash(rawToken) },
      relations: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }
    // Rotação: invalida o token usado e emite um novo par.
    await this.tokens.update({ id: stored.id }, { revokedAt: new Date() });
    return this.issueSession(stored.user.id, stored.user.email, stored.user.name);
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    await this.tokens.update(
      { tokenHash: this.hash(rawToken), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async issueSession(userId: string, email: string, name: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    const expiresAt = new Date(Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000);
    await this.tokens.save(
      this.tokens.create({ tokenHash: this.hash(refreshToken), userId, expiresAt }),
    );

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
      user: { id: userId, email, name },
    };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

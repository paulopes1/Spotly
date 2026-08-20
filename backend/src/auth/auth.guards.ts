import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthedUser {
  id: string;
  email: string;
}

async function verifyBearer(
  req: Request & { user?: AuthedUser },
  jwt: JwtService,
  config: ConfigService,
): Promise<AuthedUser | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = await jwt.verifyAsync<{ sub: string; email: string }>(header.slice(7), {
      secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/** Rejeita requisições sem access token válido. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = await verifyBearer(req, this.jwt, this.config);
    if (!user) throw new UnauthorizedException('Faça login para continuar.');
    req.user = user;
    return true;
  }
}

/**
 * Popula req.user quando há token válido, mas deixa passar sem token —
 * usado na busca, que funciona para visitantes e associa histórico a logados.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    req.user = (await verifyBearer(req, this.jwt, this.config)) ?? undefined;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthedUser | undefined =>
    ctx.switchToHttp().getRequest().user,
);

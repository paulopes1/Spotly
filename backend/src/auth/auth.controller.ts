import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const REFRESH_COOKIE = 'spotly_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Rate limit apertado em auth: mitiga força bruta de senhas.
  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.withCookie(res, await this.auth.register(dto));
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.withCookie(res, await this.auth.login(dto));
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.withCookie(res, await this.auth.refresh(req.cookies?.[REFRESH_COOKIE]));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }

  /** Refresh token vai APENAS no cookie httpOnly — nunca no body JSON. */
  private withCookie(
    res: Response,
    session: {
      accessToken: string;
      refreshToken: string;
      refreshExpiresAt: Date;
      user: { id: string; email: string; name: string };
    },
  ) {
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth', // cookie só viaja para rotas de auth
      expires: session.refreshExpiresAt,
    });
    return { accessToken: session.accessToken, user: session.user };
  }
}

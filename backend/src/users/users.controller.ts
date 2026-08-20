import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthedUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guards';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: AuthedUser) {
    return this.users.getProfile(user.id);
  }

  /** Estatísticas + histórico de buscas para o dashboard. */
  @Get('dashboard')
  dashboard(@CurrentUser() user: AuthedUser) {
    return this.users.getDashboard(user.id);
  }
}

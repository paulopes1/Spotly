import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthedUser, CurrentUser, JwtAuthGuard } from '../auth/auth.guards';
import { SavePropertyDto } from './dto/save-property.dto';
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

  /** Lista completa dos imóveis salvos (tela "Imóveis Salvos"). */
  @Get('saved-properties')
  listSaved(@CurrentUser() user: AuthedUser) {
    return this.users.listSaved(user.id);
  }

  /** Só os IDs — usado nas telas de busca pra marcar quais corações já vêm preenchidos. */
  @Get('saved-properties/ids')
  listSavedIds(@CurrentUser() user: AuthedUser) {
    return this.users.listSavedIds(user.id);
  }

  @Post('saved-properties')
  save(@CurrentUser() user: AuthedUser, @Body() dto: SavePropertyDto) {
    return this.users.saveProperty(user.id, dto.propertyId);
  }

  @Delete('saved-properties/:propertyId')
  @HttpCode(204)
  unsave(@CurrentUser() user: AuthedUser, @Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.users.unsaveProperty(user.id, propertyId);
  }
}

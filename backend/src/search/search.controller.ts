import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, OptionalJwtAuthGuard } from '../auth/auth.guards';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  /**
   * POST /api/search — o endpoint core.
   * Rate limit próprio e apertado (10/min por IP): cada chamada pode disparar
   * duas requisições à OpenAI, que custam dinheiro.
   * Auth é OPCIONAL: visitante busca sem login; logado ganha histórico.
   */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(@Body() dto: CreateSearchDto, @CurrentUser() user?: { id: string }) {
    return this.search.run(dto.query, user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  getById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: { id: string }) {
    return this.search.getById(id, user?.id);
  }
}

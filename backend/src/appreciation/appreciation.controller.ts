import { Controller, Get } from '@nestjs/common';
import { AppreciationService } from './appreciation.service';

/**
 * GET /api/appreciation — indicador de valorização por bairro (mapa de
 * calor de investimento). Endpoint público e leve (sem custo de IA),
 * fica sob o rate limit global padrão.
 */
@Controller('appreciation')
export class AppreciationController {
  constructor(private readonly appreciation: AppreciationService) {}

  @Get()
  get() {
    return this.appreciation.getHeatmap();
  }
}

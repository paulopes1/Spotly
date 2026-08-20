import { Injectable, Logger } from '@nestjs/common';
import { FallbackAiService } from './fallback.service';
import { OpenAiService } from './openai.service';
import {
  AiProvider,
  ExtractionResult,
  ParsedSearchParams,
  PropertyForExplanation,
  ProsConsList,
} from './types';

/**
 * Fachada de IA com degradação graciosa.
 *
 * Estratégia: tenta OpenAI (se configurada) → em QUALQUER falha (timeout,
 * 429 de cota, resposta malformada que não passa no Zod) cai para o motor
 * determinístico. A busca do usuário nunca quebra por causa da IA — no pior
 * caso ela fica um pouco menos sofisticada, e o campo `provider` registra
 * qual motor respondeu (visível no banco para observabilidade).
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly openai: OpenAiService,
    private readonly fallback: FallbackAiService,
  ) {}

  async extractParams(query: string): Promise<ExtractionResult> {
    if (this.openai.isConfigured) {
      try {
        const params = await this.openai.extractParams(query);
        return { params, provider: 'openai' };
      } catch (err) {
        this.logger.warn(`Extração via OpenAI falhou (${this.describe(err)}); usando fallback.`);
      }
    }
    return { params: this.fallback.extractParams(query), provider: 'fallback' };
  }

  async generateProsCons(
    params: ParsedSearchParams,
    properties: PropertyForExplanation[],
  ): Promise<{ prosCons: ProsConsList; provider: AiProvider }> {
    if (this.openai.isConfigured) {
      try {
        const prosCons = await this.openai.generateProsCons(params, properties);
        // Se o modelo esqueceu algum imóvel, completa com o fallback só para os faltantes.
        const missing = properties.filter((p) => !prosCons.some((pc) => pc.propertyId === p.id));
        if (missing.length > 0) {
          prosCons.push(...this.fallback.generateProsCons(params, missing));
        }
        return { prosCons, provider: 'openai' };
      } catch (err) {
        this.logger.warn(`Prós/contras via OpenAI falhou (${this.describe(err)}); usando fallback.`);
      }
    }
    return { prosCons: this.fallback.generateProsCons(params, properties), provider: 'fallback' };
  }

  private describe(err: unknown): string {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status?: number }).status;
      if (status === 429) return 'cota/limite da OpenAI estourado (429)';
      if (status === 401) return 'chave da OpenAI inválida (401)';
      return `HTTP ${status}`;
    }
    return err instanceof Error ? err.message : 'erro desconhecido';
  }
}

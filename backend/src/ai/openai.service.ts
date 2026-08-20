import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { BUSINESS_PROFILES } from '../common/business-types';
import {
  ParsedSearchParams,
  ParsedSearchParamsSchema,
  PropertyForExplanation,
  ProsConsList,
  ProsConsSchema,
} from './types';

/**
 * Cliente OpenAI puro. Não sabe nada de fallback — quem decide o que fazer
 * quando aqui falha é o AiService (separação deliberada: este arquivo trata
 * só de prompt engineering e parsing de resposta).
 */
@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    const key = config.get<string>('OPENAI_API_KEY');
    this.client = key ? new OpenAI({ apiKey: key, timeout: 20_000, maxRetries: 1 }) : null;
    this.model = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o';
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /** Extrai variáveis estruturadas da frase do usuário. Lança em caso de falha. */
  async extractParams(query: string): Promise<ParsedSearchParams> {
    if (!this.client) throw new Error('OpenAI não configurada');

    const catalog = BUSINESS_PROFILES.map((b) => `- ${b.slug}: ${b.label}`).join('\n');

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0, // extração é tarefa determinística; criatividade só atrapalha
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você extrai variáveis estruturadas de buscas por pontos comerciais no Brasil.
Responda APENAS com JSON no formato:
{
  "tipo_negocio": "<slug do catálogo abaixo, ou um slug em snake_case se não estiver no catálogo>",
  "tipo_negocio_label": "<nome de exibição em português>",
  "localizacao": { "bairro": "<bairro ou null>", "cidade": "<cidade, padrão São Paulo>" },
  "orcamento_max": <número em R$/mês ou null>,
  "area_min_m2": <número ou null>,
  "preferencias": ["<outras preferências mencionadas, curtas>"]
}

Catálogo de tipos de negócio:
${catalog}

Regras:
- "10 mil" = 10000. Orçamento é SEMPRE aluguel mensal em reais.
- Não invente valores que o usuário não mencionou (use null).
- Preferências são coisas como "perto de metrô", "com estacionamento", "esquina".`,
        },
        { role: 'user', content: query },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    // Zod valida o shape — LLM pode alucinar mesmo em JSON mode.
    return ParsedSearchParamsSchema.parse(JSON.parse(raw));
  }

  /**
   * Gera prós/contras para TODOS os imóveis numa única chamada (batch).
   * Decisão de custo: 1 chamada com N imóveis custa ~1/N do que N chamadas,
   * e mantém o tom consistente entre os cards.
   */
  async generateProsCons(
    params: ParsedSearchParams,
    properties: PropertyForExplanation[],
  ): Promise<ProsConsList> {
    if (!this.client) throw new Error('OpenAI não configurada');

    const propertyData = properties.map((p) => ({
      id: p.id,
      titulo: p.title,
      endereco: p.address,
      bairro: p.neighborhood,
      aluguel_mensal: p.rentPrice,
      area_m2: p.areaM2,
      tipo_imovel: p.propertyType,
      indice_fluxo_pedestres_0_100: p.footTraffic,
      indice_renda_entorno_0_100: p.avgIncomeIndex,
      concorrentes_diretos_500m: p.directCompetitors,
      pontos_ancora: p.anchors,
      score_compatibilidade: p.score,
      detalhe_score: p.scoreBreakdown,
      distancia_km_do_bairro_pedido: p.distanceKm,
    }));

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.4, // um pouco de variação na redação, sem viajar nos fatos
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um consultor sênior de expansão de negócios no Brasil. Para cada imóvel, escreva pontos positivos e negativos ESPECÍFICOS para o negócio do usuário, em português natural.

Regras:
- Baseie-se SOMENTE nos dados fornecidos (fluxo, renda, concorrentes, âncoras, aluguel vs. orçamento, distância do bairro pedido). Não invente fatos.
- Se distancia_km_do_bairro_pedido estiver preenchida e o bairro do imóvel for DIFERENTE do bairro pedido, isso é um ponto de atenção relevante — mencione a distância aproximada. Se for próxima (até ~2km) ou o bairro coincidir, pode ser mencionado como ponto positivo. Se o campo for null, não fale de distância.
- 2 a 4 prós e 1 a 3 contras por imóvel. Frases curtas, concretas, citando números e nomes (ex.: "3 academias num raio de 500m").
- Proibido genérico ("boa localização", "ótimo custo-benefício") sem justificativa com dado.
- Responda APENAS com JSON: {"resultados": [{"propertyId": "...", "pros": ["..."], "cons": ["..."]}]}`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            busca: {
              tipo_negocio: params.tipo_negocio_label,
              bairro: params.localizacao.bairro,
              cidade: params.localizacao.cidade,
              orcamento_max_mensal: params.orcamento_max,
              preferencias: params.preferencias,
            },
            imoveis: propertyData,
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return ProsConsSchema.parse(parsed.resultados ?? parsed.results ?? []);
  }
}

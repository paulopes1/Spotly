import { z } from 'zod';

/**
 * Contrato das variáveis estruturadas extraídas da frase do usuário.
 * Validado com Zod porque a saída de LLM é, por definição, não confiável:
 * mesmo com JSON mode o modelo pode alucinar campos ou tipos.
 */
export const ParsedSearchParamsSchema = z.object({
  tipo_negocio: z.string().min(1), // slug: "academia", "cafeteria", ...
  tipo_negocio_label: z.string().min(1), // exibição: "Academia"
  localizacao: z.object({
    bairro: z.string().nullable().optional(),
    cidade: z.string().default('São Paulo'),
  }),
  orcamento_max: z.number().positive().nullable().optional(), // R$/mês
  area_min_m2: z.number().positive().nullable().optional(),
  preferencias: z.array(z.string()).default([]),
});

export type ParsedSearchParams = z.infer<typeof ParsedSearchParamsSchema>;

/** Prós/contras gerados por imóvel. */
export const ProsConsSchema = z.array(
  z.object({
    propertyId: z.string(),
    pros: z.array(z.string()).min(1).max(4),
    cons: z.array(z.string()).min(1).max(4),
  }),
);
export type ProsConsList = z.infer<typeof ProsConsSchema>;

/** Dados que o gerador de prós/contras recebe sobre cada imóvel. */
export interface PropertyForExplanation {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  rentPrice: number;
  areaM2: number;
  propertyType: string;
  footTraffic: number;
  avgIncomeIndex: number;
  directCompetitors: number;
  anchors: string[];
  score: number;
  scoreBreakdown: Record<string, number>;
  /** Distância em km até o bairro pedido; null se o bairro não foi reconhecido. */
  distanceKm: number | null;
}

export type AiProvider = 'openai' | 'fallback';

export interface ExtractionResult {
  params: ParsedSearchParams;
  provider: AiProvider;
}

/** Tipos espelhando as respostas da API NestJS. */

export interface ParsedParams {
  tipo_negocio: string;
  tipo_negocio_label: string;
  localizacao: { bairro?: string | null; cidade: string };
  orcamento_max?: number | null;
  area_min_m2?: number | null;
  preferencias: string[];
}

export interface PropertyDto {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  rentPrice: number;
  areaM2: number;
  propertyType: string;
  imageUrl: string;
  description: string;
}

export interface SearchResultDto {
  id: string;
  score: number;
  scoreBreakdown: Record<string, number>;
  pros: string[];
  cons: string[];
  property: PropertyDto;
}

export interface SearchResponse {
  id: string;
  query: string;
  params: ParsedParams;
  businessLabel: string;
  aiProvider: 'openai' | 'fallback';
  createdAt: string;
  results: SearchResultDto[];
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export interface DashboardResponse {
  user: UserDto & { createdAt: string };
  stats: {
    totalSearches: number;
    propertiesAnalyzed: number;
    bestScore: number;
    avgScore: number;
  };
  history: Array<{
    id: string;
    query: string;
    businessLabel: string;
    neighborhood: string | null;
    budget: number | null;
    resultCount: number;
    topResult: { score: number; title: string; neighborhood: string } | null;
    createdAt: string;
  }>;
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  loja_rua: 'Loja de Rua',
  loja_galeria: 'Loja de Galeria',
  galpao: 'Galpão',
  sala_comercial: 'Sala Comercial',
  casa_comercial: 'Casa Comercial',
};

export const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

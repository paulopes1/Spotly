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

export type UrbanProjectType = 'metro' | 'hospital' | 'escola';
export type UrbanProjectStatus = 'em_obras' | 'planejado' | 'recem_inaugurado';

export interface UrbanProjectDto {
  id: string;
  name: string;
  type: UrbanProjectType;
  neighborhood: string;
  lat: number;
  lng: number;
  status: UrbanProjectStatus;
  year: number;
  description: string;
  sourceName: string;
  sourceUrl: string;
  distanceKm: number;
  apiVerified: boolean;
}

export interface NeighborhoodAppreciationDto {
  neighborhood: string;
  lat: number;
  lng: number;
  score: number;
  projects: UrbanProjectDto[];
}

export interface AppreciationResponse {
  neighborhoods: NeighborhoodAppreciationDto[];
  metroApiOk: boolean;
}

export const URBAN_PROJECT_TYPE_LABELS: Record<UrbanProjectType, string> = {
  metro: 'Metrô/Trem',
  hospital: 'Saúde',
  escola: 'Educação',
};

export const URBAN_PROJECT_TYPE_ICONS: Record<UrbanProjectType, string> = {
  metro: 'train',
  hospital: 'local_hospital',
  escola: 'school',
};

export const URBAN_PROJECT_STATUS_LABELS: Record<UrbanProjectStatus, string> = {
  em_obras: 'Em obras',
  planejado: 'Planejado',
  recem_inaugurado: 'Recém-inaugurado',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  loja_rua: 'Loja de Rua',
  loja_galeria: 'Loja de Galeria',
  galpao: 'Galpão',
  sala_comercial: 'Sala Comercial',
  casa_comercial: 'Casa Comercial',
};

export const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

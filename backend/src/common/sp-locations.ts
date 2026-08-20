/**
 * Coordenadas centrais (centróides) de bairros de São Paulo.
 *
 * Existe porque o scoring precisa saber "o quão perto" um imóvel está do
 * bairro que o usuário pediu — antes desta tabela, quando um bairro não
 * tinha imóvel cadastrado (ex.: Morumbi), a busca expandia para a cidade
 * inteira e o ranking ignorava completamente a distância, deixando vencer
 * qualquer imóvel com bons fundamentos mesmo a 20km do que foi pedido.
 *
 * Coordenadas aproximadas (precisão de poucas centenas de metros é
 * suficiente para o decaimento por distância do scoring). Cobre bairros já
 * presentes na base seed + outros comuns em buscas, mesmo sem imóvel
 * cadastrado ainda — assim a distância já favorece o candidato mais próximo
 * disponível em vez de escolher às cegas.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const RAW_CENTROIDS: Record<string, LatLng> = {
  'pinheiros': { lat: -23.5637, lng: -46.6884 },
  'vila madalena': { lat: -23.5505, lng: -46.6913 },
  'jardins': { lat: -23.5629, lng: -46.6693 },
  'jardim paulista': { lat: -23.5629, lng: -46.6693 },
  'itaim bibi': { lat: -23.585, lng: -46.6787 },
  'moema': { lat: -23.6023, lng: -46.666 },
  'vila mariana': { lat: -23.586, lng: -46.635 },
  'republica': { lat: -23.543, lng: -46.641 },
  'tatuape': { lat: -23.54, lng: -46.577 },
  'santa cecilia': { lat: -23.539, lng: -46.652 },
  'higienopolis': { lat: -23.542, lng: -46.658 },
  'vila olimpia': { lat: -23.595, lng: -46.685 },
  'brooklin': { lat: -23.617, lng: -46.689 },
  'perdizes': { lat: -23.537, lng: -46.674 },
  'morumbi': { lat: -23.605, lng: -46.716 },
  'butanta': { lat: -23.571, lng: -46.708 },
  'campo belo': { lat: -23.622, lng: -46.669 },
  'alto de pinheiros': { lat: -23.547, lng: -46.705 },
  'consolacao': { lat: -23.554, lng: -46.662 },
  'bela vista': { lat: -23.558, lng: -46.647 },
  'bixiga': { lat: -23.558, lng: -46.647 },
  'liberdade': { lat: -23.558, lng: -46.635 },
  'santana': { lat: -23.503, lng: -46.625 },
  'lapa': { lat: -23.528, lng: -46.702 },
  'vila leopoldina': { lat: -23.529, lng: -46.728 },
  'ipiranga': { lat: -23.59, lng: -46.602 },
  'saude': { lat: -23.621, lng: -46.635 },
  'vila nova conceicao': { lat: -23.59, lng: -46.669 },
  'chacara klabin': { lat: -23.593, lng: -46.647 },
  'paraiso': { lat: -23.573, lng: -46.647 },
  'sumarezinho': { lat: -23.548, lng: -46.68 },
  'sumare': { lat: -23.548, lng: -46.68 },
  'pompeia': { lat: -23.529, lng: -46.68 },
  'barra funda': { lat: -23.527, lng: -46.666 },
  'agua branca': { lat: -23.524, lng: -46.672 },
  'bom retiro': { lat: -23.527, lng: -46.635 },
  'cerqueira cesar': { lat: -23.561, lng: -46.664 },
  'real parque': { lat: -23.601, lng: -46.705 },
  'vila andrade': { lat: -23.623, lng: -46.728 },
  'granja julieta': { lat: -23.633, lng: -46.7 },
  'santo amaro': { lat: -23.654, lng: -46.71 },
  'centro': { lat: -23.55, lng: -46.633 },
  // Adicionados para cobrir bairros das zonas leste/norte/sul mais
  // periféricas, citados nos projetos urbanos do indicador de valorização
  // (2026-08) — também passam a ser reconhecíveis na busca de imóveis.
  'jabaquara': { lat: -23.646, lng: -46.643 },
  'pirituba': { lat: -23.48, lng: -46.716 },
  'sapopemba': { lat: -23.586, lng: -46.503 },
  'grajau': { lat: -23.745, lng: -46.698 },
  'cidade ademar': { lat: -23.68, lng: -46.67 },
  'tremembe': { lat: -23.451, lng: -46.616 },
};

/**
 * Nomes "bonitos" (exibição/reconhecimento) dos bairros cobertos acima —
 * mesma fonte usada pelo extrator determinístico (FallbackAiService) para
 * reconhecer o bairro na frase do usuário. Fonte única: adicionar um bairro
 * aqui automaticamente o torna reconhecível tanto na extração quanto no
 * cálculo de distância do scoring.
 */
export const SP_NEIGHBORHOOD_NAMES = [
  'Pinheiros', 'Vila Madalena', 'Jardins', 'Itaim Bibi', 'Moema', 'Vila Mariana',
  'República', 'Tatuapé', 'Santa Cecília', 'Higienópolis', 'Vila Olímpia', 'Brooklin',
  'Perdizes', 'Morumbi', 'Butantã', 'Campo Belo', 'Alto de Pinheiros', 'Consolação',
  'Bela Vista', 'Liberdade', 'Santana', 'Lapa', 'Vila Leopoldina', 'Ipiranga', 'Saúde',
  'Vila Nova Conceição', 'Chácara Klabin', 'Paraíso', 'Pompeia', 'Barra Funda',
  'Água Branca', 'Bom Retiro', 'Cerqueira César', 'Real Parque', 'Vila Andrade',
  'Granja Julieta', 'Santo Amaro', 'Centro', 'Jabaquara', 'Pirituba', 'Sapopemba',
  'Grajaú', 'Cidade Ademar', 'Tremembé',
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Chaves já normalizadas em tempo de módulo (evita renormalizar a cada busca).
const SP_NEIGHBORHOOD_CENTROIDS: Record<string, LatLng> = Object.fromEntries(
  Object.entries(RAW_CENTROIDS).map(([k, v]) => [normalize(k), v]),
);

/**
 * Resolve o centróide de um bairro digitado livremente pelo usuário/IA.
 * Tenta correspondência exata primeiro; se não achar, tenta substring nos
 * dois sentidos (ex.: "Jardim Paulista" casa com a chave "jardins" só se
 * cadastrado como alias — por isso "jardim paulista" já está mapeado acima).
 * Retorna null quando o bairro é desconhecido — nesse caso o scoring trata
 * a distância como neutra em vez de penalizar às cegas.
 */
export function resolveNeighborhoodCentroid(bairro: string): LatLng | null {
  const n = normalize(bairro);
  if (SP_NEIGHBORHOOD_CENTROIDS[n]) return SP_NEIGHBORHOOD_CENTROIDS[n];
  const match = Object.keys(SP_NEIGHBORHOOD_CENTROIDS).find((key) => n.includes(key) || key.includes(n));
  return match ? SP_NEIGHBORHOOD_CENTROIDS[match] : null;
}

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

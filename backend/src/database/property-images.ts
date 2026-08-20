/**
 * Busca fotos reais de imóveis comerciais via API da Pexels, uma vez por
 * TIPO de imóvel (não por imóvel individual) — 5 tipos cadastrados hoje =
 * 5 chamadas no total pro seed inteiro, bem abaixo de qualquer limite do
 * plano gratuito.
 *
 * Sem PEXELS_API_KEY configurada (ou em caso de falha de rede), retorna um
 * mapa vazio e quem chama cai de volta nos placeholders — o seed nunca
 * quebra por causa disso, mesmo padrão de degradação graciosa usado no
 * AiService.
 */

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

/** Termos de busca em inglês (base da Pexels é majoritariamente em inglês). */
const QUERY_BY_TYPE: Record<string, string> = {
  loja_rua: 'storefront shop street facade',
  loja_galeria: 'shopping mall storefront interior',
  galpao: 'warehouse interior industrial building',
  sala_comercial: 'modern office interior building',
  casa_comercial: 'commercial house exterior renovated',
};

interface PexelsPhoto {
  src: { large: string; large2x: string };
}

async function searchType(type: string, query: string, apiKey: string): Promise<string[]> {
  const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    throw new Error(`Pexels respondeu ${res.status} para "${type}"`);
  }
  const data = (await res.json()) as { photos: PexelsPhoto[] };
  return data.photos.map((p) => p.src.large);
}

/**
 * Retorna um mapa propertyType → lista de URLs de fotos reais. Mapa vazio
 * (não lança) se a chave não estiver configurada ou alguma chamada falhar —
 * quem chama decide o fallback tipo a tipo.
 */
export async function fetchPropertyImagesByType(): Promise<Record<string, string[]>> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.log('ℹ️  PEXELS_API_KEY não configurada — usando placeholders genéricos.');
    return {};
  }

  const result: Record<string, string[]> = {};
  for (const [type, query] of Object.entries(QUERY_BY_TYPE)) {
    try {
      const urls = await searchType(type, query, apiKey);
      if (urls.length > 0) result[type] = urls;
    } catch (err) {
      console.warn(`⚠️  Falha ao buscar fotos da Pexels para "${type}": ${(err as Error).message}`);
    }
  }
  return result;
}

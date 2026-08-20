/**
 * Confirmação best-effort de estações de metrô/trem contra o portal de
 * dados abertos real do Metrô SP (transparencia.metrosp.com.br, um DKAN
 * compatível com a API do CKAN).
 *
 * Por que só "confirmação" e não a fonte primária dos dados: o portal
 * expõe nomes de estação (CSV "Sigla das Estações") mas NÃO tem
 * coordenadas nem um campo de status de obra — por isso as coordenadas e
 * o status de cada projeto continuam vindo da base curada em
 * urban-projects.ts. Esta função só faz o cruzamento pra marcar quais
 * projetos do tipo "metro" batem com um nome oficialmente listado agora
 * no portal — um selo extra de "conferido via API oficial", não uma
 * dependência crítica: se a rede falhar ou o formato mudar, a função
 * retorna um Set vazio e todo projeto simplesmente fica sem o selo, sem
 * quebrar nada (mesmo padrão de degradação graciosa do AiService).
 */

const STATIONS_CSV_URL =
  'https://transparencia.metrosp.com.br/sites/default/files/Sigla%20das%20Esta%C3%A7%C3%B5es_1.csv';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * O CSV é uma tabela "irregular": blocos de colunas CÓDIGO;NOME por linha
 * de metrô, lado a lado, delimitados por ";". Em vez de tentar reconstruir
 * a tabela, extraímos qualquer célula que "parece nome de estação"
 * (tem letra minúscula/acento, mais de 4 caracteres) e ignora o resto
 * (códigos curtos em maiúsculas, cabeçalhos, células vazias).
 */
function extractStationNames(csvText: string): Set<string> {
  const names = new Set<string>();
  const cells = csvText.split(/[;\r\n]+/);
  for (const raw of cells) {
    const cell = raw.trim().replace(/^"|"$/g, '');
    if (cell.length < 5) continue;
    if (!/[a-zà-ú]/.test(cell)) continue; // sem minúscula/acentuada = provável código/cabeçalho
    names.add(normalize(cell));
  }
  return names;
}

/**
 * Busca a lista de estações no portal real do Metrô SP. Retorna um Set
 * vazio (nunca lança) se a rede falhar, o portal mudar de formato, ou
 * qualquer outro imprevisto acontecer.
 */
export async function fetchKnownStationNames(): Promise<Set<string>> {
  try {
    const res = await fetch(STATIONS_CSV_URL);
    if (!res.ok) {
      console.warn(`⚠️  Portal do Metrô SP respondeu ${res.status} — seguindo sem confirmação via API.`);
      return new Set();
    }
    const text = await res.text();
    const names = extractStationNames(text);
    if (names.size === 0) {
      console.warn('⚠️  CSV do Metrô SP veio vazio ou em formato inesperado — seguindo sem confirmação via API.');
    }
    return names;
  } catch (err) {
    console.warn(`⚠️  Falha ao buscar estações no portal do Metrô SP: ${(err as Error).message}`);
    return new Set();
  }
}

/** Verifica se o nome de uma estação (livre, ex.: "Estação Perdizes") consta no Set buscado. */
export function isStationKnown(stationName: string, known: Set<string>): boolean {
  const n = normalize(stationName);
  for (const candidate of known) {
    if (candidate.includes(n) || n.includes(candidate)) return true;
  }
  return false;
}

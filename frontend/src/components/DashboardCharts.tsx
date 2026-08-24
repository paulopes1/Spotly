'use client';

import { DashboardResponse } from '@/lib/types';

/**
 * Gráficos do dashboard.
 *
 * Decisões de visualização (mantidas de propósito, não mexer sem motivo):
 *  - Barras horizontais porque os rótulos são nomes longos ("Salão de Beleza",
 *    "Vila Madalena") — em colunas verticais eles ficariam inclinados ou cortados.
 *  - UMA cor para todas as barras. Colorir cada barra de um tom diferente
 *    conforme o valor duplicaria a informação que o comprimento já dá, e a
 *    categoria (tipo de negócio, bairro) não tem ordem natural de cor.
 *  - Série única ⇒ sem legenda: o título do card já diz o que está plotado.
 *  - Todo valor aparece escrito ao lado da barra. O tooltip (title) só
 *    acrescenta contexto (quantas buscas), nunca é o único jeito de ler o dado.
 *
 * Os dois gráficos são derivados no cliente a partir do histórico que a API
 * já devolve em /me/dashboard — nenhum endpoint novo foi necessário.
 */

const MAX_ROWS = 6;

interface Bar {
  label: string;
  value: number;
  /** Texto exibido ao lado da barra (já formatado). */
  display: string;
  /** Contexto extra que aparece só no hover. */
  hint: string;
}

function BarList({ bars, max, showTrack }: { bars: Bar[]; max: number; showTrack: boolean }) {
  return (
    <div className="space-y-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3" title={bar.hint}>
          <span className="w-32 shrink-0 text-label-sm text-on-surface-variant truncate" title={bar.label}>
            {bar.label}
          </span>
          <div className={`flex-1 h-5 rounded-[4px] ${showTrack ? 'bg-neutral-fill' : ''}`}>
            <div
              className="h-full bg-coral rounded-r-[4px]"
              style={{ width: `${max > 0 ? Math.max((bar.value / max) * 100, 2) : 0}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-label-sm text-on-surface tabular-nums">
            {bar.display}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  bars,
  max,
  showTrack,
  hiddenCount,
}: {
  title: string;
  subtitle: string;
  bars: Bar[];
  max: number;
  showTrack: boolean;
  hiddenCount: number;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-card p-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest">
      <h3 className="text-headline-md text-on-background">{title}</h3>
      <p className="text-label-sm text-on-surface-variant mt-1 mb-5">{subtitle}</p>

      {bars.length === 0 ? (
        <p className="text-body-md text-on-surface-variant py-6 text-center">
          Faça algumas buscas para este gráfico aparecer.
        </p>
      ) : (
        <>
          <BarList bars={bars} max={max} showTrack={showTrack} />
          {hiddenCount > 0 && (
            <p className="text-label-sm text-on-surface-variant mt-3">
              + {hiddenCount} {hiddenCount === 1 ? 'outro' : 'outros'} fora do top {MAX_ROWS}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Score médio do melhor resultado, agrupado por tipo de negócio. */
function scoreByBusiness(history: DashboardResponse['history']) {
  const acc = new Map<string, { total: number; count: number }>();
  for (const h of history) {
    if (!h.topResult) continue; // busca sem resultado não entra na média
    const cur = acc.get(h.businessLabel) ?? { total: 0, count: 0 };
    acc.set(h.businessLabel, { total: cur.total + h.topResult.score, count: cur.count + 1 });
  }

  const all = Array.from(acc.entries())
    .map(([label, { total, count }]) => {
      const avg = Math.round(total / count);
      return {
        label,
        value: avg,
        display: `${avg}%`,
        hint: `${label} — score médio de ${avg}% em ${count} ${count === 1 ? 'busca' : 'buscas'}`,
      };
    })
    .sort((a, b) => b.value - a.value);

  return { bars: all.slice(0, MAX_ROWS), hiddenCount: Math.max(0, all.length - MAX_ROWS) };
}

/** Quantidade de buscas por bairro. */
function searchesByNeighborhood(history: DashboardResponse['history']) {
  const acc = new Map<string, number>();
  for (const h of history) {
    if (!h.neighborhood) continue;
    acc.set(h.neighborhood, (acc.get(h.neighborhood) ?? 0) + 1);
  }

  const all = Array.from(acc.entries())
    .map(([label, count]) => ({
      label,
      value: count,
      display: String(count),
      hint: `${label} — ${count} ${count === 1 ? 'busca realizada' : 'buscas realizadas'}`,
    }))
    .sort((a, b) => b.value - a.value);

  return { bars: all.slice(0, MAX_ROWS), hiddenCount: Math.max(0, all.length - MAX_ROWS) };
}

export function DashboardCharts({ history }: { history: DashboardResponse['history'] }) {
  const business = scoreByBusiness(history);
  const neighborhoods = searchesByNeighborhood(history);

  const neighborhoodMax = Math.max(...neighborhoods.bars.map((b) => b.value), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      <ChartCard
        title="Compatibilidade por negócio"
        subtitle="Score médio do melhor imóvel encontrado em cada busca"
        bars={business.bars}
        max={100} // escala fixa: o score é sempre 0–100%
        showTrack
        hiddenCount={business.hiddenCount}
      />
      <ChartCard
        title="Bairros mais pesquisados"
        subtitle="Onde você tem concentrado a procura por ponto comercial"
        bars={neighborhoods.bars}
        max={neighborhoodMax} // contagem não tem teto natural: escala pelo maior
        showTrack={false}
        hiddenCount={neighborhoods.hiddenCount}
      />
    </div>
  );
}

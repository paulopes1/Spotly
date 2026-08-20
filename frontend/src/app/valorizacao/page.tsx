'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { MobileNav, Sidebar } from '@/components/Sidebar';
import { api } from '@/lib/api';
import {
  AppreciationResponse,
  NeighborhoodAppreciationDto,
  URBAN_PROJECT_STATUS_LABELS,
  URBAN_PROJECT_TYPE_ICONS,
  URBAN_PROJECT_TYPE_LABELS,
} from '@/lib/types';

// Mapa só no cliente (Mapbox/MapLibre dependem de window)
const AppreciationMap = dynamic(() => import('@/components/AppreciationMap').then((m) => m.AppreciationMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-highest">
      <span className="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
    </div>
  ),
});

function scoreLabel(score: number): string {
  if (score >= 80) return 'Muito alto';
  if (score >= 55) return 'Alto';
  if (score >= 30) return 'Moderado';
  return 'Baixo';
}

export default function ValorizacaoPage() {
  const [data, setData] = useState<AppreciationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api<AppreciationResponse>('/appreciation')
      .then((d) => {
        setData(d);
        setSelected(d.neighborhoods[0]?.neighborhood ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o indicador.'));
  }, []);

  const loading = !data && !error;
  const selectedNeighborhood: NeighborhoodAppreciationDto | undefined = useMemo(
    () => data?.neighborhoods.find((n) => n.neighborhood === selected),
    [data, selected],
  );

  return (
    <div className="bg-surface text-on-surface antialiased flex h-screen overflow-hidden">
      <Sidebar active="valorizacao" />

      <main className="flex-1 md:ml-64 h-full flex flex-col relative bg-surface-container-lowest">
        {/* Header */}
        <header className="bg-surface/80 backdrop-blur-md w-full top-0 sticky z-30 shadow-[0px_10px_40px_rgba(0,0,0,0.04)] border-b border-surface-container-highest">
          <div className="px-gutter py-5">
            <h2 className="text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-coral">insights</span>
              Sensor de Valorização
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              Bairros de São Paulo ranqueados por potencial de valorização — com base em obras próximas de
              metrô/trem, saúde e educação.
            </p>
          </div>
        </header>

        {error && (
          <div className="p-gutter">
            <p className="text-label-md text-error bg-error-container rounded-input px-4 py-3">{error}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Ranking */}
          <div className="w-full lg:w-[42%] xl:w-[38%] flex flex-col bg-surface-bright border-r border-surface-container-highest z-10 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-sm lg:p-gutter space-y-sm pb-24 md:pb-8">
              {loading &&
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-card p-4 border border-neutral-fill animate-pulse h-20" />
                ))}

              {data &&
                data.neighborhoods.map((n, i) => {
                  const isSelected = n.neighborhood === selected;
                  return (
                    <button
                      key={n.neighborhood}
                      onClick={() => setSelected(n.neighborhood)}
                      className={`w-full text-left rounded-card p-4 border transition-all ${
                        isSelected
                          ? 'bg-coral-tint border-coral/30 shadow-[0_8px_30px_rgba(216,90,48,0.12)]'
                          : 'bg-white border-neutral-fill hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-label-sm text-on-surface-variant w-5 shrink-0">#{i + 1}</span>
                          <div className="min-w-0">
                            <p className={`text-label-md truncate ${isSelected ? 'text-coral' : 'text-on-surface'}`}>
                              {n.neighborhood}
                            </p>
                            <p className="text-label-sm text-on-surface-variant">
                              {scoreLabel(n.score)} · {n.projects.length} projeto(s) por perto
                            </p>
                          </div>
                        </div>
                        <div
                          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-label-md font-semibold ${
                            isSelected ? 'bg-coral text-white' : 'bg-neutral-fill text-on-surface'
                          }`}
                        >
                          {n.score}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Detalhe do bairro selecionado */}
            {selectedNeighborhood && (
              <div className="border-t border-surface-container-highest bg-surface-bright/95 backdrop-blur-sm p-gutter max-h-[45%] overflow-y-auto custom-scrollbar">
                <h3 className="text-label-md text-on-surface mb-1">{selectedNeighborhood.neighborhood}</h3>
                <p className="text-label-sm text-on-surface-variant mb-3">
                  Projetos usados no cálculo do indicador — fonte citada em cada um.
                </p>
                <div className="space-y-2">
                  {selectedNeighborhood.projects.length === 0 && (
                    <p className="text-label-sm text-on-surface-variant">
                      Nenhum projeto cadastrado próximo o suficiente deste bairro ainda.
                    </p>
                  )}
                  {selectedNeighborhood.projects.map((p) => (
                    <a
                      key={p.id}
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl bg-neutral-fill hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-coral text-[20px] mt-0.5">
                        {URBAN_PROJECT_TYPE_ICONS[p.type]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-label-sm text-on-surface">{p.name}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {URBAN_PROJECT_TYPE_LABELS[p.type]} · {URBAN_PROJECT_STATUS_LABELS[p.status]} · {p.year} ·{' '}
                          {p.distanceKm}km
                          {p.apiVerified && ' · ✓ confirmado via API do Metrô'}
                        </p>
                        <p className="text-[11px] text-coral mt-1">Fonte: {p.sourceName}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mapa */}
          <div className="hidden lg:block flex-1 bg-surface-container-highest relative overflow-hidden">
            {data && <AppreciationMap neighborhoods={data.neighborhoods} selected={selected} onSelect={setSelected} />}
          </div>
        </div>

        {/* Nota metodológica */}
        <div className="px-gutter py-3 border-t border-surface-container-highest bg-surface-bright/60 text-[11px] text-on-surface-variant">
          Indicador experimental: combina uma base curada de projetos reais de infraestrutura (com fonte citada em
          cada item) com confirmação ao vivo, quando possível, no portal de dados abertos do Metrô SP. Não é
          recomendação de investimento.
          {data && !data.metroApiOk && ' No momento a confirmação ao vivo do Metrô está indisponível.'}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { MobileNav, Sidebar } from '@/components/Sidebar';
import { PropertyCard } from '@/components/PropertyCard';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SearchResponse, formatBRL } from '@/lib/types';

// Mapa só no cliente (Mapbox/MapLibre dependem de window)
const MapPanel = dynamic(() => import('@/components/MapPanel').then((m) => m.MapPanel), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-highest">
      <span className="material-symbols-outlined animate-spin text-on-surface-variant">progress_activity</span>
    </div>
  ),
});

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Espera o refresh silencioso da sessão terminar antes de buscar — numa
  // navegação "dura" (URL digitada, link externo, F5) o access token começa
  // vazio na memória; buscar antes do refresh resolver faz uma busca PRIVADA
  // (dona logada) ser tratada como anônima e voltar 404 mesmo com sessão
  // válida. Buscas anônimas continuam funcionando normalmente: authLoading
  // também vira false rápido pra quem não tem sessão nenhuma.
  useEffect(() => {
    if (authLoading) return;
    api<SearchResponse>(`/search/${id}`)
      .then((s) => {
        setSearch(s);
        setNewQuery(s.query);
        setSelectedId(s.results[0]?.id ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Busca não encontrada.'));
  }, [id, authLoading]);

  // Corações preenchidos: só faz sentido pra quem está logado.
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    api<string[]>('/me/saved-properties/ids')
      .then((ids) => setSavedIds(new Set(ids)))
      .catch(() => {
        /* silencioso — o coração só fica sem preencher se isso falhar */
      });
  }, [user]);

  async function toggleSave(propertyId: string) {
    if (!user) {
      router.push('/login');
      return;
    }
    const wasSaved = savedIds.has(propertyId);
    // Otimista: atualiza a UI antes da resposta do servidor.
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
    try {
      if (wasSaved) {
        await api(`/me/saved-properties/${propertyId}`, { method: 'DELETE' });
      } else {
        await api('/me/saved-properties', { method: 'POST', body: JSON.stringify({ propertyId }) });
      }
    } catch (e) {
      // Reverte em caso de falha (ex.: sessão expirou no meio do caminho).
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      if (e instanceof ApiError && e.status === 401) router.push('/login');
    }
  }

  async function handleNewSearch(e: FormEvent) {
    e.preventDefault();
    if (!newQuery.trim() || searching) return;
    setSearching(true);
    try {
      const s = await api<SearchResponse>('/search', {
        method: 'POST',
        body: JSON.stringify({ query: newQuery.trim() }),
      });
      router.push(`/resultados/${s.id}`);
      setSearch(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível buscar.');
    } finally {
      setSearching(false);
    }
  }

  function selectFromMap(resultId: string) {
    setSelectedId(resultId);
    document.getElementById(`card-${resultId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (error && !search) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">search_off</span>
        <p className="text-body-lg text-on-surface-variant">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary text-on-primary text-label-md px-6 py-3 rounded-btn"
        >
          Fazer nova busca
        </button>
      </div>
    );
  }

  const params = search?.params;
  const loading = !search;

  return (
    <div className="bg-surface text-on-surface antialiased flex h-screen overflow-hidden">
      <Sidebar active="map" />

      <main className="flex-1 md:ml-64 h-full flex flex-col relative bg-surface-container-lowest">
        {/* Header de busca (sticky) */}
        <header className="bg-surface/80 backdrop-blur-md w-full top-0 sticky z-30 shadow-[0px_10px_40px_rgba(0,0,0,0.04)] border-b border-surface-container-highest">
          <div className="flex justify-between items-center w-full px-gutter mx-auto h-20">
            <form onSubmit={handleNewSearch} className="flex-1 max-w-2xl flex items-center gap-4">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {searching ? 'progress_activity' : 'search'}
                </span>
                <input
                  className="w-full bg-neutral-fill border-0 rounded-input py-3 pl-12 pr-4 text-body-md text-on-surface focus:ring-2 focus:ring-coral transition-all outline-none"
                  placeholder="Descreva seu negócio, bairro e orçamento…"
                  type="text"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  maxLength={500}
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="bg-coral text-white p-3 rounded-input hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
                aria-label="Buscar"
              >
                <span className={`material-symbols-outlined ${searching ? 'animate-spin' : ''}`}>
                  {searching ? 'progress_activity' : 'arrow_forward'}
                </span>
              </button>
            </form>
            {params && (
              <div className="hidden lg:flex items-center gap-4 ml-6">
                <div className="text-right">
                  <p className="text-label-sm text-on-surface-variant">Região analisada</p>
                  <p className="text-label-md text-on-surface">
                    {params.localizacao?.bairro ?? params.localizacao?.cidade}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chips com as variáveis extraídas pela IA */}
          {params && (
            <div className="px-gutter pb-4 flex gap-3 overflow-x-auto no-scrollbar mx-auto w-full">
              <span className="flex items-center gap-2 px-4 py-2 bg-coral-tint text-coral rounded-full text-label-sm border border-coral/20 whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                {search?.businessLabel}
              </span>
              {params.localizacao?.bairro && (
                <span className="flex items-center gap-2 px-4 py-2 bg-neutral-fill text-on-surface rounded-full text-label-sm border border-transparent whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {params.localizacao.bairro}
                </span>
              )}
              {params.orcamento_max && (
                <span className="flex items-center gap-2 px-4 py-2 bg-neutral-fill text-on-surface rounded-full text-label-sm border border-transparent whitespace-nowrap">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Até {formatBRL(params.orcamento_max)}/mês
                </span>
              )}
              {params.preferencias?.map((pref) => (
                <span
                  key={pref}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-fill text-on-surface rounded-full text-label-sm border border-transparent whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  {pref}
                </span>
              ))}
              {search?.aiProvider === 'fallback' && (
                <span
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-label-sm whitespace-nowrap"
                  title="Sem chave da OpenAI configurada — análise pelo motor local"
                >
                  <span className="material-symbols-outlined text-[18px]">offline_bolt</span>
                  Modo demo
                </span>
              )}
            </div>
          )}
        </header>

        {/* Layout de dois painéis */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Lista de resultados */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col bg-surface-bright border-r border-surface-container-highest z-10 shadow-[10px_0_30px_rgba(0,0,0,0.02)] relative">
            <div className="p-gutter flex justify-between items-end border-b border-surface-container-highest bg-surface-bright/95 backdrop-blur-sm sticky top-0 z-20">
              <div>
                <h2 className="text-headline-md text-on-surface">
                  {loading ? 'Analisando…' : `${search.results.length} spots encontrados`}
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  {loading
                    ? 'cruzando dados do bairro'
                    : `ordenados por compatibilidade com ${search.businessLabel.toLowerCase()}`}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-label-sm text-on-surface-variant">Ordenado por</span>
                <span className="text-label-md text-primary">Score IA (↓)</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-sm lg:p-gutter space-y-sm pb-24 md:pb-8">
              {loading &&
                [0, 1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-card p-1 border border-neutral-fill animate-pulse">
                    <div className="h-48 rounded-[24px] bg-surface-container" />
                    <div className="p-sm space-y-3">
                      <div className="h-5 bg-surface-container rounded w-2/3" />
                      <div className="h-4 bg-surface-container rounded w-1/2" />
                    </div>
                  </div>
                ))}

              {!loading && search.results.length === 0 && (
                <div className="text-center py-16 px-6">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">
                    location_off
                  </span>
                  <h3 className="text-headline-md text-on-surface mb-2">Nenhum spot encontrado</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Tente ampliar o orçamento ou buscar em um bairro vizinho.
                  </p>
                </div>
              )}

              {!loading &&
                search.results.map((r, i) => (
                  <PropertyCard
                    key={r.id}
                    result={r}
                    rank={i}
                    selected={r.id === selectedId}
                    onSelect={() => setSelectedId(r.id)}
                    saved={savedIds.has(r.property.id)}
                    onToggleSave={() => toggleSave(r.property.id)}
                  />
                ))}
              <div className="h-8" />
            </div>
          </div>

          {/* Painel do mapa */}
          <div className="hidden lg:block flex-1 bg-surface-container-highest relative overflow-hidden">
            {!loading && (
              <MapPanel results={search.results} selectedId={selectedId} onSelect={selectFromMap} />
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

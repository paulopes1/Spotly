'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { TopNav } from '@/components/TopNav';
import { api } from '@/lib/api';
import { SearchResponse } from '@/lib/types';

/** Exemplos clicáveis que ensinam o formato de busca em linguagem natural. */
const EXAMPLES = [
  'Quero abrir uma academia em Pinheiros, pagando até 10 mil de aluguel',
  'Cafeteria na Vila Madalena, até 8 mil, perto do metrô',
  'Clínica odontológica nos Jardins com orçamento de 12 mil',
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: FormEvent) {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const search = await api<SearchResponse>('/search', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() }),
      });
      router.push(`/resultados/${search.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível buscar agora.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />

      <main className="flex-grow">
        {/* Hero */}
        <section className="w-full px-margin-mobile md:px-gutter max-w-container-max mx-auto pt-[80px] pb-[60px] md:pt-[140px] md:pb-[120px] flex flex-col items-center text-center">
          <h1 className="text-display-lg-mobile md:text-display-lg text-on-background max-w-4xl mb-md">
            Encontre o{' '}
            <span className="text-primary relative inline-block">
              spot
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30"
                preserveAspectRatio="none"
                viewBox="0 0 100 10"
              >
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>{' '}
            certo para o seu negócio.
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mb-lg">
            Descreva o que você precisa em uma frase — nossa IA cruza fluxo de pessoas,
            concorrência e perfil do bairro para ranquear os melhores pontos comerciais.
          </p>

          {/* Barra de busca em linguagem natural (adaptação do search bar do design) */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-3xl bg-surface-container-lowest rounded-card p-2 flex flex-col md:flex-row items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-surface-container-high transition-all focus-within:border-primary focus-within:shadow-[0_8px_40px_rgba(216,90,48,0.15)] relative z-10"
          >
            <div className="flex-grow flex items-center w-full bg-surface-container-low rounded-input px-4 py-3 group">
              <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-background placeholder:text-on-surface-variant/60 ml-2 outline-none"
                placeholder='Ex.: "quero abrir uma academia em Pinheiros, pagando até 10 mil"'
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={500}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full md:w-auto bg-primary text-on-primary text-label-md px-8 py-4 rounded-input hover:opacity-90 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? (
                <>
                  Analisando spots…
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                </>
              ) : (
                <>
                  Buscar Spots
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-label-md text-error bg-error-container rounded-input px-4 py-2">{error}</p>
          )}

          {/* Chips de exemplo */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="px-4 py-2 bg-coral-tint text-coral rounded-full text-label-sm border border-coral/20 hover:bg-coral hover:text-white transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </section>

        {/* Bento Grid / Stats */}
        <section id="como-funciona" className="w-full bg-surface-container py-[80px] md:py-[120px]">
          <div className="px-margin-mobile md:px-gutter max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-md md:gap-gutter">
              {/* Card principal */}
              <div className="md:col-span-8 bg-surface-container-lowest rounded-card p-lg border border-surface-container-high shadow-sm flex flex-col justify-between overflow-hidden relative group">
                <div className="z-10 relative">
                  <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center mb-md shadow-sm">
                    <span className="material-symbols-outlined text-primary icon-fill">analytics</span>
                  </div>
                  <h3 className="text-headline-lg text-on-background mb-sm">Compatibilidade explicada</h3>
                  <p className="text-body-md text-on-surface-variant max-w-md">
                    Cada imóvel recebe um score 0–100 calculado a partir de fluxo de pessoas,
                    concorrência direta, renda do entorno, pontos âncora e adequação ao seu
                    orçamento — e a IA explica em português os prós e contras de cada ponto.
                  </p>
                </div>
                <div className="mt-lg rounded-xl overflow-hidden h-48 md:h-64 relative border border-surface-container-high bg-gradient-to-br from-coral-tint via-surface-container-low to-tertiary-fixed flex items-center justify-center">
                  {/* Mock de heatmap no estilo do design */}
                  <div className="absolute w-40 h-40 bg-coral/30 blur-3xl rounded-full left-10 top-6" />
                  <div className="absolute w-24 h-24 bg-primary/40 blur-2xl rounded-full right-20 bottom-4" />
                  <div className="absolute w-16 h-16 bg-coral/50 blur-xl rounded-full right-40 top-10" />
                  <div className="relative flex items-center gap-8">
                    {[94, 88, 82].map((s, i) => (
                      <div key={s} className={`flex flex-col items-center ${i > 0 ? 'opacity-70' : ''}`}>
                        <div
                          className={`${i === 0 ? 'w-14 h-14 bg-coral text-white shadow-[0_8px_16px_rgba(216,90,48,0.4)]' : 'w-11 h-11 bg-white text-on-surface shadow-md'} rounded-full flex items-center justify-center font-bold border-2 border-white`}
                        >
                          {s}
                        </div>
                        <div className={`w-3 h-3 ${i === 0 ? 'bg-coral' : 'bg-white'} rotate-45 -mt-1.5 border-b border-r border-white`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna secundária */}
              <div className="md:col-span-4 flex flex-col gap-md md:gap-gutter">
                <div className="flex-1 bg-surface-container-lowest rounded-card p-md border border-surface-container-high shadow-sm flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center mb-sm">
                    <span className="material-symbols-outlined text-primary icon-fill">speed</span>
                  </div>
                  <div className="text-display-lg text-primary mb-1">3x</div>
                  <h4 className="text-headline-md text-on-background mb-1">Mais rápido</h4>
                  <p className="text-body-md text-on-surface-variant">
                    Da ideia à shortlist de pontos em segundos, não semanas.
                  </p>
                </div>
                <div className="flex-1 bg-primary text-on-primary rounded-card p-md shadow-[0_8px_30px_rgba(216,90,48,0.2)] flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <h4 className="text-headline-md mb-2 relative z-10">Busca em linguagem natural</h4>
                  <p className="text-body-md text-on-primary/90 relative z-10 mb-4">
                    Sem filtros infinitos: diga o que você quer abrir, onde e quanto pode pagar.
                  </p>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 text-label-md text-white hover:underline relative z-10 w-max"
                  >
                    Experimentar <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full">
        <div className="w-full py-xl px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-headline-md font-bold text-primary">Spotly AI</span>
            <p className="text-body-md text-on-surface-variant">
              © 2026 Spotly AI. Inteligência para pontos comerciais.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-sm gap-y-2">
            {['Privacidade', 'Termos de Uso', 'API', 'Contato'].map((l) => (
              <a
                key={l}
                className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

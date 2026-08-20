'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardResponse, formatBRL } from '@/lib/types';

function StatCard({ icon, label, value, badge }: { icon: string; label: string; value: string; badge?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-card p-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-coral-tint text-primary flex items-center justify-center">
          <span className="material-symbols-outlined icon-fill text-[24px]">{icon}</span>
        </div>
        {badge && (
          <span className="bg-surface-container px-3 py-1 rounded-full text-label-sm text-on-surface-variant flex items-center">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-body-md text-on-surface-variant">{label}</p>
        <h3 className="text-headline-lg text-on-background mt-1">{value}</h3>
      </div>
    </div>
  );
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora mesmo';
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} hora${h > 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Ontem' : `Há ${d} dias`;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    api<DashboardResponse>('/me/dashboard')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar o painel.'));
  }, [authLoading, user, router]);

  if (authLoading || (!data && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-on-surface-variant text-[36px]">
          progress_activity
        </span>
      </div>
    );
  }

  const firstName = user?.name.split(' ')[0] ?? '';
  const hasSearches = (data?.history.length ?? 0) > 0;

  return (
    <div className="bg-surface text-on-surface antialiased flex h-screen overflow-hidden">
      <Sidebar active="dashboard" />

      <main className="flex-1 md:ml-64 h-full overflow-y-auto bg-surface-bright flex flex-col">
        {/* App bar mobile */}
        <header className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-surface-container-high">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-sm icon-fill">analytics</span>
            </div>
            <h1 className="text-headline-md font-bold text-primary">Spotly AI</h1>
          </Link>
        </header>

        <div className="p-gutter md:p-lg max-w-container-max mx-auto w-full flex-1 flex flex-col space-y-lg">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">
                Bem-vindo de volta, {firstName}!
              </h2>
              <p className="text-body-lg text-on-surface-variant mt-2">
                Aqui está o resumo das suas buscas por pontos comerciais.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="bg-primary text-on-primary text-label-md py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex items-center"
              >
                <span className="material-symbols-outlined mr-2">search</span>
                Nova busca
              </Link>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary border-2 border-surface shadow-sm font-bold text-body-lg">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-label-md text-error bg-error-container rounded-input px-4 py-3">{error}</p>
          )}

          {data && (
            <>
              {/* Bento grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                  <StatCard
                    icon="search"
                    label="Buscas Realizadas"
                    value={String(data.stats.totalSearches)}
                  />
                  <StatCard
                    icon="real_estate_agent"
                    label="Propriedades Analisadas"
                    value={String(data.stats.propertiesAnalyzed)}
                  />
                  <StatCard
                    icon="workspace_premium"
                    label="Melhor Compatibilidade"
                    value={data.stats.bestScore ? `${data.stats.bestScore}%` : '—'}
                  />
                  <StatCard
                    icon="trending_up"
                    label="Score Médio"
                    value={data.stats.avgScore ? `${data.stats.avgScore}%` : '—'}
                  />
                </div>

                {/* Ações rápidas */}
                <div className="lg:col-span-4 flex flex-col gap-gutter">
                  <div className="bg-surface-container-lowest rounded-card p-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest h-full flex flex-col">
                    <h3 className="text-headline-md text-on-background mb-6">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      {[
                        { icon: 'add_location_alt', label: 'Nova Busca', href: '/' },
                        { icon: 'history', label: 'Histórico', href: '#historico' },
                        { icon: 'tune', label: 'Preferências', href: '#' },
                        { icon: 'share', label: 'Compartilhar', href: '#' },
                      ].map((a) => (
                        <Link
                          key={a.label}
                          href={a.href}
                          className="bg-surface-container hover:bg-surface-container-high rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">{a.icon}</span>
                          </div>
                          <span className="text-label-md text-on-surface">{a.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Histórico de buscas */}
              <div
                id="historico"
                className="bg-surface-container-lowest rounded-card p-md lg:p-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-container-highest"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-headline-md text-on-background">Buscas Recentes</h3>
                </div>

                {!hasSearches ? (
                  /* Estado vazio */
                  <div className="flex flex-col items-center text-center py-16 px-6">
                    <div className="w-20 h-20 rounded-full bg-coral-tint flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-[40px] text-coral">travel_explore</span>
                    </div>
                    <h4 className="text-headline-md text-on-background mb-2">
                      Você ainda não fez nenhuma busca
                    </h4>
                    <p className="text-body-md text-on-surface-variant max-w-md mb-6">
                      Descreva o negócio que quer abrir — bairro, orçamento e o que mais importar —
                      e a IA encontra os pontos comerciais mais compatíveis.
                    </p>
                    <Link
                      href="/"
                      className="bg-primary text-on-primary text-label-md py-3 px-8 rounded-btn shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">search</span>
                      Fazer minha primeira busca
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {data.history.map((h, i) => (
                      <div key={h.id}>
                        {i > 0 && <div className="h-px w-full bg-surface-container-highest mx-4 my-1" />}
                        <Link
                          href={`/resultados/${h.id}`}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-surface-container-highest"
                        >
                          <div className="flex items-center space-x-4 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                              <span className="material-symbols-outlined">search</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-label-md text-on-background truncate">
                                {h.businessLabel}
                                {h.neighborhood ? ` — ${h.neighborhood}` : ''}
                                {h.budget ? ` · até ${formatBRL(h.budget)}` : ''}
                              </h4>
                              <p className="text-body-md text-on-surface-variant truncate">
                                “{h.query}” · {timeAgo(h.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 ml-4">
                            {h.topResult && (
                              <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-coral-tint text-coral rounded-full text-label-sm">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                Top {h.topResult.score}%
                              </span>
                            )}
                            <span className="material-symbols-outlined text-on-surface-variant">
                              chevron_right
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="w-full py-md px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest mt-auto rounded-xl">
            <span className="text-label-sm text-on-surface-variant">
              © 2026 Spotly AI. Inteligência para pontos comerciais.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

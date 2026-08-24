'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MobileNav, Sidebar } from '@/components/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PROPERTY_TYPE_LABELS, SavedPropertyDto, formatBRL } from '@/lib/types';

export default function SavedPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedPropertyDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    api<SavedPropertyDto[]>('/me/saved-properties')
      .then(setSaved)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar imóveis salvos.'));
  }, [authLoading, user, router]);

  async function remove(propertyId: string) {
    setRemovingId(propertyId);
    try {
      await api(`/me/saved-properties/${propertyId}`, { method: 'DELETE' });
      setSaved((prev) => prev?.filter((s) => s.property.id !== propertyId) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível remover.');
    } finally {
      setRemovingId(null);
    }
  }

  if (authLoading || (!saved && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-on-surface-variant text-[36px]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased flex h-screen overflow-hidden">
      <Sidebar active="salvos" />

      <main className="flex-1 md:ml-64 h-full overflow-y-auto bg-surface-bright flex flex-col">
        <header className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-surface-container-high">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-sm icon-fill">analytics</span>
            </div>
            <h1 className="text-headline-md font-bold text-primary">Spotly AI</h1>
          </Link>
        </header>

        <div className="p-gutter md:p-lg max-w-container-max mx-auto w-full flex-1 flex flex-col space-y-lg">
          <div>
            <h2 className="text-display-lg-mobile md:text-display-lg text-on-background">Imóveis Salvos</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">
              Pontos comerciais que você guardou pra revisitar depois.
            </p>
          </div>

          {error && (
            <p className="text-label-md text-error bg-error-container rounded-input px-4 py-3">{error}</p>
          )}

          {saved && saved.length === 0 && !error && (
            <div className="flex flex-col items-center text-center py-16 px-6 bg-surface-container-lowest rounded-card border border-surface-container-highest">
              <div className="w-20 h-20 rounded-full bg-coral-tint flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[40px] text-coral">favorite</span>
              </div>
              <h4 className="text-headline-md text-on-background mb-2">Nenhum imóvel salvo ainda</h4>
              <p className="text-body-md text-on-surface-variant max-w-md mb-6">
                Toque no coração de um imóvel nos resultados de busca pra guardá-lo aqui.
              </p>
              <Link
                href="/"
                className="bg-primary text-on-primary text-label-md py-3 px-8 rounded-btn shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">search</span>
                Fazer uma busca
              </Link>
            </div>
          )}

          {saved && saved.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {saved.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-card p-1 border border-neutral-fill shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                >
                  <div className="relative h-40 rounded-[24px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover"
                      src={s.property.imageUrl}
                      alt={s.property.title}
                    />
                    <button
                      onClick={() => remove(s.property.id)}
                      disabled={removingId === s.property.id}
                      aria-label="Remover dos salvos"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px] text-coral icon-fill">favorite</span>
                    </button>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-label-sm text-on-surface-variant shadow-sm">
                      {PROPERTY_TYPE_LABELS[s.property.propertyType] ?? s.property.propertyType} • {s.property.areaM2}m²
                    </div>
                  </div>
                  <div className="p-sm">
                    <h3 className="text-headline-md text-on-surface truncate">{s.property.title}</h3>
                    <p className="text-body-md text-on-surface-variant truncate">{s.property.address}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-headline-md text-on-surface">{formatBRL(s.property.rentPrice)}</p>
                        <p className="text-label-sm text-on-surface-variant">/mês • {s.property.neighborhood}</p>
                      </div>
                      <span className="text-label-sm text-on-surface-variant">
                        Salvo em {new Date(s.savedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="w-full py-md px-gutter max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest mt-auto rounded-xl">
            <span className="text-label-sm text-on-surface-variant">
              © 2026 Spotly AI. Inteligência para pontos comerciais.
            </span>
          </footer>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

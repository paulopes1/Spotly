'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Sidebar fixa de 256px usada nas telas de resultados e dashboard —
 * estrutura e classes fiéis ao HTML do Stitch.
 */
export function Sidebar({ active }: { active: 'dashboard' | 'map' | 'valorizacao' }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const itemBase =
    'text-on-surface-variant flex items-center p-3 mx-2 hover:bg-surface-container-high rounded-xl text-label-md transition-colors';
  const itemActive =
    'bg-primary-container text-on-primary-container rounded-xl mx-2 flex items-center p-3 text-label-md scale-[0.97] transition-all shadow-sm';

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low shadow-sm flex-col py-6 space-y-2 z-40 hidden md:flex">
      <Link href="/" className="px-6 mb-8 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined icon-fill">analytics</span>
        </div>
        <div>
          <h1 className="text-headline-md font-bold text-primary">Spotly AI</h1>
          <p className="text-label-sm text-on-surface-variant">Premium Insights</p>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        <Link href="/dashboard" className={active === 'dashboard' ? itemActive : itemBase}>
          <span className="material-symbols-outlined mr-3">dashboard</span>
          Dashboard
        </Link>
        <Link href="/" className={active === 'map' ? itemActive : itemBase}>
          <span className={`material-symbols-outlined mr-3 ${active === 'map' ? 'fill' : ''}`}>map</span>
          Nova Busca
        </Link>
        <Link href="/valorizacao" className={active === 'valorizacao' ? itemActive : itemBase}>
          <span className={`material-symbols-outlined mr-3 ${active === 'valorizacao' ? 'fill' : ''}`}>insights</span>
          Valorização
        </Link>
        <span className={`${itemBase} opacity-50 cursor-not-allowed`}>
          <span className="material-symbols-outlined mr-3">favorite</span>
          Imóveis Salvos
        </span>
      </div>

      <div className="px-4 mt-auto mb-4">
        <Link
          href="/"
          className="w-full bg-primary text-on-primary py-3 rounded-btn text-label-md hover:bg-primary/90 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">search</span>
          Nova busca
        </Link>
      </div>

      <div className="px-2 space-y-1 border-t border-surface-container-highest pt-4 mx-4">
        {user ? (
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="w-full text-on-surface-variant flex items-center p-2 hover:bg-surface-container-high rounded-xl text-label-sm"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
            Sair {user.name ? `(${user.name.split(' ')[0]})` : ''}
          </button>
        ) : (
          <Link
            href="/login"
            className="text-on-surface-variant flex items-center p-2 hover:bg-surface-container-high rounded-xl text-label-sm"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">login</span>
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}

/** Barra de navegação inferior mobile (tela de resultados). */
export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-md border-t border-surface-container-highest z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[24px] mb-1">dashboard</span>
          <span className="text-[10px] font-semibold">Painel</span>
        </Link>
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-coral relative">
          <div className="absolute -top-1 w-12 h-1 bg-coral rounded-b-full" />
          <span className="material-symbols-outlined text-[24px] mb-1 fill">search</span>
          <span className="text-[10px] font-bold">Buscar</span>
        </Link>
        <Link
          href="/login"
          className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[24px] mb-1">person</span>
          <span className="text-[10px] font-semibold">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}

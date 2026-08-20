'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

/** Header glassmorphism da landing — fiel ao HTML exportado do Stitch. */
export function TopNav() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-surface/80 backdrop-blur-md w-full top-0 sticky z-50 shadow-[0px_10px_40px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <span className="text-headline-md font-bold text-primary">Spotly AI</span>
        </Link>

        {/* Navegação (desktop) */}
        <nav className="hidden md:flex items-center gap-md">
          <Link
            href="/"
            className="text-label-md text-primary border-b-2 border-primary pb-1"
          >
            Explorar
          </Link>
          <Link
            href="/dashboard"
            className="text-label-md text-on-surface-variant hover:text-primary hover:bg-secondary-container/10 transition-all duration-300 rounded-lg px-2 py-1"
          >
            Dashboard
          </Link>
          <a
            href="#como-funciona"
            className="text-label-md text-on-surface-variant hover:text-primary hover:bg-secondary-container/10 transition-all duration-300 rounded-lg px-2 py-1"
          >
            Como funciona
          </a>
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-sm">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:inline">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center text-label-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="bg-primary text-on-primary text-label-md px-6 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm"
              >
                Começar agora
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

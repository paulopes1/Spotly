'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

/** Casca visual compartilhada das telas de login/cadastro (design system Coral Energy). */
export function AuthCard({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center px-margin-mobile py-12">
      <Link href="/" className="flex items-center gap-sm mb-8">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
          <span className="material-symbols-outlined">location_on</span>
        </div>
        <span className="text-headline-lg font-bold text-primary">Spotly AI</span>
      </Link>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-card p-lg border border-surface-container-high shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h1 className="text-headline-lg text-on-background mb-2">{title}</h1>
        <p className="text-body-md text-on-surface-variant mb-6">{subtitle}</p>
        {children}
      </div>

      <div className="mt-6 text-body-md text-on-surface-variant">{footer}</div>
    </div>
  );
}

export function Field({
  label,
  icon,
  ...props
}: { label: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="text-label-md text-on-surface block mb-1.5">{label}</span>
      <div className="flex items-center bg-neutral-fill rounded-input px-4 py-3 focus-within:ring-2 focus-within:ring-coral transition-all">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
        <input
          className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-background placeholder:text-on-surface-variant/60 ml-2 outline-none"
          {...props}
        />
      </div>
    </label>
  );
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotly AI — Encontre o spot certo para o seu negócio',
  description:
    'Plataforma de inteligência imobiliária: descreva seu negócio em linguagem natural e receba os pontos comerciais mais compatíveis, com score e análise de IA.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="light">
      <head>
        {/* Fontes carregadas via <link> (mesmo método do export do Stitch) —
            mantém o build independente de rede, diferente do next/font. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background text-body-md antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

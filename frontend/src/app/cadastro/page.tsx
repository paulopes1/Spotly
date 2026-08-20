'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthCard, Field } from '@/components/AuthCard';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Salve suas buscas e acompanhe os melhores spots para o seu negócio."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Field
          label="Nome"
          icon="person"
          type="text"
          required
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="E-mail"
          icon="mail"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          icon="lock"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres, letras e números"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-label-md text-error bg-error-container rounded-input px-4 py-2 mb-4">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary text-label-md py-4 rounded-btn hover:bg-primary-container transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Criando conta…' : 'Criar conta grátis'}
          {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
        </button>
      </form>
    </AuthCard>
  );
}

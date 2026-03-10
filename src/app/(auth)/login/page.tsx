'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">SNS Growth OS</h1>
          <p className="text-sm text-neutral-500 mt-2">SNS運用を仕組み化する</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-sm">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <p className="text-center text-sm text-neutral-500">
            アカウントがない場合は{' '}
            <Link href="/signup" className="text-brand-600 hover:text-brand-700 underline">
              サインアップ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

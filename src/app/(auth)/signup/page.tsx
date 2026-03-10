'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Create default workspace
    if (data.user) {
      await supabase.from('workspaces').insert({
        user_id: data.user.id,
        name: 'My Workspace',
      });
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">SNS Growth OS</h1>
          <p className="text-sm text-neutral-500 mt-2">アカウントを作成する</p>
        </div>
        <form onSubmit={handleSignup} className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div>
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
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
              placeholder="8文字以上"
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '作成中...' : 'サインアップ'}
          </Button>
          <p className="text-center text-sm text-neutral-500">
            アカウントをお持ちの場合は{' '}
            <Link href="/login" className="text-neutral-900 underline">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

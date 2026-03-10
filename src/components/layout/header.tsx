'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 lg:pl-60 border-t-2 border-t-brand-500">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900">SNS Growth OS</h2>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">ログアウト</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

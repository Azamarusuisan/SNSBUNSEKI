import { redirect } from 'next/navigation';
import { isDemoMode, DEMO_WORKSPACE } from '@/lib/demo';
import { ChatContent } from './chat-content';

export default async function ChatPage() {
  if (isDemoMode()) {
    return <ChatContent workspace={DEMO_WORKSPACE} />;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!workspace) redirect('/dashboard');
  return <ChatContent workspace={workspace} />;
}

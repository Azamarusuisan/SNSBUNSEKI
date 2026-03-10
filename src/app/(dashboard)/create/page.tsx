import { redirect } from 'next/navigation';
import { isDemoMode, DEMO_WORKSPACE } from '@/lib/demo';
import { CreateContent } from './create-content';

export default async function CreatePage() {
  if (isDemoMode()) {
    return <CreateContent workspace={DEMO_WORKSPACE} />;
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
  return <CreateContent workspace={workspace} />;
}

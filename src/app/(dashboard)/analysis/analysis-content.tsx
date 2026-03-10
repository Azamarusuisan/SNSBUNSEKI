'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, platformLabel, platformColor } from '@/lib/utils';
import { DEMO_POSTS, DEMO_POST_METRICS, DEMO_COMPLETION_HISTORY } from '@/lib/demo';
import type { Workspace } from '@/lib/types';
import { BarChart3 } from 'lucide-react';
import { SkeletonKPI, SkeletonChart, SkeletonTable } from '@/components/ui/skeleton';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

interface PostWithMetrics {
  id: string;
  platform: string;
  theme: string;
  hook: string;
  created_at: string;
  post_type: string;
  metrics: { views: number; likes: number; comments: number; shares: number; saves: number } | null;
}

export function AnalysisContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const [completionHistory, setCompletionHistory] = useState<{ date: string; rate: number; done: number; total: number }[]>([]);
  const [postsWithMetrics, setPostsWithMetrics] = useState<PostWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        const metricsMap = new Map(DEMO_POST_METRICS.map(m => [m.post_id, m]));
        setPostsWithMetrics(DEMO_POSTS.map(p => ({
          id: p.id, platform: p.platform, theme: p.theme,
          hook: p.hook, created_at: p.created_at, post_type: p.post_type,
          metrics: metricsMap.get(p.id) || null,
        })));
        setCompletionHistory(DEMO_COMPLETION_HISTORY);
      } else {
        const { getRecentCompletionRate } = await import('@/app/actions/tasks');
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const [history, postsRes] = await Promise.all([
          getRecentCompletionRate(workspace.id, 30),
          supabase.from('posts').select('id, platform, theme, hook, created_at, post_type')
            .eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(20),
        ]);
        setCompletionHistory(history);

        const posts = postsRes.data || [];
        const withMetrics: PostWithMetrics[] = [];
        for (const post of posts) {
          const { data: md } = await supabase.from('post_metrics')
            .select('views, likes, comments, shares, saves').eq('post_id', post.id)
            .order('captured_at', { ascending: false }).limit(1);
          withMetrics.push({ ...post, metrics: md?.[0] || null });
        }
        setPostsWithMetrics(withMetrics);
      }
      setLoading(false);
    }
    load();
  }, [workspace.id, isDemo]);

  const totalPosts = postsWithMetrics.length;
  const postsWithData = postsWithMetrics.filter(p => p.metrics);
  const avgLikes = postsWithData.length > 0
    ? Math.round(postsWithData.reduce((s, p) => s + (p.metrics?.likes || 0), 0) / postsWithData.length) : 0;
  const avgViews = postsWithData.length > 0
    ? Math.round(postsWithData.reduce((s, p) => s + (p.metrics?.views || 0), 0) / postsWithData.length) : 0;
  const avgCompletion = completionHistory.length > 0
    ? Math.round(completionHistory.reduce((s, h) => s + h.rate, 0) / completionHistory.length) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-20 rounded bg-neutral-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
          <SkeletonKPI />
        </div>
        <SkeletonChart />
        <SkeletonTable rows={5} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">分析</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <p className="text-xs text-neutral-500 mb-1">総投稿数</p>
          <p className="text-2xl font-bold text-neutral-900">{totalPosts}</p>
        </Card>
        <Card className="p-4 animate-fade-in-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <p className="text-xs text-neutral-500 mb-1">平均いいね</p>
          <p className="text-2xl font-bold text-neutral-900">{avgLikes}</p>
        </Card>
        <Card className="p-4 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <p className="text-xs text-neutral-500 mb-1">平均表示回数</p>
          <p className="text-2xl font-bold text-neutral-900">{avgViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <p className="text-xs text-neutral-500 mb-1">平均タスク達成率</p>
          <p className="text-2xl font-bold text-neutral-900">{avgCompletion}%</p>
        </Card>
      </div>

      <Card className="p-5">
        <CardTitle className="mb-4">タスク達成率の推移</CardTitle>
        {completionHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
              <rect x="6" y="36" width="6" height="6" rx="1" fill="#d4d4d4" />
              <rect x="15" y="30" width="6" height="12" rx="1" fill="#d4d4d4" />
              <rect x="24" y="24" width="6" height="18" rx="1" fill="#d4d4d4" />
              <rect x="33" y="18" width="6" height="24" rx="1" fill="#d4d4d4" />
              <path d="M8 32 L18 26 L27 20 L36 14" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
            </svg>
            <p className="text-sm text-neutral-500 font-medium mb-1">運用を始めると、ここに進捗が表示されます</p>
            <p className="text-xs text-neutral-400">毎日のタスク達成率がグラフで可視化されます</p>
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-32">
            {completionHistory.map((entry, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-neutral-500 font-medium">{entry.rate}%</span>
                <div
                  className={cn(
                    'w-full rounded-t transition-all duration-500 min-h-[2px]',
                    entry.rate >= 80 ? 'bg-gradient-to-t from-brand-600 to-brand-400' : entry.rate >= 50 ? 'bg-brand-300' : 'bg-brand-200'
                  )}
                  style={{ height: `${Math.max(entry.rate * 0.9, 4)}%`, animationDelay: `${i * 30}ms` }}
                />
                <span className="text-[10px] text-neutral-400">{entry.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <CardTitle className="mb-4">投稿パフォーマンス</CardTitle>
        {postsWithMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <BarChart3 className="w-12 h-12 text-neutral-300 mb-4" />
            <p className="text-sm font-medium text-neutral-700 mb-1">投稿データが集まると、ここに分析結果が表示されます</p>
            <p className="text-xs text-neutral-400 mb-4 text-center">投稿を記録してパフォーマンスを入力すると、<br />どの投稿が効果的だったか一目で分かります</p>
            <Link href="/posts">
              <Button size="sm">
                投稿ログへ移動
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 px-2 text-xs text-neutral-500 font-medium">日付</th>
                  <th className="text-left py-2 px-2 text-xs text-neutral-500 font-medium">媒体</th>
                  <th className="text-left py-2 px-2 text-xs text-neutral-500 font-medium">テーマ</th>
                  <th className="text-right py-2 px-2 text-xs text-neutral-500 font-medium">表示</th>
                  <th className="text-right py-2 px-2 text-xs text-neutral-500 font-medium">いいね</th>
                  <th className="text-right py-2 px-2 text-xs text-neutral-500 font-medium">コメント</th>
                  <th className="text-right py-2 px-2 text-xs text-neutral-500 font-medium">シェア</th>
                </tr>
              </thead>
              <tbody>
                {postsWithMetrics.map(post => (
                  <tr key={post.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-150">
                    <td className="py-2 px-2 text-neutral-600">
                      {new Date(post.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2 px-2">
                      <Badge className={cn('text-xs', platformColor(post.platform))}>{platformLabel(post.platform)}</Badge>
                    </td>
                    <td className="py-2 px-2 text-neutral-900 max-w-[200px] truncate">{post.theme || post.hook || '-'}</td>
                    <td className="py-2 px-2 text-right text-neutral-600">{post.metrics?.views?.toLocaleString() ?? '-'}</td>
                    <td className="py-2 px-2 text-right text-neutral-600">{post.metrics?.likes ?? '-'}</td>
                    <td className="py-2 px-2 text-right text-neutral-600">{post.metrics?.comments ?? '-'}</td>
                    <td className="py-2 px-2 text-right text-neutral-600">{post.metrics?.shares ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

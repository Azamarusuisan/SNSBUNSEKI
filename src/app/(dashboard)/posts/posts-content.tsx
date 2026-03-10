'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { cn, platformLabel, platformColor } from '@/lib/utils';
import { DEMO_POSTS, DEMO_POST_METRICS } from '@/lib/demo';
import type { Workspace, Post } from '@/lib/types';
import { Plus, X, BarChart2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SkeletonFormArea, SkeletonPostList } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

interface PostWithLocalMetrics extends Post {
  _metrics?: { views: number; likes: number; comments: number; shares: number; saves: number };
}

export function PostsContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithLocalMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [metricsPostId, setMetricsPostId] = useState<string | null>(null);

  const [platform, setPlatform] = useState('x');
  const [theme, setTheme] = useState('');
  const [hook, setHook] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [postType, setPostType] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [saves, setSaves] = useState('');
  const [showMetricsConfirm, setShowMetricsConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        const metricsMap = new Map(DEMO_POST_METRICS.map(m => [m.post_id, m]));
        setPosts(DEMO_POSTS.map(p => ({ ...p, _metrics: metricsMap.get(p.id) })));
      } else {
        const { getPosts } = await import('@/app/actions/posts');
        const p = await getPosts(workspace.id);
        setPosts(p);
      }
      setLoading(false);
    }
    load();
  }, [workspace.id, isDemo]);

  const handleCreatePost = async () => {
    try {
      if (isDemo) {
        const newPost: PostWithLocalMetrics = {
          id: `p-new-${Date.now()}`, workspace_id: workspace.id,
          social_account_id: null, platform: platform as Post['platform'],
          posted_at: new Date().toISOString(), content_draft_id: null,
          theme, hook, body, cta: ctaText, hashtags: [],
          post_type: postType, media_url: '', external_post_url: externalUrl,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        };
        setPosts(prev => [newPost, ...prev]);
      } else {
        const { createPost } = await import('@/app/actions/posts');
        const post = await createPost(workspace.id, {
          platform: platform as Post['platform'], theme, hook, body,
          cta: ctaText, post_type: postType, external_post_url: externalUrl,
        });
        if (post) setPosts(prev => [post, ...prev]);
      }
      resetForm();
      toast({ type: 'success', message: '投稿を記録しました' });
    } catch {
      toast({ type: 'error', message: '投稿の記録に失敗しました' });
    }
  };

  const handleSaveMetrics = async () => {
    if (!metricsPostId) return;
    try {
      if (isDemo) {
        setPosts(prev => prev.map(p =>
          p.id === metricsPostId
            ? { ...p, _metrics: { views: parseInt(views) || 0, likes: parseInt(likes) || 0, comments: parseInt(comments) || 0, shares: parseInt(shares) || 0, saves: parseInt(saves) || 0 } }
            : p
        ));
      } else {
        const { savePostMetrics } = await import('@/app/actions/posts');
        await savePostMetrics(metricsPostId, {
          views: parseInt(views) || 0, likes: parseInt(likes) || 0,
          comments: parseInt(comments) || 0, shares: parseInt(shares) || 0, saves: parseInt(saves) || 0,
        });
      }
      setMetricsPostId(null);
      setViews(''); setLikes(''); setComments(''); setShares(''); setSaves('');
      toast({ type: 'success', message: '結果を保存しました' });
    } catch {
      toast({ type: 'error', message: '結果の保存に失敗しました' });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setPlatform('x'); setTheme(''); setHook(''); setBody('');
    setCtaText(''); setPostType(''); setExternalUrl('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonFormArea />
        <SkeletonPostList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">投稿ログ</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />投稿を記録
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4 animate-scale-in" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <CardTitle>投稿を記録</CardTitle>
            <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><Label>媒体</Label><Select value={platform} onChange={e => setPlatform(e.target.value)}><option value="x">X</option><option value="instagram">Instagram</option><option value="note">note</option></Select></div>
            <div><Label>テーマ</Label><Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="投稿のテーマ" /></div>
            <div><Label>投稿タイプ</Label><Input value={postType} onChange={e => setPostType(e.target.value)} placeholder="例: テキスト, リール, 記事" /></div>
          </div>
          <div><Label>フック（冒頭）</Label><Input value={hook} onChange={e => setHook(e.target.value)} placeholder="投稿の冒頭文" /></div>
          <div><Label>本文</Label><Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="投稿内容" rows={4} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>CTA</Label><Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="行動喚起" /></div>
            <div><Label>投稿URL</Label><Input value={externalUrl} onChange={e => setExternalUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <Button onClick={handleCreatePost}>保存</Button>
        </Card>
      )}

      {metricsPostId && (
        <Card className="p-5 space-y-4 border-blue-200 animate-scale-in" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between">
            <CardTitle>結果を入力</CardTitle>
            <button onClick={() => setMetricsPostId(null)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div><Label>表示回数</Label><Input type="number" value={views} onChange={e => setViews(e.target.value)} placeholder="0" /></div>
            <div><Label>いいね</Label><Input type="number" value={likes} onChange={e => setLikes(e.target.value)} placeholder="0" /></div>
            <div><Label>コメント</Label><Input type="number" value={comments} onChange={e => setComments(e.target.value)} placeholder="0" /></div>
            <div><Label>シェア</Label><Input type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="0" /></div>
            <div><Label>保存</Label><Input type="number" value={saves} onChange={e => setSaves(e.target.value)} placeholder="0" /></div>
          </div>
          <Button onClick={() => {
            const post = posts.find(p => p.id === metricsPostId);
            if (post && (post as PostWithLocalMetrics)._metrics) {
              setShowMetricsConfirm(true);
            } else {
              handleSaveMetrics();
            }
          }}>結果を保存</Button>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-6">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-5">
            <rect x="16" y="56" width="8" height="16" rx="2" fill="#d4d4d4" transform="rotate(180 16 56)" />
            <rect x="28" y="56" width="8" height="24" rx="2" fill="#d4d4d4" transform="rotate(180 28 56)" />
            <rect x="40" y="56" width="8" height="20" rx="2" fill="#a3a3a3" transform="rotate(180 40 56)" />
            <rect x="52" y="56" width="8" height="32" rx="2" fill="#a3a3a3" transform="rotate(180 52 56)" />
            <rect x="64" y="56" width="8" height="40" rx="2" fill="#a3a3a3" transform="rotate(180 64 56)" />
            <path d="M10 52 L26 38 L38 44 L50 28 L68 18" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="68" cy="18" r="3" fill="#a3a3a3" />
          </svg>
          <p className="text-base font-medium text-neutral-700 mb-1">投稿を記録して成長を可視化しましょう</p>
          <p className="text-sm text-neutral-400 mb-5 text-center">投稿の内容とパフォーマンスを記録すると、<br />どんな投稿が伸びるか分析できます</p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            最初の投稿を記録する
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post, index) => (
            <Card key={post.id} className="p-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn('text-xs', platformColor(post.platform))}>{platformLabel(post.platform)}</Badge>
                    {post.post_type && <span className="text-xs text-neutral-400">{post.post_type}</span>}
                    <span className="text-xs text-neutral-400">{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                    {(post as PostWithLocalMetrics)._metrics && (
                      <span className="text-xs text-neutral-500 ml-2">
                        {(post as PostWithLocalMetrics)._metrics!.views.toLocaleString()} views / {(post as PostWithLocalMetrics)._metrics!.likes} likes
                      </span>
                    )}
                  </div>
                  {post.theme && <p className="text-sm font-medium text-neutral-900">{post.theme}</p>}
                  {post.hook && <p className="text-sm text-neutral-600 mt-0.5">{post.hook}</p>}
                  {post.body && <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{post.body}</p>}
                  {post.external_post_url && (
                    <a href={post.external_post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">投稿を見る →</a>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMetricsPostId(post.id)} title="結果を入力">
                  <BarChart2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm: Overwrite metrics */}
      <ConfirmDialog
        isOpen={showMetricsConfirm}
        title="指標の上書き"
        message="指標を上書きしますか？"
        confirmLabel="上書きする"
        variant="warning"
        onConfirm={() => {
          setShowMetricsConfirm(false);
          handleSaveMetrics();
        }}
        onCancel={() => setShowMetricsConfirm(false)}
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { cn, platformLabel, platformColor } from '@/lib/utils';
import { DEMO_TREND_SOURCES, DEMO_TREND_POSTS } from '@/lib/demo';
import type { Workspace, TrendSource, TrendPost, TrendAnalysis } from '@/lib/types';
import { Plus, X, Sparkles, ExternalLink, Eye, FileSearch } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SkeletonSourceBadges, SkeletonPostList } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

const DEMO_ANALYSIS = `## フックパターン
実績数字（月収100万）を冒頭に置くことで権威性と好奇心を同時に刺激。

## 構成パターン
実績提示 → 「シンプル」と前置き → 具体的ステップ箇条書き → 期間明示 → CTA

## CTAパターン
「フォローで全テンプレ公開中→」と限定コンテンツへの誘導。

## トーン
自信に満ちているが押し付けがましくない。短文で歯切れが良い。

## なぜ伸びたか
1. 具体的な数字が信頼感を生む
2. 「超シンプル」が心理的ハードルを下げる
3. 箇条書きで読みやすい
4. 「6ヶ月続けただけ」が再現性を感じさせる

## あなたへのアクション
- 次の投稿で具体的な数字をフックに使う
- ステップを4つ以内の箇条書きで構成する`;

export function TrendsContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [sources, setSources] = useState<TrendSource[]>([]);
  const [posts, setPosts] = useState<TrendPost[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, TrendAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzeConfirmPost, setAnalyzeConfirmPost] = useState<TrendPost | null>(null);

  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState('reference_url');
  const [sourcePlatform, setSourcePlatform] = useState('x');

  const [postTitle, setPostTitle] = useState('');
  const [postHook, setPostHook] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [postPlatform, setPostPlatform] = useState('x');
  const [postRawText, setPostRawText] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        setSources(DEMO_TREND_SOURCES);
        setPosts(DEMO_TREND_POSTS);
      } else {
        const { getTrendSources, getTrendPosts, getTrendAnalyses } = await import('@/app/actions/trends');
        const [s, p, a] = await Promise.all([
          getTrendSources(workspace.id), getTrendPosts(workspace.id), getTrendAnalyses(workspace.id),
        ]);
        setSources(s);
        setPosts(p);
        const aMap = new Map<string, TrendAnalysis>();
        a.forEach(analysis => { if (analysis.trend_post_id && !aMap.has(analysis.trend_post_id)) aMap.set(analysis.trend_post_id, analysis); });
        setAnalyses(aMap);
      }
      setLoading(false);
    }
    load();
  }, [workspace.id, isDemo]);

  const handleAddSource = async () => {
    if (!sourceName.trim()) {
      toast({ type: 'warning', message: 'ソース名を入力してください' });
      return;
    }
    try {
    if (isDemo) {
      const s: TrendSource = {
        id: `ts-new-${Date.now()}`, workspace_id: workspace.id,
        source_type: sourceType as TrendSource['source_type'],
        platform: sourcePlatform as TrendSource['platform'],
        source_name: sourceName, source_url: sourceUrl, is_active: true,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setSources(prev => [s, ...prev]);
    } else {
      const { createTrendSource } = await import('@/app/actions/trends');
      const s = await createTrendSource(workspace.id, {
        source_name: sourceName, source_url: sourceUrl,
        source_type: sourceType as TrendSource['source_type'],
        platform: sourcePlatform as TrendSource['platform'],
      });
      if (s) setSources(prev => [s, ...prev]);
    }
    setSourceName(''); setSourceUrl(''); setShowSourceForm(false);
    toast({ type: 'success', message: 'ソースを追加しました' });
    } catch {
      toast({ type: 'error', message: 'ソースの追加に失敗しました' });
    }
  };

  const handleAddPost = async () => {
    if (!postTitle.trim() && !postRawText.trim()) {
      toast({ type: 'warning', message: 'タイトルまたは投稿全文を入力してください' });
      return;
    }
    try {
    if (isDemo) {
      const p: TrendPost = {
        id: `tp-new-${Date.now()}`, workspace_id: workspace.id, trend_source_id: null,
        platform: postPlatform as TrendPost['platform'],
        title: postTitle, hook: postHook, body_summary: postBody,
        source_url: postUrl, posted_at: null,
        metrics_snapshot_json: {}, raw_text: postRawText,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setPosts(prev => [p, ...prev]);
    } else {
      const { createTrendPost } = await import('@/app/actions/trends');
      const p = await createTrendPost(workspace.id, {
        title: postTitle, hook: postHook, body_summary: postBody,
        source_url: postUrl, platform: postPlatform as TrendPost['platform'], raw_text: postRawText,
      });
      if (p) setPosts(prev => [p, ...prev]);
    }
    setPostTitle(''); setPostHook(''); setPostBody(''); setPostUrl(''); setPostRawText(''); setShowPostForm(false);
    toast({ type: 'success', message: '参考投稿を追加しました' });
    } catch {
      toast({ type: 'error', message: '投稿の追加に失敗しました' });
    }
  };

  const handleAnalyze = async (post: TrendPost) => {
    setAnalyzingId(post.id);
    try {
      let result: string;
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1200));
        result = DEMO_ANALYSIS;
      } else {
        const { analyzeTrendPost } = await import('@/app/actions/ai');
        const content = post.raw_text || `タイトル: ${post.title}\nフック: ${post.hook}\n内容: ${post.body_summary}`;
        result = await analyzeTrendPost(workspace.id, post.id, content);
      }
      setAnalyses(prev => {
        const next = new Map(prev);
        next.set(post.id, {
          id: '', workspace_id: workspace.id, trend_post_id: post.id,
          analysis_summary: result, hook_pattern: '', structure_pattern: '',
          cta_pattern: '', tone_pattern: '', suggested_action: '',
          created_by: 'ai', created_at: new Date().toISOString(),
        });
        return next;
      });
      toast({ type: 'success', message: 'AI分析が完了しました' });
    } catch {
      toast({ type: 'error', message: 'AI分析に失敗しました' });
    }
    setAnalyzingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-52 rounded bg-neutral-200 animate-pulse" />
        </div>
        <SkeletonSourceBadges count={4} />
        <SkeletonPostList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">参考投稿 / 競合分析</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowSourceForm(!showSourceForm)}>
            <Plus className="w-4 h-4 mr-1" />ソース追加
          </Button>
          <Button size="sm" onClick={() => setShowPostForm(!showPostForm)}>
            <Plus className="w-4 h-4 mr-1" />投稿を追加
          </Button>
        </div>
      </div>

      {showSourceForm && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>競合/参考ソースを追加</CardTitle>
            <button onClick={() => setShowSourceForm(false)} className="text-neutral-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><Label>名前</Label><Input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder="アカウント名/サイト名" /></div>
            <div><Label>URL</Label><Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." /></div>
            <div><Label>タイプ</Label><Select value={sourceType} onChange={e => setSourceType(e.target.value)}><option value="competitor_account">競合アカウント</option><option value="reference_url">参考URL</option><option value="manual_note">メモ</option></Select></div>
            <div><Label>媒体</Label><Select value={sourcePlatform} onChange={e => setSourcePlatform(e.target.value)}><option value="x">X</option><option value="instagram">Instagram</option><option value="note">note</option><option value="other">その他</option></Select></div>
          </div>
          <Button size="sm" onClick={handleAddSource}>追加</Button>
        </Card>
      )}

      {showPostForm && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>参考投稿を追加</CardTitle>
            <button onClick={() => setShowPostForm(false)} className="text-neutral-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><Label>タイトル</Label><Input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="投稿タイトル" /></div>
            <div><Label>URL</Label><Input value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="https://..." /></div>
            <div><Label>媒体</Label><Select value={postPlatform} onChange={e => setPostPlatform(e.target.value)}><option value="x">X</option><option value="instagram">Instagram</option><option value="note">note</option><option value="other">その他</option></Select></div>
          </div>
          <div><Label>フック（冒頭）</Label><Input value={postHook} onChange={e => setPostHook(e.target.value)} placeholder="最初の一文" /></div>
          <div><Label>投稿全文（分析用）</Label><Textarea value={postRawText} onChange={e => setPostRawText(e.target.value)} placeholder="投稿のテキスト全文をコピペ" rows={4} /></div>
          <div><Label>要約メモ</Label><Textarea value={postBody} onChange={e => setPostBody(e.target.value)} placeholder="この投稿について気づいたこと" rows={2} /></div>
          <Button size="sm" onClick={handleAddPost}>追加</Button>
        </Card>
      )}

      {sources.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-neutral-600 mb-2">登録ソース</h2>
          <div className="flex flex-wrap gap-2">
            {sources.map((s, index) => (
              <Badge key={s.id} className={cn('text-xs px-3 py-1 animate-scale-in', platformColor(s.platform || 'other'))} style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}>
                {s.source_name}
                {s.source_url && (
                  <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="ml-1">
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-10 px-6">
          <Eye className="w-10 h-10 text-neutral-300 mb-3" />
          <p className="text-sm font-medium text-neutral-700 mb-1">競合アカウントを登録して、トレンドを分析しましょう</p>
          <p className="text-xs text-neutral-400 mb-4 text-center">ベンチマークとなるアカウントやURLを登録すると、<br />効果的な投稿パターンが見えてきます</p>
          <Button size="sm" onClick={() => setShowSourceForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            ソースを追加する
          </Button>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-14 px-6">
          <FileSearch className="w-12 h-12 text-neutral-300 mb-4" />
          <p className="text-base font-medium text-neutral-700 mb-1">参考投稿を追加して、AIに分析してもらいましょう</p>
          <p className="text-sm text-neutral-400 mb-5 text-center">伸びている投稿を保存すると、AIがフックや構成の<br />パターンを分析して、あなたの投稿に活かせます</p>
          <Button size="sm" onClick={() => setShowPostForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            参考投稿を追加する
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const analysis = analyses.get(post.id);
            return (
              <Card key={post.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-xs', platformColor(post.platform || 'other'))}>
                        {platformLabel(post.platform || 'other')}
                      </Badge>
                      <span className="text-xs text-neutral-400">{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                    {post.title && <p className="text-sm font-medium">{post.title}</p>}
                    {post.hook && <p className="text-sm text-neutral-600">{post.hook}</p>}
                    {post.body_summary && <p className="text-xs text-neutral-400 mt-1">{post.body_summary}</p>}
                    {post.source_url && (
                      <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">元投稿を見る →</a>
                    )}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setAnalyzeConfirmPost(post)} disabled={analyzingId === post.id}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    {analyzingId === post.id ? '分析中...' : 'AI分析'}
                  </Button>
                </div>
                {analysis && (
                  <div className="bg-neutral-50 rounded-lg p-4 mt-2 animate-fade-in" style={{ animationFillMode: 'both' }}>
                    <p className="text-xs font-semibold text-neutral-500 mb-2">AI分析結果</p>
                    <div className="whitespace-pre-wrap text-sm text-neutral-700">
                      {analysis.analysis_summary}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirm: AI analysis */}
      <ConfirmDialog
        isOpen={analyzeConfirmPost !== null}
        title="AI分析の実行"
        message="AI分析を実行しますか？（API利用量に影響します）"
        confirmLabel="実行する"
        variant="info"
        onConfirm={() => {
          if (analyzeConfirmPost) handleAnalyze(analyzeConfirmPost);
          setAnalyzeConfirmPost(null);
        }}
        onCancel={() => setAnalyzeConfirmPost(null)}
      />
    </div>
  );
}

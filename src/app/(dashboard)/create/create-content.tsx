'use client';

import { useState } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Workspace, ContentType } from '@/lib/types';
import { Sparkles, Save, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

const tabs: { key: ContentType; label: string; platform: string }[] = [
  { key: 'x_post', label: 'X投稿', platform: 'x' },
  { key: 'instagram_caption', label: 'Instagram', platform: 'instagram' },
  { key: 'note_article', label: 'note記事', platform: 'note' },
  { key: 'video_prompt', label: '動画プロンプト', platform: 'video' },
];

const toneOptions = [
  { value: 'professional', label: 'プロフェッショナル' },
  { value: 'casual', label: 'カジュアル' },
  { value: 'friendly', label: 'フレンドリー' },
  { value: 'authoritative', label: '権威的' },
  { value: 'humorous', label: 'ユーモラス' },
  { value: 'neutral', label: 'ニュートラル' },
];

const ctaOptions = [
  { value: '', label: 'CTAなし' },
  { value: 'follow', label: 'フォローを促す' },
  { value: 'like', label: 'いいねを促す' },
  { value: 'comment', label: 'コメントを促す' },
  { value: 'share', label: 'シェアを促す' },
  { value: 'link', label: 'リンクへ誘導' },
  { value: 'save', label: '保存を促す' },
];

const DEMO_RESPONSES: Record<string, string> = {
  x_post: `SNS運用で最も大切なのは「毎日投稿」ではありません。

大切なのは「型を持つこと」です。

型があれば：
・考える時間が1/3に
・クオリティが安定する
・フォロワーが何を期待すればいいかわかる

おすすめの3つの型：
1. 体験談 → 共感を生む
2. ノウハウ → 保存される
3. 問いかけ → リプが増える

この3つを曜日ローテするだけで、運用がラクになります。

#SNS運用 #仕組み化`,
  instagram_caption: `【知らないと損】SNS運用が続かない人の共通点

それは「完璧を目指しすぎること」です。

実は伸びてるアカウントほど
80%の完成度で投稿してます。

✅ 完璧じゃなくていい
✅ 型を決めればラクになる
✅ まずは30日続けることが最優先

あなたはどのタイプ？
コメントで教えてください👇

---
保存しておくと後で見返せます💡

#SNS運用 #Instagram運用 #マーケティング #ビジネス`,
  note_article: `# SNS運用を「仕組み化」して毎日続ける方法

## はじめに

SNS運用が続かない最大の原因は、毎日「何を投稿しよう？」と考えることです。
この記事では、考えなくても運用が回る「仕組み化」の方法をお伝えします。

## 1. 投稿の型を3つ決める

まずは投稿の型を3つだけ決めましょう。

- **体験談型**: 自分の経験から学びを共有
- **ノウハウ型**: 具体的なテクニックを紹介
- **問いかけ型**: フォロワーに質問を投げかける

## 2. 曜日ごとにローテーションする

月水金: 体験談
火木: ノウハウ
土日: 問いかけ

## 3. テンプレートを用意する

各型ごとにテンプレートを作っておけば、穴埋めするだけで投稿が完成します。

## まとめ

仕組み化のポイントは「考える回数を減らすこと」。
まずは1週間、この方法を試してみてください。`,
  video_prompt: `## 動画プロンプト

### タイトル
「SNS運用が続かない人の3つの特徴」

### 台本構成

**シーン1: フック (0:00-0:05)**
ナレーション: 「SNS運用、また三日坊主で終わってませんか？」
テロップ: 【また挫折？】SNS運用が続かない3つの理由

**シーン2: 問題提起 (0:05-0:15)**
ナレーション: 「実はSNSが続かない人には共通点があります」
テロップ: こんな人は要注意👇

**シーン3: 本編 (0:15-0:45)**
ナレーション:
1. 毎日0から考えている → 型を作ろう
2. 完璧を目指しすぎ → 80%でOK
3. 数字ばかり見ている → 行動量に集中

**シーン4: CTA (0:45-0:55)**
ナレーション: 「フォローすると明日から使えるSNS運用テクを毎日お届けします」
テロップ: フォローで毎日テクニック配信中！

### 尺
55秒

### BGM
アップテンポ、ポジティブ系`,
};

export function CreateContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ContentType>('x_post');
  const [theme, setTheme] = useState('');
  const [tone, setTone] = useState('casual');
  const [cta, setCta] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentTab = tabs.find(t => t.key === activeTab)!;

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast({ type: 'warning', message: 'テーマを入力してください' });
      return;
    }
    setLoading(true);
    setSaved(false);

    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1000));
        setGeneratedContent(DEMO_RESPONSES[activeTab] || 'デモ: 生成されたコンテンツがここに表示されます');
      } else {
        const { generateContent } = await import('@/app/actions/ai');
        const content = await generateContent(workspace.id, {
          platform: currentTab.platform, contentType: activeTab,
          theme, tone, cta, additionalContext,
        });
        setGeneratedContent(content);
      }
      toast({ type: 'success', message: 'コンテンツを生成しました' });
    } catch {
      toast({ type: 'error', message: 'コンテンツの生成に失敗しました' });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    try {
      if (isDemo) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const { saveDraft } = await import('@/app/actions/posts');
        await saveDraft(workspace.id, {
          platform: currentTab.platform as 'x' | 'instagram' | 'note' | 'video',
          content_type: activeTab, theme, body: generatedContent, tone, cta, status: 'draft',
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      toast({ type: 'success', message: '下書きを保存しました' });
    } catch {
      toast({ type: 'error', message: '保存に失敗しました' });
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ type: 'success', message: 'クリップボードにコピーしました' });
    } catch {
      toast({ type: 'error', message: 'コピーに失敗しました' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">コンテンツ作成</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setGeneratedContent(''); }}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0 animate-fade-in" style={{ animationFillMode: 'both' }}>
        {/* Input */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <CardTitle>入力</CardTitle>
            <div>
              <Label htmlFor="theme">テーマ *</Label>
              <Input id="theme" value={theme} onChange={e => setTheme(e.target.value)} placeholder="例: SNS運用の時間管理術" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>トーン</Label>
                <Select value={tone} onChange={e => setTone(e.target.value)}>
                  {toneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>CTA</Label>
                <Select value={cta} onChange={e => setCta(e.target.value)}>
                  {ctaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label>追加コンテキスト（任意）</Label>
              <Textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} placeholder="ターゲット層や含めたいキーワードなど" rows={3} />
            </div>
            <Button onClick={handleGenerate} disabled={loading || !theme.trim()} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? '生成中...' : '生成する'}
            </Button>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>生成結果</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!generatedContent}>
                  {copied ? <Check className="w-4 h-4 animate-checkmark" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-1">{copied ? 'コピー済' : 'コピー'}</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSave} disabled={!generatedContent || saved}>
                  <Save className="w-4 h-4 mr-1" />
                  {saved ? '保存済' : '下書き保存'}
                </Button>
              </div>
            </div>
            {generatedContent ? (
              <div className="whitespace-pre-wrap text-sm text-neutral-700 bg-neutral-50 rounded-lg p-4 min-h-[200px] animate-fade-in-up" style={{ animationFillMode: 'both' }}>
                {generatedContent}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-neutral-400 bg-neutral-50 rounded-lg">
                テーマを入力して生成してください
              </div>
            )}
          </Card>

          {activeTab === 'video_prompt' && (
            <Card className="p-4">
              <p className="text-sm text-neutral-600 mb-2">外部動画ツール</p>
              <a href="https://www.higgsfield.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                Higgsfield で動画を作成 →
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

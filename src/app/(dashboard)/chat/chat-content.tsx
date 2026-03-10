'use client';

import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Workspace } from '@/lib/types';
import { Send, Plus, MessageCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/providers/toast-provider';

function useIsDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  '今日何を優先すべき？': `今の状況から、以下の優先順位をおすすめします：

1. **X投稿を1本公開** — 今の勢いを維持しましょう。朝7時台が狙い目です。
2. **参考投稿分析を1件** — 伸びているアカウントのパターンを1つ学びましょう。
3. **Instagram文案の準備** — 明日の投稿に備えましょう。

最も大事なのはXの投稿頻度を落とさないことです。まずはそこから。`,
  'XとInstagramどっちを伸ばすべき？': `現状の数字を見ると：

**X（1,240フォロワー）** の方が成長速度が速いですね。
テキストベースなので投稿の手間も少なく、毎日続けやすいです。

**おすすめ戦略：**
- Xを主軸にして毎日投稿
- Instagramは週3回ペースに
- Xで反応が良かったテーマをInstagramに展開

まずはXでフォロワー3,000人を目指し、そこからInstagramに力を入れましょう。`,
  '伸びた投稿の共通点を教えて': `直近の投稿データを見ると、伸びた投稿には以下の共通点があります：

1. **具体的な数字がフックにある** — 「2時間→30分」「3ヶ月で1000人」
2. **箇条書きで読みやすい** — 3〜4項目が最適
3. **朝の時間帯** — 7〜9時の投稿がリーチ2倍
4. **CTAが明確** — 「フォローして」「保存して」

**次に試すべきこと：**
- 次の投稿でフックに具体数字を入れる
- 投稿時間を朝7時に固定してみる`,
  'この方向性で合ってる？': `いい方向に進んでいると思います！

**強みとして見えていること：**
- タスクの達成率が安定してきている
- X投稿のペースが良い
- フォロワー増加が加速傾向

**もう少し強化したいこと：**
- 参考投稿の分析頻度を増やす（週3→5回）
- CTAのバリエーションを増やす
- noteとの連携で権威性を高める

焦らず、今のペースで1ヶ月続けましょう。結果は必ず出ます。`,
};

export function ChatContent({ workspace }: { workspace: Workspace }) {
  const isDemo = useIsDemo();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [groupId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    scrollToBottom();

    try {
      let response: string;
      if (isDemo) {
        await new Promise(r => setTimeout(r, 800));
        response = DEMO_RESPONSES[userMsg] ||
          `SNS運用に関するご質問ですね。\n\n「${userMsg}」について回答します。\n\nまず大切なのは、日々の運用を継続することです。完璧を目指すよりも、毎日少しずつ進めることが成長の鍵です。\n\n具体的には：\n1. 投稿の型を固める\n2. 分析と改善を繰り返す\n3. 競合から学ぶ\n\nこの3つを意識しながら進めていきましょう。`;
      } else {
        const { chatWithAi } = await import('@/app/actions/ai');
        response = await chatWithAi(workspace.id, groupId, userMsg);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      toast({ type: 'error', message: 'メッセージの送信に失敗しました' });
    }
    setLoading(false);
    scrollToBottom();
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    '今日何を優先すべき？',
    'XとInstagramどっちを伸ばすべき？',
    '伸びた投稿の共通点を教えて',
    'この方向性で合ってる？',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">AI相談</h1>
        <Button variant="secondary" size="sm" onClick={() => {
          if (messages.length > 0) {
            setShowClearConfirm(true);
          } else {
            handleNewChat();
          }
        }}>
          <Plus className="w-4 h-4 mr-1" />新しい会話
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-lg font-medium text-neutral-700 mb-1">AIにSNS運用を相談しよう</p>
            <p className="text-sm text-neutral-400 mb-6 max-w-sm">投稿の方向性、優先すべきアクション、伸びるコンテンツの作り方など、何でも聞いてください</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  className="px-4 py-2.5 text-sm text-left bg-neutral-50 text-neutral-600 rounded-lg hover:bg-neutral-100 border border-neutral-200 transition-colors animate-scale-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex animate-fade-in-up', msg.role === 'user' ? 'justify-end' : 'justify-start')} style={{ animationFillMode: 'both' }}>
            <div className={cn(
              'max-w-[85%] lg:max-w-[70%] rounded-2xl px-4 py-3',
              msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white border border-neutral-200'
            )}>
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Enter で送信、Shift+Enter で改行)"
          rows={2}
          className="resize-none"
        />
        <Button onClick={handleSend} disabled={!input.trim() || loading} className="self-end">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Confirm: Clear chat */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="会話のクリア"
        message="会話をクリアしますか？"
        confirmLabel="クリアする"
        variant="warning"
        onConfirm={() => {
          setShowClearConfirm(false);
          handleNewChat();
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

// AI Provider Abstraction
// Supports mock, OpenAI, Anthropic — switchable via env

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  provider: string;
}

export interface AiProvider {
  generate(messages: AiMessage[], options?: AiGenerateOptions): Promise<AiResponse>;
}

export interface AiGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const AI_MODEL = process.env.AI_MODEL || 'mock';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '1000', 10);
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7');

// Cost per 1K tokens (approximate, for tracking)
const COST_MAP: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'claude-haiku-4-5-20251001': { input: 0.001, output: 0.005 },
  'claude-sonnet-4-6': { input: 0.003, output: 0.015 },
  mock: { input: 0, output: 0 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = COST_MAP[model] || COST_MAP['mock'];
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}

// Mock provider for development
class MockAiProvider implements AiProvider {
  async generate(messages: AiMessage[], options?: AiGenerateOptions): Promise<AiResponse> {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const inputLen = messages.reduce((sum, m) => sum + m.content.length, 0);

    // Generate contextual mock responses
    let content = 'これはモックレスポンスです。AI_PROVIDERを設定してください。';

    if (lastUserMsg.includes('レポート') || lastUserMsg.includes('report')) {
      content = `## 今日の振り返り\n\n今日のタスク達成率は良好です。\n\n### 良かった点\n- タスクを着実にこなしました\n- 投稿の質が安定しています\n\n### 改善点\n- 投稿時間帯をもう少し最適化できます\n\n### 明日の優先事項\n- Xの投稿を朝の時間帯に集中させましょう\n- 参考投稿の分析を1件行いましょう`;
    } else if (lastUserMsg.includes('文案') || lastUserMsg.includes('投稿')) {
      content = `SNS運用を継続するコツは「仕組み化」です。\n\n毎日同じ時間に、同じフローで投稿することで、考える負荷を減らせます。\n\n今日から始められることは？\n→ 投稿テンプレートを3つ用意すること。\n\n#SNS運用 #仕組み化`;
    } else if (lastUserMsg.includes('分析')) {
      content = `### 分析結果\n\nこの投稿が伸びた要因:\n1. **フック**: 最初の一文で具体的な数字を使っている\n2. **構成**: 問題提起→解決策→CTAの流れが明確\n3. **トーン**: 親しみやすく、押し付けがましくない\n\n### あなたへのアクション\n- 次回の投稿では具体的な数字をフックに使ってみましょう`;
    } else if (lastUserMsg.includes('優先') || lastUserMsg.includes('何を')) {
      content = `今の状況から、以下の優先順位をおすすめします:\n\n1. **X投稿を1本**: 今の勢いを維持しましょう\n2. **参考投稿分析**: 伸びているアカウントのパターンを1つ学びましょう\n3. **Instagram文案の準備**: 明日の投稿に備えましょう\n\n最も大事なのはXの投稿頻度を落とさないことです。`;
    }

    return {
      content,
      inputTokens: Math.floor(inputLen / 4),
      outputTokens: Math.floor(content.length / 4),
      model: 'mock',
      provider: 'mock',
    };
  }
}

// OpenAI provider
class OpenAiProvider implements AiProvider {
  async generate(messages: AiMessage[], options?: AiGenerateOptions): Promise<AiResponse> {
    const model = options?.model || AI_MODEL;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || AI_MAX_TOKENS,
        temperature: options?.temperature ?? AI_TEMPERATURE,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return {
      content: data.choices[0].message.content || '',
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      model,
      provider: 'openai',
    };
  }
}

let _provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (_provider) return _provider;

  switch (AI_PROVIDER) {
    case 'openai':
      _provider = new OpenAiProvider();
      break;
    case 'mock':
    default:
      _provider = new MockAiProvider();
      break;
  }

  return _provider;
}

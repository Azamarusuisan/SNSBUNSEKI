'use server';

import { createClient } from '@/lib/supabase/server';
import { getAiProvider, estimateCost, type AiMessage } from '@/lib/ai/provider';
import type { DailyReport } from '@/lib/types';

async function logUsage(
  workspaceId: string,
  featureName: string,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  const supabase = await createClient();
  const cost = estimateCost(model, inputTokens, outputTokens);
  await supabase.from('ai_usage_logs').insert({
    workspace_id: workspaceId,
    feature_name: featureName,
    provider,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost: cost,
  });
}

export async function generateDailyReport(
  workspaceId: string,
  date: string,
  context: {
    completionRate: number;
    tasksCompleted: number;
    tasksTotal: number;
    postsCount: number;
    incompleteTasks: string[];
  }
): Promise<DailyReport | null> {
  const supabase = await createClient();

  // Check if report already exists
  const { data: existing } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('report_date', date)
    .single();

  if (existing) return existing;

  const ai = getAiProvider();
  const messages: AiMessage[] = [
    {
      role: 'system',
      content: `あなたはSNS運用コーチです。日次レポートを生成してください。
簡潔に、実用的に、励まし+改善点のバランスで書いてください。
各セクションは2-3文以内にしてください。日本語で書いてください。`,
    },
    {
      role: 'user',
      content: `今日のデータ:
- 日付: ${date}
- タスク達成率: ${context.completionRate}%
- 完了タスク: ${context.tasksCompleted}/${context.tasksTotal}
- 投稿数: ${context.postsCount}
- 未完了タスク: ${context.incompleteTasks.join(', ') || 'なし'}

以下の形式で日次レポートを生成してください:
## 総括
(1-2文)

## 良かった点
(1-2点)

## 改善点
(1点)

## 明日の優先事項
(1-2点)

## 一言
(改善提案を1文で)`,
    },
  ];

  const result = await ai.generate(messages, { maxTokens: 500 });

  // Parse AI response into sections
  const lines = result.content.split('\n');
  let summary = '';
  let insight = '';
  let nextActions = '';
  let currentSection = '';

  for (const line of lines) {
    if (line.includes('総括')) { currentSection = 'summary'; continue; }
    if (line.includes('良かった') || line.includes('改善点') || line.includes('一言')) {
      currentSection = 'insight';
      insight += line + '\n';
      continue;
    }
    if (line.includes('明日の優先')) { currentSection = 'next'; continue; }

    if (currentSection === 'summary') summary += line + '\n';
    else if (currentSection === 'insight') insight += line + '\n';
    else if (currentSection === 'next') nextActions += line + '\n';
  }

  // If parsing fails, use whole content
  if (!summary.trim()) {
    summary = result.content.slice(0, 200);
    insight = result.content;
    nextActions = '';
  }

  const { data: report } = await supabase
    .from('daily_reports')
    .insert({
      workspace_id: workspaceId,
      report_date: date,
      completion_rate: context.completionRate,
      tasks_completed: context.tasksCompleted,
      tasks_total: context.tasksTotal,
      summary: summary.trim(),
      ai_insight: insight.trim(),
      next_actions: nextActions.trim(),
    })
    .select()
    .single();

  await logUsage(workspaceId, 'daily_report', result.provider, result.model, result.inputTokens, result.outputTokens);

  return report;
}

export async function generateContent(
  workspaceId: string,
  params: {
    platform: string;
    contentType: string;
    theme: string;
    tone: string;
    cta?: string;
    additionalContext?: string;
  }
): Promise<string> {
  const ai = getAiProvider();

  const platformGuide: Record<string, string> = {
    x_post: 'X(Twitter)投稿: 140文字以内が理想。フック→本文→CTAの構成。ハッシュタグ2-3個。',
    instagram_caption: 'Instagramキャプション: フック1行目が重要。本文→CTA→ハッシュタグ。改行を活用。',
    note_article: 'note記事: タイトル→導入→見出し付き本文→まとめ→CTAの構成。1000-2000文字目安。',
    video_prompt: '動画プロンプト: 台本形式で。シーン/ナレーション/テロップ/CTA/尺を記載。',
  };

  const messages: AiMessage[] = [
    {
      role: 'system',
      content: `あなたはSNSコンテンツライターです。${platformGuide[params.contentType] || ''}
トーン: ${params.tone}
実用的で、すぐに使える文案を生成してください。日本語で書いてください。`,
    },
    {
      role: 'user',
      content: `テーマ: ${params.theme}
${params.cta ? `CTA: ${params.cta}` : ''}
${params.additionalContext ? `追加コンテキスト: ${params.additionalContext}` : ''}

上記のテーマで${platformGuide[params.contentType] ? '' : params.platform + 'の'}コンテンツを生成してください。`,
    },
  ];

  const result = await ai.generate(messages, { maxTokens: 800 });

  await logUsage(workspaceId, `content_${params.contentType}`, result.provider, result.model, result.inputTokens, result.outputTokens);

  return result.content;
}

export async function chatWithAi(
  workspaceId: string,
  messageGroupId: string,
  userMessage: string,
  recentContext?: string
): Promise<string> {
  const supabase = await createClient();

  // Save user message
  await supabase.from('ai_conversations').insert({
    workspace_id: workspaceId,
    role: 'user',
    content: userMessage,
    message_group_id: messageGroupId,
  });

  // Get recent messages in this group (last 10)
  const { data: history } = await supabase
    .from('ai_conversations')
    .select('role, content')
    .eq('workspace_id', workspaceId)
    .eq('message_group_id', messageGroupId)
    .order('created_at', { ascending: true })
    .limit(10);

  const ai = getAiProvider();

  const messages: AiMessage[] = [
    {
      role: 'system',
      content: `あなたはSNS運用コンサルタントです。ユーザーのSNS運用に関する相談に答えてください。
簡潔で実用的なアドバイスをしてください。日本語で回答してください。
${recentContext ? `\n直近のデータ:\n${recentContext}` : ''}`,
    },
    ...(history || []).map(m => ({
      role: m.role as AiMessage['role'],
      content: m.content,
    })),
  ];

  const result = await ai.generate(messages, { maxTokens: 600 });

  // Save assistant message
  await supabase.from('ai_conversations').insert({
    workspace_id: workspaceId,
    role: 'assistant',
    content: result.content,
    message_group_id: messageGroupId,
  });

  await logUsage(workspaceId, 'chat', result.provider, result.model, result.inputTokens, result.outputTokens);

  return result.content;
}

export async function analyzeTrendPost(
  workspaceId: string,
  trendPostId: string,
  content: string
): Promise<string> {
  const ai = getAiProvider();

  const messages: AiMessage[] = [
    {
      role: 'system',
      content: `あなたはSNSコンテンツアナリストです。投稿を分析して以下の形式で回答してください:

## フックパターン
(投稿の冒頭がなぜ効果的か)

## 構成パターン
(全体の構造)

## CTAパターン
(行動喚起のやり方)

## トーン
(文章のトーン)

## なぜ伸びたか
(推測)

## あなたへのアクション
(真似すべきポイントを1-2つ)

日本語で、簡潔に回答してください。`,
    },
    {
      role: 'user',
      content: `以下の投稿を分析してください:\n\n${content}`,
    },
  ];

  const result = await ai.generate(messages, { maxTokens: 600 });

  // Save analysis
  const supabase = await createClient();
  const analysisText = result.content;

  // Extract patterns from analysis
  const hookMatch = analysisText.match(/## フックパターン\n([\s\S]*?)(?=##|$)/);
  const structureMatch = analysisText.match(/## 構成パターン\n([\s\S]*?)(?=##|$)/);
  const ctaMatch = analysisText.match(/## CTAパターン\n([\s\S]*?)(?=##|$)/);
  const toneMatch = analysisText.match(/## トーン\n([\s\S]*?)(?=##|$)/);
  const actionMatch = analysisText.match(/## あなたへのアクション\n([\s\S]*?)(?=##|$)/);

  await supabase.from('trend_analyses').insert({
    workspace_id: workspaceId,
    trend_post_id: trendPostId,
    analysis_summary: analysisText,
    hook_pattern: hookMatch?.[1]?.trim() || '',
    structure_pattern: structureMatch?.[1]?.trim() || '',
    cta_pattern: ctaMatch?.[1]?.trim() || '',
    tone_pattern: toneMatch?.[1]?.trim() || '',
    suggested_action: actionMatch?.[1]?.trim() || '',
    created_by: 'ai',
  });

  await logUsage(workspaceId, 'trend_analysis', result.provider, result.model, result.inputTokens, result.outputTokens);

  return analysisText;
}

export async function getAiUsageSummary(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('ai_usage_logs')
    .select('estimated_cost, created_at')
    .eq('workspace_id', workspaceId)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalCost = (data || []).reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
  const totalCalls = data?.length || 0;

  return { totalCost, totalCalls };
}

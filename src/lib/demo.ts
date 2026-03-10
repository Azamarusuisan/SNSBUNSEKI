// Demo mode: renders UI with mock data when Supabase is not configured

import type {
  Workspace,
  SocialAccount,
  DailyTask,
  Post,
  ContentDraft,
  TrendSource,
  TrendPost,
  TrendAnalysis,
  DailyReport,
  AiConversation,
} from './types';

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return !url || url.includes('your-project');
}

const WS_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = '00000000-0000-0000-0000-000000000099';

export const DEMO_WORKSPACE: Workspace = {
  id: WS_ID,
  user_id: USER_ID,
  name: 'My Workspace',
  goal_followers: 10000,
  primary_platform: 'x',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const DEMO_ACCOUNTS: SocialAccount[] = [
  {
    id: 'sa-1',
    workspace_id: WS_ID,
    platform: 'x',
    account_name: 'my_x_account',
    niche: 'マーケティング',
    target_audience: '20-30代の起業家',
    current_followers: 1240,
    goal_followers: 10000,
    posting_style: 'カジュアル',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'sa-2',
    workspace_id: WS_ID,
    platform: 'instagram',
    account_name: 'my_insta',
    niche: 'ビジネスTips',
    target_audience: '副業に興味がある会社員',
    current_followers: 580,
    goal_followers: 5000,
    posting_style: 'フレンドリー',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'sa-3',
    workspace_id: WS_ID,
    platform: 'note',
    account_name: 'mynote',
    niche: 'ビジネスノウハウ',
    target_audience: 'フリーランス',
    current_followers: 320,
    goal_followers: 3000,
    posting_style: 'プロフェッショナル',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DEMO_TASKS: DailyTask[] = [
  {
    id: 'dt-1', workspace_id: WS_ID, task_date: today(), platform: 'x',
    task_type: 'write_post', title: 'X投稿文案を作成',
    description: 'テーマを決めてX投稿の文案を作成する',
    scheduled_time: '09:00:00', estimated_minutes: 15, priority: 1,
    status: 'done', generated_by: 'system', source_reason: '通常モード',
    completed_at: new Date().toISOString(), created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dt-2', workspace_id: WS_ID, task_date: today(), platform: 'x',
    task_type: 'publish_post', title: 'X投稿を公開',
    description: '作成した文案をXに投稿する',
    scheduled_time: '12:00:00', estimated_minutes: 5, priority: 1,
    status: 'done', generated_by: 'system', source_reason: '通常モード',
    completed_at: new Date().toISOString(), created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dt-3', workspace_id: WS_ID, task_date: today(), platform: 'x',
    task_type: 'engage', title: 'Xでエンゲージメント活動',
    description: '関連アカウントへのリプライ・いいね・リポスト',
    scheduled_time: '13:00:00', estimated_minutes: 15, priority: 2,
    status: 'todo', generated_by: 'system', source_reason: '通常モード',
    completed_at: null, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dt-4', workspace_id: WS_ID, task_date: today(), platform: 'instagram',
    task_type: 'write_post', title: 'Instagramキャプションを作成',
    description: 'Instagram投稿用のキャプションを作成する',
    scheduled_time: '10:00:00', estimated_minutes: 20, priority: 1,
    status: 'todo', generated_by: 'system', source_reason: '通常モード',
    completed_at: null, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dt-5', workspace_id: WS_ID, task_date: today(), platform: 'general',
    task_type: 'analyze', title: '参考投稿を分析',
    description: '伸びている投稿を1件選んで構造を分析する',
    scheduled_time: '16:00:00', estimated_minutes: 15, priority: 2,
    status: 'todo', generated_by: 'system', source_reason: '通常モード',
    completed_at: null, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dt-6', workspace_id: WS_ID, task_date: today(), platform: 'general',
    task_type: 'review', title: '今日の振り返り',
    description: '今日の投稿と結果を振り返り、明日に活かす',
    scheduled_time: '21:00:00', estimated_minutes: 10, priority: 3,
    status: 'todo', generated_by: 'system', source_reason: '通常モード',
    completed_at: null, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
];

export const DEMO_POSTS: Post[] = [
  {
    id: 'p-1', workspace_id: WS_ID, social_account_id: 'sa-1', platform: 'x',
    posted_at: '2025-03-09T12:00:00Z', content_draft_id: null,
    theme: 'SNS運用の時間管理', hook: 'SNS運用で毎日2時間かけてるのは無駄です。',
    body: '投稿の型を3つ決めるだけで、作業時間は30分に短縮できます。\n\n1. 体験談型\n2. ノウハウ型\n3. 質問型\n\nこの3つを曜日ローテするだけ。',
    cta: 'フォローして他の時短テクも受け取ってください', hashtags: ['SNS運用', '時短'],
    post_type: 'テキスト', media_url: '', external_post_url: '',
    created_at: '2025-03-09T12:00:00Z', updated_at: '2025-03-09T12:00:00Z',
  },
  {
    id: 'p-2', workspace_id: WS_ID, social_account_id: 'sa-2', platform: 'instagram',
    posted_at: '2025-03-08T18:00:00Z', content_draft_id: null,
    theme: 'フォロワー増加のコツ', hook: '3ヶ月で1000人増やした方法',
    body: 'プロフィールを見直す→投稿の型を統一→ストーリーズで日常を見せる。この3ステップだけ。',
    cta: '保存して後で見返してね', hashtags: ['Instagram運用', 'フォロワー増加'],
    post_type: 'カルーセル', media_url: '', external_post_url: '',
    created_at: '2025-03-08T18:00:00Z', updated_at: '2025-03-08T18:00:00Z',
  },
  {
    id: 'p-3', workspace_id: WS_ID, social_account_id: 'sa-1', platform: 'x',
    posted_at: '2025-03-07T09:00:00Z', content_draft_id: null,
    theme: '朝の投稿ルーティン', hook: '朝7時に投稿するだけでインプが2倍になった話',
    body: 'タイムラインが活発な朝7時と昼12時を狙うと、同じ投稿でもリーチが全然違います。\n\n検証結果:\n- 朝7時投稿 → 平均リーチ 5,200\n- 夜21時投稿 → 平均リーチ 2,800',
    cta: 'いいねで応援してください', hashtags: ['X運用', '投稿時間'],
    post_type: 'テキスト', media_url: '', external_post_url: '',
    created_at: '2025-03-07T09:00:00Z', updated_at: '2025-03-07T09:00:00Z',
  },
];

export const DEMO_POST_METRICS = [
  { post_id: 'p-1', views: 5200, likes: 87, comments: 12, shares: 23, saves: 15 },
  { post_id: 'p-2', views: 3400, likes: 156, comments: 24, shares: 8, saves: 89 },
  { post_id: 'p-3', views: 4800, likes: 64, comments: 8, shares: 18, saves: 11 },
];

export const DEMO_COMPLETION_HISTORY = [
  { date: '2025-03-04', rate: 83, done: 5, total: 6 },
  { date: '2025-03-05', rate: 67, done: 4, total: 6 },
  { date: '2025-03-06', rate: 100, done: 6, total: 6 },
  { date: '2025-03-07', rate: 80, done: 4, total: 5 },
  { date: '2025-03-08', rate: 50, done: 3, total: 6 },
  { date: '2025-03-09', rate: 83, done: 5, total: 6 },
  { date: today(), rate: 33, done: 2, total: 6 },
];

export const DEMO_TREND_SOURCES: TrendSource[] = [
  {
    id: 'ts-1', workspace_id: WS_ID, source_type: 'competitor_account', platform: 'x',
    source_name: '@marketing_pro', source_url: 'https://x.com/marketing_pro',
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'ts-2', workspace_id: WS_ID, source_type: 'competitor_account', platform: 'instagram',
    source_name: '@biz_tips_daily', source_url: 'https://instagram.com/biz_tips_daily',
    is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
  },
];

export const DEMO_TREND_POSTS: TrendPost[] = [
  {
    id: 'tp-1', workspace_id: WS_ID, trend_source_id: 'ts-1', platform: 'x',
    title: 'バズった投稿テンプレ公開', hook: '月収100万超えてから気づいたこと',
    body_summary: '実績を最初に見せてから、具体的なステップを箇条書き。最後にフォローCTA。',
    source_url: '', posted_at: '2025-03-05T00:00:00Z',
    metrics_snapshot_json: { likes: 2400, retweets: 580, views: 120000 },
    raw_text: '月収100万超えてから気づいたこと\n\n正直、やってることは超シンプルです。\n\n1. 毎日1投稿（型を3つローテ）\n2. 朝7時に予約投稿\n3. リプで関係構築\n4. 週1でnote更新\n\nこれを6ヶ月続けただけ。\n\nフォローで全テンプレ公開中→',
    created_at: '2025-03-05T00:00:00Z', updated_at: '2025-03-05T00:00:00Z',
  },
  {
    id: 'tp-2', workspace_id: WS_ID, trend_source_id: 'ts-2', platform: 'instagram',
    title: 'リール再生100万回の法則', hook: 'これ知らないと一生伸びません',
    body_summary: '危機感を煽るフック→問題提起→解決策を小出し→保存を促すCTA',
    source_url: '', posted_at: '2025-03-07T00:00:00Z',
    metrics_snapshot_json: { likes: 8500, comments: 340, saves: 2100, views: 1020000 },
    raw_text: '',
    created_at: '2025-03-07T00:00:00Z', updated_at: '2025-03-07T00:00:00Z',
  },
];

export const DEMO_TREND_ANALYSES: TrendAnalysis[] = [];

export const DEMO_DRAFTS: ContentDraft[] = [
  {
    id: 'cd-1', workspace_id: WS_ID, platform: 'x', content_type: 'x_post',
    title: '', theme: 'フォロワー1000人までのロードマップ',
    hook: 'フォロワー0→1000人の最短ルート教えます', body: 'フォロワー0→1000人の最短ルート教えます\n\n結論: 3ヶ月で到達可能です。\n\n月1: プロフィール最適化 + 毎日投稿\n月2: 型を固める + リプ営業\n月3: note連携 + フォロワーとの対話\n\nポイントは「量→質」の順番。\n最初から完璧を目指さない。\n\n#SNS運用 #フォロワー増加',
    cta: '', hashtags: ['SNS運用', 'フォロワー増加'], tone: 'casual',
    status: 'draft', created_from_task_id: null,
    created_at: '2025-03-09T00:00:00Z', updated_at: '2025-03-09T00:00:00Z',
  },
];

-- Seed data for SNS Growth OS
-- Run this after creating a user via the app's signup page
-- Replace 'YOUR_USER_ID' with the actual auth.users id

-- Note: In normal flow, profiles and workspaces are auto-created
-- This seed is for demo/testing if you want pre-populated data

-- After signing up, get your user_id from profiles table, then run:

-- Example seed (replace UUIDs as needed):

/*
-- Insert social accounts
INSERT INTO social_accounts (workspace_id, platform, account_name, niche, target_audience, current_followers, goal_followers)
VALUES
  ('YOUR_WORKSPACE_ID', 'x', 'myaccount', 'マーケティング', '20-30代の起業家', 500, 10000),
  ('YOUR_WORKSPACE_ID', 'instagram', 'myinsta', 'ビジネス', '副業に興味がある会社員', 200, 5000),
  ('YOUR_WORKSPACE_ID', 'note', 'mynote', 'ビジネスノウハウ', 'フリーランス', 100, 3000);

-- Insert trend sources
INSERT INTO trend_sources (workspace_id, source_type, platform, source_name, source_url)
VALUES
  ('YOUR_WORKSPACE_ID', 'competitor_account', 'x', '@competitor1', 'https://x.com/competitor1'),
  ('YOUR_WORKSPACE_ID', 'competitor_account', 'instagram', '@competitor_ig', 'https://instagram.com/competitor_ig'),
  ('YOUR_WORKSPACE_ID', 'reference_url', 'note', '参考ブロガー', 'https://note.com/reference');

-- Insert sample posts
INSERT INTO posts (workspace_id, platform, theme, hook, body, cta, post_type, external_post_url)
VALUES
  ('YOUR_WORKSPACE_ID', 'x', 'SNS運用の時間管理', 'SNS運用で毎日2時間かけてるのは無駄です。', '投稿の型を3つ決めるだけで、作業時間は30分に短縮できます。\n\n1. 体験談型\n2. ノウハウ型\n3. 質問型\n\nこの3つを曜日ローテするだけ。', 'フォローして他の時短テクも受け取ってください', 'テキスト', ''),
  ('YOUR_WORKSPACE_ID', 'instagram', 'フォロワー増加のコツ', '3ヶ月で1000人増やした方法', 'プロフィールを見直す→投稿の型を統一→ストーリーズで日常を見せる。この3ステップだけ。', '保存して後で見返してね', 'カルーセル', '');
*/

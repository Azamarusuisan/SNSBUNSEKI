# SNS Growth Operating System - PROJECT_SPEC

## 1. 要件理解サマリー

SNS運用の行動管理OS。「毎日のSNS運用を継続するための行動管理・コーチング・記録システム」。
投稿ツールではなく、タスク管理+行動ログ+AI補助による改善サイクルを回す仕組み。

## 2. プロダクト概要

- SNS運用の自動コーチ + 行動ログDB + 改善OS
- 対応媒体: X / Instagram / note
- AIは補助的利用のみ（日次レポート・文案生成・相談・分析）
- タスク生成はルールベース（AIではない）
- 月額AI費3000円以内
- 1人ユーザーのMVP

## 3. MVP機能一覧

1. ユーザー認証（Supabase Auth / Email+Password）
2. ワークスペース作成（1ユーザー1ワークスペース）
3. SNSアカウント管理
4. 今日のタスク自動生成（ルールエンジン）
5. タスク完了/未完了/延期/スキップ
6. 投稿ログ保存
7. 投稿結果（メトリクス）保存
8. 日次レポート生成（AI）
9. AI相談チャット
10. テキストコンテンツ生成（X/Instagram/note/動画プロンプト）
11. 競合/参考投稿の保存と分析
12. 外部動画ツール遷移リンク

## 4. 技術スタック

- Frontend: Next.js 14+ App Router / TypeScript
- UI: Tailwind CSS
- Backend: Next.js Server Actions + Route Handlers
- Database / Auth: Supabase
- ORM: Supabase client（Prisma不要）
- AI: Provider abstraction（初期mock、後でOpenAI/Anthropic切替）
- Deployment: Vercel想定
- Validation: zod
- Date: date-fns
- Charts: recharts
- Icons: lucide-react

## 5. システム構成

```
Browser → Next.js App (Vercel)
              ├── Server Actions / Route Handlers
              ├── AI Provider Abstraction → OpenAI / Anthropic / Mock
              └── Supabase Client → Supabase (Auth + PostgreSQL + RLS)
```

## 6. データベース設計

13テーブル: profiles, workspaces, social_accounts, daily_tasks, content_drafts,
posts, post_metrics, trend_sources, trend_posts, trend_analyses, daily_reports,
ai_conversations, ai_usage_logs

詳細は supabase/schema.sql 参照。

## 7. フロントエンド設計

- モバイルファースト + デスクトップ拡張
- Tailwind CSS レスポンシブ
- カードベースUI
- モバイル: 下部タブナビ（5項目）
- デスクトップ: 左サイドバー（8項目）

## 8. レスポンシブUI方針

- Mobile: < 768px → 今日の行動に集中
- Tablet: 768-1023px → 中間
- Desktop: >= 1024px → 分析・管理・作成

## 9. タスク生成ロジック

ルールベースエンジン:
- 直近3日完了率でタスク量調整
- リカバリーモード（2日連続低完了率）
- 媒体別負荷重み（X=軽, Instagram=中, note=重）
- 未達タスク全持ち越し禁止

## 10. AI利用方針

使う場面: 日次レポート, 相談チャット, 文案生成, 分析要約
使わない場面: タスク生成, 集計, スコア算出

コスト制御: 日次1回, 履歴要約渡し, 軽量モデル優先, usage logging

## 11. 画面一覧

1. ログイン / サインアップ
2. ダッシュボード
3. 今日の運用
4. コンテンツ作成（4タブ: X / Instagram / note / 動画プロンプト）
5. 投稿ログ
6. 分析
7. 参考投稿/競合分析
8. AI相談チャット
9. 設定

## 12. 開発ロードマップ

1. DB schema + 型定義
2. 認証 + ワークスペース
3. ダッシュボード + 今日のタスク
4. タスク生成ロジック
5. コンテンツ作成
6. 投稿ログ + 結果入力
7. AI abstraction + 日次レポート
8. 参考投稿/競合分析
9. AI相談チャット
10. 分析画面
11. 設定 + UI調整

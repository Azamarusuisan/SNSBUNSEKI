# SNS Growth OS

SNS運用の行動管理OS。毎日のSNS運用を仕組み化し、継続的な成長を支援するWebアプリケーション。

## 概要

- **タスク自動生成**: 直近の達成率に基づいて今日やるべきSNSタスクを自動生成
- **投稿ログ管理**: 投稿内容と結果（メトリクス）を記録・蓄積
- **AI補助**: 日次レポート、文案生成、相談チャット、競合分析（月3000円以内）
- **競合分析**: 参考投稿の保存とAI分析
- **対応媒体**: X / Instagram / note

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Authentication > Settings で Email auth を有効化

### 3. 環境変数

`.env.example` を `.env.local` にコピーして値を設定:

```bash
cp .env.example .env.local
```

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `AI_PROVIDER` | `mock` or `openai` |
| `AI_API_KEY` | OpenAI API key（mockの場合は不要） |
| `AI_MODEL` | 使用モデル（例: `gpt-4o-mini`） |
| `AI_MAX_TOKENS` | 最大トークン数 |
| `AI_TEMPERATURE` | 温度パラメータ |

### 4. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。

## 技術スタック

- **Frontend**: Next.js 14+ App Router / TypeScript / Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database/Auth**: Supabase (PostgreSQL + RLS + Auth)
- **AI**: Provider abstraction (mock / OpenAI)
- **Charts**: Recharts
- **Icons**: Lucide React

## AI利用箇所

| 機能 | 頻度 | 用途 |
|------|------|------|
| 日次レポート | 1日1回 | タスク達成の振り返りと改善提案 |
| 文案生成 | 都度 | X/Instagram/note/動画プロンプト |
| AI相談 | 都度 | SNS運用全般の相談 |
| 競合分析 | 都度 | 参考投稿の構造分析 |

AIを使わない処理: タスク生成、集計、スコア算出（ルールベース）

## タスク生成ロジック

`src/lib/tasks/generator.ts` に実装。

- 直近3日の完了率 >= 80% → タスク量+1（好調モード）
- 直近3日の完了率 < 50% → タスク量-1
- 2日連続低完了率 → リカバリーモード（最低限タスクのみ）
- noteは週2回、動画プロンプトは週2回
- Xは軽量なので毎日、Instagramは中負荷

## 画面構成

1. **ダッシュボード** - 今日のタスク、KPI、クイックアクション
2. **今日の運用** - タスク管理、完了/延期/スキップ
3. **コンテンツ作成** - AI文案生成（4タブ）
4. **投稿ログ** - 投稿記録と結果入力
5. **分析** - パフォーマンス分析
6. **参考投稿** - 競合/トレンド分析
7. **AI相談** - チャット形式の相談
8. **設定** - ワークスペース、SNSアカウント、AI利用状況

## 将来拡張方針

- SNS API連携（投稿の自動取得）
- 週次/月次レポート
- Vercel Cron による定期タスク生成
- 複数ワークスペース対応
- チーム機能
- TikTok対応

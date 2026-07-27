# Phase 6: 公式SNSアカウント連携 ＆ AI要約機能 (X / Instagram / YouTube)

## 概要
登録した推し人物の公式SNSアカウント（X / 旧Twitter、Instagram、YouTubeチャンネルなど）の最新投稿や動画を自動取得し、ニュースメディア報道と合わせてGemini AI による要約・一括閲覧を可能にする機能を構築します。

---

## サブタスク一覧

### Task 6.1: データベース拡張 (Migration 002)
- [ ] `supabase/migrations/002_add_social_accounts.sql` の作成:
  - `favorites` テーブルに `social_accounts` (JSONB) カラムを追加
    ```sql
    ALTER TABLE public.favorites 
    ADD COLUMN IF NOT EXISTS social_accounts JSONB DEFAULT '{
      "x_handle": null,
      "instagram_handle": null,
      "youtube_channel_id": null
    }'::jsonb;
    ```
- [ ] Phase 2 の Gemini 人物同定プロンプト (`lib/ai/identify-favorite.ts`) を拡張し、候補生成時に公式X・Instagram・YouTubeアカウントの候補も抽出して保存

### Task 6.2: SNS情報収集エンジンの実装
- [ ] `lib/services/sns-fetcher.ts` の作成
- [ ] **A. YouTube 公式動画 RSS 収集:**
  - YouTube XMLフィード (`https://www.youtube.com/feeds/videos.xml?channel_id=xxx`) をパースし最新動画タイトル・説明文を取得
- [ ] **B. X (旧Twitter) 公式投稿収集:**
  - Nitter RSS または 検索クエリ `from:[x_handle]` の最新ポスト取得
- [ ] **C. Instagram 公式投稿収集:**
  - Jina Reader (`https://r.jina.ai/[instagram_url]`) または RSS フィードによる最新写真・キャプション取得

### Task 6.3: Gemini AI SNS投稿要約モジュールの実装
- [ ] `lib/ai/summarize-sns.ts` の作成
- [ ] SNS投稿特有の短文・画像キャプション・動画概要から「【公式SNS】何についての投稿・動画か」を明瞭な3行要約に変換

### Task 6.4: UI コンポーネントの拡張
- [ ] `components/AddFavoriteModal.tsx`: SNSアカウントの自動取得・手動入力欄の追加
- [ ] `components/NewsCard.tsx`:
  - 記事種別バッジ（「YouTube」「X (Twitter)」「Instagram」）のアイコン表示
  - SNS投稿カード用のビジュアル装飾（プラットフォームカラーバッジ）

### Task 6.5: 定期バッチ (Cron) へのパイプライン統合
- [ ] `lib/services/news-storage.ts` および `/api/cron/daily-news` に SNS 取得・要約処理を組み込み

---

## 完了条件
1. `favorites` に公式SNSアカウントが紐づけられ、毎朝のバッチでSNSの最新投稿・動画が自動集約されること。
2. ニュースフィード上でニュース報道と公式SNS投稿が判別しやすいアイコン・バッジ付きで3行要約表示されること。

# Phase 6: 公式SNSアカウント連携 ＆ AI要約機能 (X / Instagram / YouTube)

## 概要
登録した推し人物の公式SNSアカウント（X / 旧Twitter、Instagram、YouTubeチャンネルなど）の最新投稿や動画を自動取得し、ニュースメディア報道と合わせてGemini AI による要約・一括閲覧を可能にする機能を構築しました。

---

## サブタスク一覧

### Task 6.1: データベース拡張 (Migration 002)
- [x] `supabase/migrations/002_add_social_accounts.sql` の作成:
  - `favorites` テーブルに `social_accounts` (JSONB) カラムを追加
- [x] `types/database.ts` の `Favorite` / `FavoriteCandidate` インターフェース更新
- [x] Phase 2 の Gemini 人物同定プロンプト (`lib/ai/identify-favorite.ts`) を拡張し、公式X・Instagram・YouTubeアカウントの自動特定・保存に対応

### Task 6.2: SNS情報収集エンジンの実装
- [x] `lib/services/sns-fetcher.ts` の作成
- [x] **A. YouTube 公式動画 RSS 収集:** XMLフィード解析による最新動画タイトル・URLの取得
- [x] **B. X (旧Twitter) 公式投稿収集:** 最新ポスト・文字テキストのパース
- [x] **C. Instagram 公式投稿収集:** 公式アカウント情報のパース

### Task 6.3: Gemini AI SNS投稿要約モジュールの実装
- [x] `lib/ai/summarize-sns.ts` の作成
- [x] SNS投稿・公式動画特有のタイトル・キャプションからスマホで1秒で把握できる「最大3行要約」を生成

### Task 6.4: UI コンポーネントの拡張
- [x] `components/AddFavoriteModal.tsx`: 人物候補カードに特定された公式SNSアカウントのタグ表示
- [x] `components/NewsCard.tsx`:
  - 記事種別バッジ（「YouTube」「X (Twitter)」「Instagram」）のアイコン表示
  - 公式ブランドバッジ（YouTube 赤、X ブラック、Instagram ピンク）

### Task 6.5: 定期バッチ (Cron) へのパイプライン統合
- [x] `lib/services/news-storage.ts` に SNS 取得・要約処理を統合

---

## 完了条件
1. `favorites` に公式SNSアカウントが紐づけられ、毎朝のバッチでSNSの最新投稿・動画が自動集約されること。 -> **達成 (`sns-fetcher.ts` ＆ パイプライン統合完了)**
2. ニュースフィード上でニュース報道と公式SNS投稿が判別しやすいアイコン・バッジ付きで3行要約表示されること。 -> **達成 (`NewsCard.tsx` ブランドバッジ表示完了)**

# Phase 2: 推し人物登録機能 & Gemini AI同定 (パターンA)

## 概要
ユーザーが登録したい人物名を入力した際、Gemini API (`gemini-2.5-flash`) を用いて実在する候補人物・グループを最大5件リストアップし、同姓同名やノイズを排除した上で選択・登録できる機能を実装します。

---

## サブタスク一覧

### Task 2.1: Gemini API SDK のセットアップ
- [x] 公式パッケージ `@google/genai` の設定
- [x] `lib/gemini.ts` に Gemini クライアント設定を記述

### Task 2.2: 人物同定プロンプト & 候補取得 logic の実装
- [x] `lib/ai/identify-favorite.ts` の作成:
  - Gemini API (JSON Schema / Mode) を呼び出し
  - 人物候補（名前、肩書/所属、識別キーワード、公式HP URL、紹介文）を最大5件パースして返却

### Task 2.3: API Route / Action モジュールの作成
- [x] `/api/favorites/search`: Gemini人物候補取得API Route
- [x] `/api/favorites`: Supabase `favorites` CRUD (一覧取得・新規登録・削除) API Route

### Task 2.4: 推し登録モーダル UI の実装
- [x] モーダルコンポーネント `components/AddFavoriteModal.tsx` の作成
- [x] UI構成:
  1. 検索インプット（例：「有村架純」「HIKAKIN」）
  2. ローディングアニメーション（Gemini解析中）
  3. 候補リストカード表示（最大5件、名前・グループ・識別キーワードタグ・公式HP）
  4. 「この人物を登録する」ボタン

### Task 2.5: 登録完了後のフィードバック・推しリスト状態更新
- [x] 登録完了時のトースト通知 ＆ 自動リフレッシュフック (`hooks/useFavorites.ts`)
- [x] ダッシュボード画面へのリアルタイム反映・削除機能

---

## 完了条件
1. 人物名を入力すると、Gemini API から正確な人物候補リストがJSON形式で取得できること。 -> **達成 (`/api/favorites/search` 実装完了)**
2. ユーザーがカードを選択し、Supabase `favorites` テーブルにキーワードや公式HP付きで正常に保存されること。 -> **達成 (AddFavoriteModal ＆ API連携完了)**

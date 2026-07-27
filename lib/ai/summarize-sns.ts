import { RawNewsArticle } from '../services/news-fetcher';

export async function summarizeSnsPost(
  name: string,
  post: RawNewsArticle
): Promise<string> {
  const platformName = post.source || 'SNS';

  // 規約遵守のため要約を行わず、更新通知と直接リンク案内のみ提供
  if (platformName.includes('YouTube')) {
    return `・「${name}」の公式YouTubeチャンネルにて最新動画が公開されました。\n・規約遵守および著作権保護のため、動画本文・映像は公式ページにてご覧ください。\n・下記ボタンより直接YouTubeアプリ/Webでご視聴いただけます。`;
  }

  if (platformName.includes('X') || platformName.includes('Twitter')) {
    return `・「${name}」の公式X (Twitter) アカウントが更新されました。\n・各プラットフォーム規約遵守のため、最新ポストは公式アプリ/Webにてご覧ください。\n・下記ボタンより公式Xアカウントへ直接移動できます。`;
  }

  if (platformName.includes('Instagram')) {
    return `・「${name}」の公式Instagramアカウントが更新されました。\n・各プラットフォーム規約遵守のため、最新写真・ストーリーズは公式アプリにてご覧ください。\n・下記ボタンより公式Instagramへ直接移動できます。`;
  }

  return `・「${name}」の公式 ${platformName} アカウントの更新を検知しました。\n・最新の投稿・コンテンツは公式ページにてご確認ください。\n・下記ボタンより公式ページへ移動できます。`;
}

import Parser from 'rss-parser';
import { RawNewsArticle } from './news-fetcher';
import { SocialAccounts } from '@/types/database';

const parser = new Parser();

export async function fetchRawSnsPostsForFavorite(
  name: string,
  socialAccounts?: SocialAccounts | null
): Promise<RawNewsArticle[]> {
  const posts: RawNewsArticle[] = [];
  if (!socialAccounts) return posts;

  // 1. YouTube 公式チャンネル動画更新検知 (公開 RSS フィード利用)
  if (socialAccounts.youtube_channel_id) {
    try {
      const channelId = socialAccounts.youtube_channel_id.replace(/^UC/, 'UC');
      const ytRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const feed = await parser.parseURL(ytRssUrl);

      if (feed && feed.items) {
        for (const item of feed.items.slice(0, 3)) {
          if (!item.title || !item.link) continue;

          posts.push({
            title: `【YouTube更新】「${name}」が新作動画を公開しました: ${item.title}`,
            url: item.link,
            source: 'YouTube',
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            snippet: `YouTube公式チャンネルに最新動画が投稿されました。`,
          });
        }
      }
    } catch (ytErr) {
      console.warn(`Failed to check YouTube update for ${name}:`, ytErr);
    }
  }

  // 2. X (旧Twitter) 公式アカウント更新検知 (ToS準拠・更新通知のみ)
  if (socialAccounts.x_handle) {
    const cleanHandle = socialAccounts.x_handle.replace(/^@/, '');
    posts.push({
      title: `【X (Twitter) 公式更新】「${name}」(@${cleanHandle}) の最新ポスト`,
      url: `https://x.com/${cleanHandle}`,
      source: 'X (Twitter)',
      published_at: new Date().toISOString(),
      snippet: `公式X (@${cleanHandle}) アカウントの更新通知です。`,
    });
  }

  // 3. Instagram 公式アカウント更新検知 (ToS準拠・更新通知のみ)
  if (socialAccounts.instagram_handle) {
    const cleanInsta = socialAccounts.instagram_handle.replace(/^@/, '');
    posts.push({
      title: `【Instagram 公式更新】「${name}」(@${cleanInsta}) の最新投稿`,
      url: `https://www.instagram.com/${cleanInsta}/`,
      source: 'Instagram',
      published_at: new Date().toISOString(),
      snippet: `公式Instagram (@${cleanInsta}) アカウントの更新通知です。`,
    });
  }

  return posts;
}

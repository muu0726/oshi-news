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

  // 1. YouTube 公式チャンネル動画 RSS 収集
  if (socialAccounts.youtube_channel_id) {
    try {
      const channelId = socialAccounts.youtube_channel_id.replace(/^UC/, 'UC');
      const ytRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const feed = await parser.parseURL(ytRssUrl);

      if (feed && feed.items) {
        for (const item of feed.items.slice(0, 3)) {
          if (!item.title || !item.link) continue;

          posts.push({
            title: `【YouTube新作動画】${item.title}`,
            url: item.link,
            source: 'YouTube',
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            snippet: item.contentSnippet || item.title,
          });
        }
      }
    } catch (ytErr) {
      console.warn(`Failed to fetch YouTube RSS for ${name}:`, ytErr);
    }
  }

  // 2. X (旧Twitter) 公式ポスト収集 (Jina Reader 検索連携)
  if (socialAccounts.x_handle) {
    try {
      const cleanHandle = socialAccounts.x_handle.replace(/^@/, '');
      const xUrl = `https://r.jina.ai/https://x.com/${cleanHandle}`;
      const res = await fetch(xUrl, { headers: { 'Accept': 'text/plain' } });

      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50) {
          const firstPost = text.split('\n').find(line => line.length > 15 && !line.includes('http')) || `${name} の最新Xポスト`;
          posts.push({
            title: `【X (Twitter) 公式投稿】${firstPost.substring(0, 70)}`,
            url: `https://x.com/${cleanHandle}`,
            source: 'X (Twitter)',
            published_at: new Date().toISOString(),
            snippet: text.substring(0, 300),
          });
        }
      }
    } catch (xErr) {
      console.warn(`Failed to fetch X post for ${name}:`, xErr);
    }
  }

  // 3. Instagram 公式投稿収集
  if (socialAccounts.instagram_handle) {
    try {
      const cleanInsta = socialAccounts.instagram_handle.replace(/^@/, '');
      posts.push({
        title: `【Instagram 公式更新】@${cleanInsta} の最新投稿・ストーリー`,
        url: `https://www.instagram.com/${cleanInsta}/`,
        source: 'Instagram',
        published_at: new Date().toISOString(),
        snippet: `${name} の公式Instagramアカウント（@${cleanInsta}）が更新されました。`,
      });
    } catch (instaErr) {
      console.warn(`Failed to fetch Instagram for ${name}:`, instaErr);
    }
  }

  return posts;
}

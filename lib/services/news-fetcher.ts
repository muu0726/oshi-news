import Parser from 'rss-parser';

export interface RawNewsArticle {
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  snippet?: string;
}

const parser = new Parser();

function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function fetchRawNewsForFavorite(
  name: string,
  keywords: string[] = [],
  officialUrl?: string | null
): Promise<RawNewsArticle[]> {
  const articles: RawNewsArticle[] = [];
  const seenUrls = new Set<string>();

  // 1. Google News RSS からのニュース収集
  try {
    // 検索クエリ: 名前 + 所属・識別用キーワード（もしあれば）
    const keywordQuery = keywords.length > 0 ? keywords.slice(0, 2).join(' OR ') : '';
    const searchQuery = keywordQuery ? `"${name}" (${keywordQuery})` : `"${name}"`;
    
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=ja&gl=JP&ceid=JP:ja`;
    const feed = await parser.parseURL(rssUrl);

    if (feed && feed.items) {
      for (const item of feed.items) {
        if (!item.title || !item.link) continue;
        if (!isSafeUrl(item.link)) continue;
        if (seenUrls.has(item.link)) continue;

        // 出典メディア名の分離 (例: "タイトル - 出典メディア名")
        let title = item.title;
        let source = 'Google News';

        const lastDashIndex = title.lastIndexOf(' - ');
        if (lastDashIndex !== -1) {
          source = title.substring(lastDashIndex + 3).trim();
          title = title.substring(0, lastDashIndex).trim();
        }

        seenUrls.add(item.link);
        articles.push({
          title,
          url: item.link,
          source,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          snippet: item.contentSnippet || item.content || '',
        });
      }
    }
  } catch (error) {
    console.error(`Failed to fetch RSS for ${name}:`, error);
  }

  // 2. 公式HP / 事務所サイトからの簡易スクレイピング (Jina Reader 連携)
  if (officialUrl && isSafeUrl(officialUrl)) {
    try {
      const jinaUrl = `https://r.jina.ai/${officialUrl}`;
      const res = await fetch(jinaUrl, { headers: { 'Accept': 'text/plain' } });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50) {
          // 公式HPの冒頭テキストからニュース記事相当を取得
          const firstLine = text.split('\n').find(line => line.trim().length > 10) || `${name} 公式サイト更新情報`;
          const cleanTitle = firstLine.replace(/^[#\*\s]+/, '').trim().substring(0, 80);

          if (!seenUrls.has(officialUrl)) {
            seenUrls.add(officialUrl);
            articles.push({
              title: `【公式更新】${cleanTitle}`,
              url: officialUrl,
              source: '公式ウェブサイト',
              published_at: new Date().toISOString(),
              snippet: text.substring(0, 300),
            });
          }
        }
      }
    } catch (officialErr) {
      console.warn(`Failed to fetch official page for ${name}:`, officialErr);
    }
  }

  // 直近最大 10 件を返す
  return articles.slice(0, 10);
}

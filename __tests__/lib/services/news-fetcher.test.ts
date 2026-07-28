import { describe, it, expect } from 'vitest';
import { fetchRawNewsForFavorite } from '@/lib/services/news-fetcher';

describe('fetchRawNewsForFavorite', () => {
  it('配列を返すこと（Google News RSS からのニュース収集）', async () => {
    const articles = await fetchRawNewsForFavorite('乃木坂46', ['アイドル']);
    expect(Array.isArray(articles)).toBe(true);
    if (articles.length > 0) {
      expect(articles[0].title).toBeDefined();
      expect(articles[0].url).toMatch(/^https?:\/\//);
    }
  }, 10000);
});

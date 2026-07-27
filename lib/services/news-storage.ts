import { SupabaseClient } from '@supabase/supabase-js';
import { Favorite } from '@/types/database';
import { fetchRawNewsForFavorite } from './news-fetcher';
import { isArticleRelevantToFavorite } from '../ai/filter-news';
import { summarizeNewsArticle } from '../ai/summarize-news';

export async function processNewsPipelineForFavorite(
  supabase: SupabaseClient,
  favorite: Favorite
): Promise<{ processed: number; added: number }> {
  let added = 0;

  // 1. ニュース・公式HP情報の収集
  const rawArticles = await fetchRawNewsForFavorite(
    favorite.name,
    favorite.keywords,
    favorite.official_url
  );

  if (rawArticles.length === 0) {
    return { processed: 0, added: 0 };
  }

  // 2. DB 内の既存ニュースURLを取得して重複を排除
  const { data: existingNews } = await supabase
    .from('news')
    .select('url, title')
    .eq('favorite_id', favorite.id);

  const existingUrls = new Set((existingNews || []).map(n => n.url));
  const existingTitles = new Set((existingNews || []).map(n => n.title));

  for (const article of rawArticles) {
    if (existingUrls.has(article.url) || existingTitles.has(article.title)) {
      continue; // 既にDB保存済み
    }

    // 3. Gemini API による同姓同名・ノイズ判定
    const isRelevant = await isArticleRelevantToFavorite(
      favorite.name,
      favorite.category_or_group,
      favorite.keywords,
      article
    );

    if (!isRelevant) {
      continue; // 無関係なニュースを除外
    }

    // 4. Gemini API による 3行要約の生成
    const summary = await summarizeNewsArticle(favorite.name, article);

    // 5. Supabase news テーブルへ保存
    const { error: insertError } = await supabase
      .from('news')
      .insert({
        favorite_id: favorite.id,
        title: article.title,
        url: article.url,
        source: article.source,
        summary,
        published_at: article.published_at,
      });

    if (!insertError) {
      added++;
      existingUrls.add(article.url);
      existingTitles.add(article.title);
    } else {
      console.error(`Failed to insert news for ${favorite.name}:`, insertError);
    }
  }

  return { processed: rawArticles.length, added };
}

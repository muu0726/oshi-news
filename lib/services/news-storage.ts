import { SupabaseClient } from '@supabase/supabase-js';
import { Favorite } from '@/types/database';
import { fetchRawNewsForFavorite } from './news-fetcher';
import { fetchRawSnsPostsForFavorite } from './sns-fetcher';
import { isArticleRelevantToFavorite } from '../ai/filter-news';
import { summarizeNewsArticle } from '../ai/summarize-news';
import { summarizeSnsPost } from '../ai/summarize-sns';

export async function processNewsPipelineForFavorite(
  supabase: SupabaseClient,
  favorite: Favorite
): Promise<{ processed: number; added: number }> {
  let added = 0;

  // 1. ニュース報道 ＆ 公式HP情報の収集
  const rawNewsArticles = await fetchRawNewsForFavorite(
    favorite.name,
    favorite.keywords,
    favorite.official_url
  );

  // 2. 公式SNS投稿 (YouTube, X, Instagram) の収集 (Phase 6)
  const rawSnsPosts = await fetchRawSnsPostsForFavorite(
    favorite.name,
    favorite.social_accounts
  );

  const allArticles = [...rawSnsPosts, ...rawNewsArticles];

  if (allArticles.length === 0) {
    return { processed: 0, added: 0 };
  }

  // 3. DB 内の既存ニュースURLを取得して重複を排除
  const { data: existingNews } = await supabase
    .from('news')
    .select('url, title')
    .eq('favorite_id', favorite.id);

  const existingUrls = new Set((existingNews || []).map(n => n.url));
  const existingTitles = new Set((existingNews || []).map(n => n.title));

  for (const article of allArticles) {
    if (existingUrls.has(article.url) || existingTitles.has(article.title)) {
      continue; // 既にDB保存済み
    }

    const isSns = ['YouTube', 'X (Twitter)', 'Instagram'].includes(article.source);

    // 4. 同姓同名・ノイズ判定 (SNS公式投稿の場合はスキップして全採用)
    let isRelevant = true;
    if (!isSns) {
      isRelevant = await isArticleRelevantToFavorite(
        favorite.name,
        favorite.category_or_group,
        favorite.keywords,
        article
      );
    }

    if (!isRelevant) {
      continue;
    }

    // 5. AI 要約の生成
    let summary: string;
    if (isSns) {
      summary = await summarizeSnsPost(favorite.name, article);
    } else {
      summary = await summarizeNewsArticle(favorite.name, article);
    }

    // 6. Supabase news テーブルへ保存
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
      console.error(`Failed to insert article for ${favorite.name}:`, insertError);
    }
  }

  return { processed: allArticles.length, added };
}

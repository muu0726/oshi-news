import { SocialAccounts } from '@/types/database';

export async function resolveOfficialSnsAccounts(title: string): Promise<SocialAccounts> {
  const social: SocialAccounts = {
    x_handle: null,
    instagram_handle: null,
    youtube_channel_id: null,
  };

  try {
    // STEP 1: Wikidata API (P2002: X, P2003: Instagram, P2397: YouTube) から公式情報を取得
    const wikiUrl = `https://ja.wikipedia.org/w/api.php?action=query&prop=pageprops&titles=${encodeURIComponent(title)}&format=json`;
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        for (const pageId in pages) {
          const qid = pages[pageId]?.pageprops?.wikibase_item;
          if (!qid) continue;

          const wdUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
          const wdRes = await fetch(wdUrl);
          if (wdRes.ok) {
            const wdData = await wdRes.json();
            const claims = wdData?.entities?.[qid]?.claims;
            if (claims) {
              if (claims.P2002?.[0]?.mainsnak?.datavalue?.value) {
                social.x_handle = `@${claims.P2002[0].mainsnak.datavalue.value.replace(/^@/, '')}`;
              }
              if (claims.P2003?.[0]?.mainsnak?.datavalue?.value) {
                social.instagram_handle = claims.P2003[0].mainsnak.datavalue.value.replace(/^@/, '');
              }
              if (claims.P2397?.[0]?.mainsnak?.datavalue?.value) {
                social.youtube_channel_id = claims.P2397[0].mainsnak.datavalue.value;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Wikidata SNS resolution failed for ${title}:`, err);
  }

  return social;
}

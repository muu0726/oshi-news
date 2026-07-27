import { getGeminiClient } from '@/lib/gemini';
import { FavoriteCandidate } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { Type } from '@google/genai';

// Wikipedia PageImages API からサムネイル画像URLを取得するユーティリティ
async function fetchWikipediaThumbnail(title: string): Promise<string | undefined> {
  try {
    const wikiUrl = `https://ja.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=300&format=json`;
    const res = await fetch(wikiUrl);
    if (!res.ok) return undefined;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      for (const pageId in pages) {
        if (pages[pageId]?.thumbnail?.source) {
          return pages[pageId].thumbnail.source;
        }
      }
    }
  } catch {
    // 無視してフォールバック
  }
  return undefined;
}

// Wikipedia Search API を用いた候補生成 ＋ サムネイル画像取得
async function fetchWikipediaFallbackCandidates(query: string, searchType: string = 'all'): Promise<FavoriteCandidate[]> {
  try {
    const wikiUrl = `https://ja.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json`;
    const res = await fetch(wikiUrl);
    if (!res.ok) throw new Error('Wikipedia Search API Request Failed');

    const data = await res.json();
    const names: string[] = Array.isArray(data[1]) ? data[1] : [];
    const descriptions: string[] = Array.isArray(data[2]) ? data[2] : [];

    if (names.length > 0) {
      const results: FavoriteCandidate[] = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const isGroup = name.includes('46') || name.includes('48') || name.includes('坂') || name.includes('グループ') || name.includes('バンド');
        const candidateType = isGroup ? 'group' : 'person';

        if (searchType !== 'all' && candidateType !== searchType) {
          continue;
        }

        const imageUrl = await fetchWikipediaThumbnail(name);

        results.push({
          name,
          type: candidateType,
          category_or_group: isGroup ? 'アイドルグループ / アーティスト' : '著名人・有名人',
          official_url: Array.isArray(data[3]) && data[3][i] ? data[3][i] : '',
          image_url: imageUrl || undefined,
          social_accounts: {},
          keywords: [name, query],
          description: descriptions[i] && descriptions[i].length > 5 ? descriptions[i] : `「${name}」の最新ニュース・公式更新情報を収集します。`,
        });
      }
      return results;
    }
  } catch (err) {
    console.warn('Wikipedia fallback search error:', err);
  }

  return [
    {
      name: query,
      type: searchType === 'group' ? 'group' : 'person',
      category_or_group: '登録人物',
      official_url: '',
      social_accounts: {},
      keywords: [query],
      description: `「${query}」のニュースおよび公式更新を収集します。`,
    },
  ];
}

// Supabase の master_favorites キャッシュを保存・取得
async function saveCandidatesToMasterDb(candidates: FavoriteCandidate[]) {
  try {
    const supabase = await createClient();
    for (const c of candidates) {
      await supabase.from('master_favorites').upsert(
        {
          name: c.name,
          type: c.type || 'person',
          category_or_group: c.category_or_group || '',
          official_url: c.official_url || null,
          image_url: c.image_url || null,
          social_accounts: c.social_accounts || {},
          keywords: c.keywords || [c.name],
          description: c.description || '',
        },
        { onConflict: 'name' }
      );
    }
  } catch (err) {
    console.warn('Failed to cache candidates in master_favorites DB:', err);
  }
}

export async function identifyFavoriteCandidates(query: string, searchType: string = 'all'): Promise<FavoriteCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // -------------------------------------------------------------
  // STEP 1: Supabase master_favorites DB キャッシュを最優先検索 (API消費 0 回)
  // -------------------------------------------------------------
  try {
    const supabase = await createClient();
    let dbQuery = supabase
      .from('master_favorites')
      .select('*')
      .or(`name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
      .limit(5);

    if (searchType !== 'all') {
      dbQuery = dbQuery.eq('type', searchType);
    }

    const { data: dbCandidates } = await dbQuery;

    if (dbCandidates && dbCandidates.length > 0) {
      console.log(`[Cache HIT] Returned ${dbCandidates.length} candidates from master_favorites DB for query "${trimmed}" (Zero API consumption)`);
      return dbCandidates.map((item: any) => ({
        name: item.name,
        type: item.type || 'person',
        category_or_group: item.category_or_group || '登録済みマスター',
        official_url: item.official_url || '',
        image_url: item.image_url || undefined,
        social_accounts: item.social_accounts || {},
        keywords: item.keywords || [item.name],
        description: item.description || '',
      }));
    }
  } catch (dbErr) {
    console.warn('Master DB search error:', dbErr);
  }

  // -------------------------------------------------------------
  // STEP 2: Gemini API / Wikipedia API 検索 ＋ キャッシュ更新
  // -------------------------------------------------------------
  const ai = getGeminiClient();

  if (!ai) {
    const wikiCandidates = await fetchWikipediaFallbackCandidates(trimmed, searchType);
    await saveCandidatesToMasterDb(wikiCandidates);
    return wikiCandidates;
  }

  try {
    const prompt = `ユーザーが追っかけたい「推し」の検索キーワードとして「${trimmed}」と入力しました。 (希望種別: ${searchType})

【指示】
検索文字列「${trimmed}」は完全一致の名前だけでなく、以下の可能性があります：
- **苗字のみ・名前のみ** (例: 「有村」➔ 有村架純, 有村藍里 など)
- **愛称・ひらがな・カタカナ・アルファベットの表記揺れ** (例: 「ひかきん」➔ HIKAKIN, 「あの」➔ あの / ano など)
- **グループの略称・関連メンバー** (例: 「乃木坂」➔ 乃木坂46 など)

探している可能性の高い実在の有名人、芸能人、アイドル、インフルエンサー、VTuber、グループ候補を【最大5件】特定し、以下のJSON形式で返却してください。
種別 (type) は人物なら "person"、グループなら "group" と指定してください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: '人物・グループの正式名称' },
                  type: { type: Type.STRING, description: '種別 ("person" または "group")' },
                  category_or_group: { type: Type.STRING, description: '肩書・所属グループ・職業' },
                  official_url: { type: Type.STRING, description: '公式HPまたはブログのURL' },
                  x_handle: { type: Type.STRING, description: '公式X (@から始まるハンドル)' },
                  instagram_handle: { type: Type.STRING, description: '公式Instagram アカウント' },
                  youtube_channel_id: { type: Type.STRING, description: '公式YouTube チャンネルID' },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '識別用キーワード',
                  },
                  description: { type: Type.STRING, description: '人物の簡単な説明（100文字以内）' },
                },
                required: ['name', 'category_or_group', 'keywords', 'description'],
              },
            },
          },
          required: ['candidates'],
        },
      },
    });

    const jsonText = response.text || '';
    const parsed = JSON.parse(jsonText);
    if (parsed && Array.isArray(parsed.candidates) && parsed.candidates.length > 0) {
      const candidates: FavoriteCandidate[] = [];

      for (const item of parsed.candidates) {
        if (searchType !== 'all' && item.type && item.type !== searchType) {
          continue;
        }

        const imageUrl = await fetchWikipediaThumbnail(item.name);
        candidates.push({
          name: item.name || trimmed,
          type: item.type === 'group' ? 'group' : 'person',
          category_or_group: item.category_or_group || 'アーティスト/インフルエンサー',
          official_url: item.official_url || '',
          image_url: imageUrl || undefined,
          social_accounts: {
            x_handle: item.x_handle || null,
            instagram_handle: item.instagram_handle || null,
            youtube_channel_id: item.youtube_channel_id || null,
          },
          keywords: Array.isArray(item.keywords) && item.keywords.length > 0 ? item.keywords : [trimmed],
          description: item.description || '',
        });
      }

      if (candidates.length > 0) {
        await saveCandidatesToMasterDb(candidates);
        return candidates;
      }
    }
  } catch (error) {
    console.error('Gemini API error. Falling back to Wikipedia API search:', error);
  }

  const wikiCandidates = await fetchWikipediaFallbackCandidates(trimmed, searchType);
  await saveCandidatesToMasterDb(wikiCandidates);
  return wikiCandidates;
}

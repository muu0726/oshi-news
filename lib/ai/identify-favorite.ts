import { getGeminiClient } from '@/lib/gemini';
import { FavoriteCandidate } from '@/types/database';
import { Type } from '@google/genai';

// Wikipedia Search API を用いたフォールバック候補生成関数
async function fetchWikipediaFallbackCandidates(query: string): Promise<FavoriteCandidate[]> {
  try {
    const wikiUrl = `https://ja.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json`;
    const res = await fetch(wikiUrl);
    if (!res.ok) throw new Error('Wikipedia Search API Request Failed');

    const data = await res.json();
    const names: string[] = Array.isArray(data[1]) ? data[1] : [];
    const descriptions: string[] = Array.isArray(data[2]) ? data[2] : [];

    if (names.length > 0) {
      return names.map((name, i) => ({
        name,
        category_or_group: name.includes('46') || name.includes('48') || name.includes('坂') ? 'アイドルグループ / 芸能' : '著名人・有名人',
        official_url: Array.isArray(data[3]) && data[3][i] ? data[3][i] : '',
        social_accounts: {},
        keywords: [name, query],
        description: descriptions[i] && descriptions[i].length > 5 ? descriptions[i] : `「${name}」の最新ニュース・公式更新情報を収集します。`,
      }));
    }
  } catch (err) {
    console.warn('Wikipedia fallback search error:', err);
  }

  // 完全なフォールバック
  return [
    {
      name: query,
      category_or_group: '登録人物',
      official_url: '',
      social_accounts: {},
      keywords: [query],
      description: `「${query}」のニュースおよび公式更新を収集します。`,
    },
  ];
}

export async function identifyFavoriteCandidates(query: string): Promise<FavoriteCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const ai = getGeminiClient();

  // APIキー未設定の場合、Wikipedia API で候補検索
  if (!ai) {
    return await fetchWikipediaFallbackCandidates(trimmed);
  }

  try {
    const prompt = `ユーザーが追っかけたい「推し」の検索キーワードとして「${trimmed}」と入力しました。

【指示】
検索文字列「${trimmed}」は完全一致の名前だけでなく、以下の可能性があります：
- **苗字のみ・名前のみ** (例: 「有村」➔ 有村架純, 有村藍里 など)
- **愛称・ひらがな・カタカナ・アルファベットの表記揺れ** (例: 「ひかきん」➔ HIKAKIN, 「あの」➔ あの / ano など)
- **グループの略称・関連メンバー** (例: 「乃木坂」➔ 乃木坂46 など)
- **同姓同名の人物が複数存在** (同姓同名の別人)

ユーザーが探している可能性の高い実在の有名人、芸能人、アイドル、インフルエンサー、VTuber、アーティスト、グループ、または同姓同名の異なる候補を【最大5件】幅広く柔軟に特定し、以下のJSON形式で返却してください。各候補の正式名称 (name) を正しく設定してください。`;

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
                  name: { type: Type.STRING, description: '人物・グループの正式なフルネーム/表示名（例: 有村架純, HIKAKIN）' },
                  category_or_group: { type: Type.STRING, description: '肩書・所属グループ・職業（例: 女優, YouTuber, アイドル）' },
                  official_url: { type: Type.STRING, description: '公式HP、事務所サイト、または公式ブログのURL（不明な場合は空文字）' },
                  x_handle: { type: Type.STRING, description: '公式X (旧Twitter) アカウント (@から始まるハンドル、不明なら空文字)' },
                  instagram_handle: { type: Type.STRING, description: '公式Instagram アカウント (ユーザー名、不明なら空文字)' },
                  youtube_channel_id: { type: Type.STRING, description: '公式YouTube チャンネルID (例: UCxxxxxxxx, 不明なら空文字)' },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '同姓同名・ノイズカット・表記揺れ識別用キーワード（愛称、英語表記、所属事務所など3〜5個）',
                  },
                  description: { type: Type.STRING, description: '人物の簡単な説明（同姓同名の識別ができるように100文字以内で記述）' },
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
      return parsed.candidates.map((item: any) => ({
        name: item.name || trimmed,
        category_or_group: item.category_or_group || 'アーティスト/インフルエンサー',
        official_url: item.official_url || '',
        social_accounts: {
          x_handle: item.x_handle || null,
          instagram_handle: item.instagram_handle || null,
          youtube_channel_id: item.youtube_channel_id || null,
        },
        keywords: Array.isArray(item.keywords) && item.keywords.length > 0 ? item.keywords : [trimmed],
        description: item.description || '',
      }));
    }
  } catch (error) {
    console.error('Gemini API search failed or quota exceeded. Using Wikipedia fallback search:', error);
  }

  // Quota エラー時や Gemini 失敗時は Wikipedia API で候補一覧を取得
  return await fetchWikipediaFallbackCandidates(trimmed);
}

import { getGeminiClient } from '@/lib/gemini';
import { FavoriteCandidate } from '@/types/database';
import { Type } from '@google/genai';

export async function identifyFavoriteCandidates(query: string): Promise<FavoriteCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const ai = getGeminiClient();

  // APIキー未設定・動作不可時のフォールバック処理
  if (!ai) {
    return [
      {
        name: trimmed,
        category_or_group: '一般 / その他',
        official_url: '',
        social_accounts: {},
        keywords: [trimmed],
        description: `「${trimmed}」として登録（※Gemini APIキー未設定のため直書き保存モード）`,
      },
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `ユーザーがニュースや公式SNSを集約・追跡したい人物・グループの検索名として「${trimmed}」と入力しました。
入力された名前から想定される実在の有名人、アイドル、芸能人、インフルエンサー、VTuber、アーティスト等の人物・グループを最大5件特定し、公式SNSアカウント情報を含む詳細を以下のJSON形式で出力してください。

同姓同名やノイズニュースを除外するための識別用キーワード（所属、愛称、代表作、英字表記など）および知られている場合は公式X (@handle)、公式Instagram (@handle)、公式YouTubeチャンネルIDも抽出してください。`,
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
                  name: { type: Type.STRING, description: '人物・グループの正式表示名' },
                  category_or_group: { type: Type.STRING, description: '肩書・所属グループ・職業' },
                  official_url: { type: Type.STRING, description: '公式HP、事務所サイト、または公式ブログのURL（不明な場合は空文字）' },
                  x_handle: { type: Type.STRING, description: '公式X (旧Twitter) アカウント (@から始まるハンドル、不明なら空文字)' },
                  instagram_handle: { type: Type.STRING, description: '公式Instagram アカウント (ユーザー名、不明なら空文字)' },
                  youtube_channel_id: { type: Type.STRING, description: '公式YouTube チャンネルID (例: UCxxxxxxxx, 不明なら空文字)' },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '同姓同名・ノイズカット・表記揺れ識別用キーワード（愛称、英語表記、所属事務所など3〜5個）',
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
    if (parsed && Array.isArray(parsed.candidates)) {
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
    console.error('Failed to call Gemini API for favorite identification:', error);
  }

  // エラー時のフォールバック
  return [
    {
      name: trimmed,
      category_or_group: '登録人物',
      official_url: '',
      social_accounts: {},
      keywords: [trimmed],
      description: `「${trimmed}」のニュースおよび公式更新を収集します。`,
    },
  ];
}

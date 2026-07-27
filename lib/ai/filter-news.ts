import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';
import { RawNewsArticle } from '@/lib/services/news-fetcher';

export async function isArticleRelevantToFavorite(
  name: string,
  categoryOrGroup: string | null,
  keywords: string[],
  article: RawNewsArticle
): Promise<boolean> {
  const ai = getGeminiClient();

  // Gemini API が利用できない場合のフォールバック（名前がタイトルに含まれていれば true）
  if (!ai) {
    return article.title.includes(name);
  }

  try {
    const prompt = `対象人物: 「${name}」
所属・肩書: 「${categoryOrGroup || 'なし'}」
識別用キーワード: [${keywords.join(', ')}]

判定するニュース記事:
- タイトル: ${article.title}
- 記事の概要/抜粋: ${article.snippet || 'なし'}

【判定タスク】
上記のニュース記事が、間違いなく「${name}」（${categoryOrGroup || ''}）本人に関する記事であるかを判定してください。
同姓同名の別人（一般人、別競技の選手など）や、名前がたまたま引っかかった無関係なノイズニュースである場合は is_relevant: false にしてください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_relevant: {
              type: Type.BOOLEAN,
              description: '対象人物本人に関する正当なニュース記事であれば true、無関係または同姓同名の別人のニュースなら false',
            },
            reason: {
              type: Type.STRING,
              description: '判定の根拠（簡潔に）',
            },
          },
          required: ['is_relevant'],
        },
      },
    });

    const jsonText = response.text || '';
    const parsed = JSON.parse(jsonText);
    return Boolean(parsed.is_relevant);
  } catch (error) {
    console.error(`Failed to filter news for ${name}:`, error);
    // エラー時はタイトルに名前が含まれていれば許容するフォールバック
    return article.title.includes(name);
  }
}

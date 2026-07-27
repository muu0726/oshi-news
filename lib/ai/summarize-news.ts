import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';
import { RawNewsArticle } from '@/lib/services/news-fetcher';

export async function summarizeNewsArticle(
  name: string,
  article: RawNewsArticle
): Promise<string> {
  const ai = getGeminiClient();

  // Gemini API が利用できない場合のフォールバック要約
  if (!ai) {
    return `・「${name}」に関する最新ニュースが更新されました。\n・記事タイトル: ${article.title}\n・詳細は元記事のリンクから確認できます。`;
  }

  try {
    const prompt = `対象人物: 「${name}」
ニュースタイトル: ${article.title}
記事内容/抜粋: ${article.snippet || article.title}

【タスク】
上記ニュース内容から、スマホ画面で短時間で把握できる「最大3行（3つの箇条書き）」の要約文を作成してください。
要約の各行は「・」で始め、自然で読みやすい日本語にしてください。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'ニュース要約の3行箇条書き配列（最大3要素）',
            },
          },
          required: ['bullets'],
        },
      },
    });

    const jsonText = response.text || '';
    const parsed = JSON.parse(jsonText);

    if (parsed && Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
      return parsed.bullets
        .slice(0, 3)
        .map((b: string) => b.startsWith('・') ? b : `・${b}`)
        .join('\n');
    }
  } catch (error) {
    console.error(`Failed to summarize news for ${name}:`, error);
  }

  // フォールバック要約
  return `・${article.title}\n・${article.source}より最新ニュース\n・元記事にて詳細をご確認ください。`;
}

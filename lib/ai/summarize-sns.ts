import { getGeminiClient } from '@/lib/gemini';
import { Type } from '@google/genai';
import { RawNewsArticle } from '../services/news-fetcher';

export async function summarizeSnsPost(
  name: string,
  post: RawNewsArticle
): Promise<string> {
  const ai = getGeminiClient();

  if (!ai) {
    return `・「${name}」の公式 ${post.source} が更新されました。\n・内容: ${post.title}\n・リンクより最新投稿をご確認いただけます。`;
  }

  try {
    const prompt = `対象人物: 「${name}」
プラットフォーム: ${post.source}
投稿/動画タイトル: ${post.title}
内容抜粋: ${post.snippet || post.title}

【タスク】
上記の公式SNS投稿・動画について、スマホ画面で分かりやすい「最大3行（3つの箇条書き）」のAIサマリーを作成してください。
各行は「・」で始め、何の投稿・動画企画であるかが1秒で伝わる内容にしてください。`;

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
              description: 'SNS投稿要約の3行箇条書き配列',
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
    console.error(`Failed to summarize SNS post for ${name}:`, error);
  }

  return `・${post.title}\n・公式${post.source}の最新更新\n・詳細はリンクよりご確認ください。`;
}

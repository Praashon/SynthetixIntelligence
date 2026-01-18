import { Tone, GeneratedContent } from "../types";

const FREE_MODELS = [
  "meta-llama/llama-4-maverick:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-r1:free",
  "qwen/qwen2.5-vl-3b-instruct:free",
];

export const generateDraftsOpenRouter = async (
  idea: string,
  tone: Tone,
  apiKey: string,
): Promise<GeneratedContent> => {
  const prompt = `Generate social media drafts for six platforms: Instagram, Facebook, Twitter, LinkedIn, X, TikTok based on the following idea and tone.

Idea: ${idea}
Tone: ${tone}

Requirements:
- LinkedIn: Professional, Insightful, Informative. (3–5 hashtags)
- Twitter/X: Witty, Punchy, Conversational. (1–2 hashtags)
- Instagram: Aesthetic, Visual, Inspiring. (5–10 hashtags)
- Facebook: Relatable, Community-focused, Casual. (0–2 hashtags)
- TikTok: Raw, Authentic, Fast-paced. (3–6 hashtags)
- Reddit: Informative, Engaging, Informative. (3–5 hashtags)
- Suggest aspect ratios: LinkedIn: 16:9, Twitter/X: 16:9, Instagram: 1:1, Facebook: 16:9, TikTok: 9:16, Reddit: 16:9

RETURN ONLY a valid JSON object with this exact structure:
{
  "drafts":[
    {"platform": "Instagram", "content": "...", "suggestedAspectRatio":"1:1"},
    {"platform": "Facebook", "content": "...", "suggestedAspectRatio":"16:9"},
    {"platform": "Twitter", "content": "...", "suggestedAspectRatio":"16:9"},
    {"platform": "LinkedIn", "content": "...", "suggestedAspectRatio":"16:9"},
    {"platform": "X", "content": "...", "suggestedAspectRatio":"16:9"},
    {"platform": "TikTok", "content": "...", "suggestedAspectRatio":"9:16"},
    {"platform": "Reddit", "content": "...", "suggestedAspectRatio":"16:9"}
  ]
}`;

  const makeRequest = async (model: string) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://synthetix.ai",
          "X-Title": "Synthetix Intelligence",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Error (${model}): ${errorText}`);
    }

    return response.json();
  };

  let lastError: Error | null = null;

  for (const model of FREE_MODELS) {
    try {
      const data = await makeRequest(model);
      let content = data.choices[0].message.content;
      content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(content);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError || new Error("All models failed");
};

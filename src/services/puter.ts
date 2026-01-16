import {
  Platform,
  Tone,
  generatedContent,
  aspectRatio,
  imageSize,
} from "../types";

declare const puter: any;

export const generateDrafts = async (
  idea: string,
  tone: Tone,
): Promise<generatedContent> => {
  const prompt = `Generate social media drafts for six platforms: Instagram, Facebook, Twitter, LinkedIn, X, TikTok based on the following idea: ${idea} and tone: ${tone}

  Requirements:
  - LinkedIn: Professional, Insightful, Informative. (3–5 hashtags)
  - Twitter/X: Witty, Punchy, Conversational. (1–2 hashtags)
  - Instagram: Aesthetic, Visual, Inspiring. (5–10 hashtags)
  - Facebook: Relatable, Community-focused, Casual. (0–2 hashtags)
  - TikTok: Raw, Authentic, Fast-paced. (3–6 hashtags)
  - Reddit: Informative, Engaging, Informative. (3–5 hashtags)

  RETURN ONLY a JSON object with structure and content (no markdown formatting):
  {
    "drafts":[
        {
           "platform": "Instagram",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "Facebook",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "Twitter",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "LinkedIn",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "X",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "TikTok",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        },
        {
           "platform": "Reddit",
           "content": "...",
           "suggestedAspectRatio":"16:9"
        }
    ]
  }`;

  try {
    const response = await puter.ai.chat(prompt);
    let text = response?.message?.content || response;
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.log("Puter Chat Error:", error);
    throw new Error("Failed to generate drafts");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const audio = await puter.ai.txt2speech(text);
    if (audio && audio.src) {
      return audio.src;
    }
    throw new Error("No Audio Source Returned!");
  } catch (error) {
    console.log("Puter Speech Error:", error);
    throw new Error("Failed to generate speech");
  }
};

export const generatePlatformImage = async (
  prompt: string,
  AspectRatio: aspectRatio,
  ImageSize = imageSize,
): Promise<string> => {
  try {
    const fullPrompt = `A professional, high-end social media graphic for: ${prompt}. Cinematic lightning, 8k resolution, photo-realistic. Aspect Ratio ${AspectRatio}`;

    let image;
    try {
      image = await puter.ai.txt2img(fullPrompt, {
        model: "gemini-2.5-flash-image-preview",
      });
    } catch (e) {
      console.warn("Gemini generation failed! Trying FLUX!", e);
    }
    try {
      image = await puter.ai.txt2img(fullPrompt, {
        model: "black-forest-labs/FLUX.1-schnell",
      });
    } catch (e2) {
      console.warn("FLUX also failed! Using DEFAULT!", e2);
      image = await puter.ai.txt2img(fullPrompt);
    }
    if (image && image.src) {
      return image.src;
    }
    throw new Error("No Image Source Returned!");
  } catch (error) {
    console.log("Puter Image Error:", error);
    throw new Error("Failed to generate image");
  }
};

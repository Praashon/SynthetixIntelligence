export enum Tone {
  PROFESSIONAL = "Professiona",
  WITTY = "Witty",
  URGENT = "Urgent",
  INSPIRATIONAL = "Inspirational",
  FUNNY = "Funny",
}

export enum Platform {
  LINKEDIN = "LinkedIn",
  TWITTER = "Twitter",
  INSTAGRAM = "Instagram",
  X = "X",
  REDDIT = "Reddit",
  FACEBOOK = "Facebook",
}

export enum imageSize {
  S1K = "1K",
  S2K = "2K",
  S4K = "4K",
}

export type aspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";

export interface platformDraft {
  platform: Platform;
  content: string;
  suggestedAspectRatio: aspectRatio;
  imageUrl?: string;
  isGeneratingImage: boolean;
}

export interface generatedContent {
  drafts: platformDraft[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  content?: string;
  isGenerating: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export interface EbookProject {
  businessName: string;
  niche: string;
  targetAudience: string;
  chapters: Chapter[];
  images: GeneratedImage[];
}

export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  OUTLINE = 'OUTLINE',
  EDITOR = 'EDITOR',
  IMAGES = 'IMAGES',
  EXPORT = 'EXPORT'
}

export type Language = 'en' | 'pt';

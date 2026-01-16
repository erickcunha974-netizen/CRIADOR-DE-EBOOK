import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

// Helper to safely extract and parse JSON from model output
const parseJSON = (text: string) => {
  try {
    // 1. Try cleaning markdown code blocks
    let clean = text.replace(/```json\s*|\s*```/g, "").trim();
    // 2. If it doesn't look like JSON (starts with { or [), try to find the substring
    if (!clean.startsWith('[') && !clean.startsWith('{')) {
      const firstOpen = clean.indexOf('[');
      const lastClose = clean.lastIndexOf(']');
      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
         clean = clean.substring(firstOpen, lastClose + 1);
      }
    }
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse AI response as JSON.");
  }
};

export const generateOutline = async (niche: string, businessName: string, language: Language, apiKey: string): Promise<any[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const langInstruction = language === 'pt' ? 'in Brazilian Portuguese' : 'in English';

  const prompt = `
    Create a 6-chapter outline for an ebook titled "Scaling Your ${niche} Business with AI".
    The ebook is designed for a small entrepreneur running a business named "${businessName}".
    Focus on practical marketing automation, content creation, and operational efficiency using AI.
    
    IMPORTANT: The content of the outline (titles and descriptions) MUST be written ${langInstruction}.
    
    Return a JSON array of objects with 'title' and 'description' keys.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return parseJSON(text);
  } catch (error) {
    console.error("Error generating outline:", error);
    throw error;
  }
};

export const generateChapterContent = async (
  chapterTitle: string, 
  chapterDesc: string, 
  niche: string, 
  businessName: string,
  language: Language,
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-pro-preview";

  const langInstruction = language === 'pt' ? 'Brazilian Portuguese' : 'English';

  const prompt = `
    Write a comprehensive, engaging, and actionable chapter for an ebook.
    
    **Context:**
    - Book Title: Scaling Your ${niche} Business with AI
    - Business Name: ${businessName}
    - Chapter Title: ${chapterTitle}
    - Chapter Description: ${chapterDesc}
    - Audience: Small Business Owner
    
    **Requirements:**
    - Language: ${langInstruction}
    - Use Markdown formatting (headers, bolding, lists).
    - Provide concrete examples relevant to the ${niche} industry.
    - Tone: Professional, encouraging, and forward-thinking.
    - Length: Approximately 800-1000 words.
    - Do not wrap the output in JSON or code blocks, just raw Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Error generating chapter:", error);
    throw error;
  }
};

export const generateMarketingImage = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // No specific imageConfig needed for flash-image defaults
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const suggestImagePrompts = async (niche: string, chapterTitle: string, language: Language, apiKey: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const langInstruction = language === 'pt' ? 'in Brazilian Portuguese' : 'in English';
  
  const prompt = `
    Suggest 3 creative image prompts for an AI image generator. 
    These images will be used as illustrations for a chapter titled "${chapterTitle}" 
    in a business ebook about the ${niche} industry.
    
    The prompts should be written ${langInstruction}.
    Return a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    return parseJSON(text);
  } catch (error) {
    console.error("Error generating prompts:", error);
    return [];
  }
}

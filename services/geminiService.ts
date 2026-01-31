
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MemeProject, BrandKit, ContentPackage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBrandStrategy = async (project: MemeProject): Promise<BrandKit> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the Meme project details below, generate a comprehensive brand identity.
    Project: ${project.name} ($${project.ticker})
    Concept: ${project.concept}
    Target: ${project.targetAudience}
    Chain: ${project.chain}
    
    Output in JSON format with exactly: tagline, missionStatement, colors (hex array), visualStyle (short description for AI image gen).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tagline: { type: Type.STRING },
          missionStatement: { type: Type.STRING },
          colors: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          visualStyle: { type: Type.STRING }
        },
        required: ["tagline", "missionStatement", "colors", "visualStyle"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateVisualAsset = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: { aspectRatio }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const generateMarketingContent = async (project: MemeProject, brand: BrandKit): Promise<ContentPackage> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate viral marketing content for this meme project: ${project.name} ($${project.ticker}).
    Mission: ${brand.missionStatement}
    Style: ${brand.visualStyle}
    
    Provide:
    1. 5 viral tweets/X posts with emojis and hashtags.
    2. 3 Telegram announcement templates.
    3. Website copy (Hero title, Hero subtitle).
    4. A 4-stage roadmap.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tweets: { type: Type.ARRAY, items: { type: Type.STRING } },
          tgAnnouncements: { type: Type.ARRAY, items: { type: Type.STRING } },
          webCopy: {
            type: Type.OBJECT,
            properties: {
              heroTitle: { type: Type.STRING },
              heroSubtitle: { type: Type.STRING },
              roadmap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stage: { type: Type.STRING },
                    goals: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

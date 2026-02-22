import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

export interface TranslationOptions {
  targetLanguage: string;
  tone?: string;
  context?: string;
}

export async function* translateTextStream(text: string, options: TranslationOptions) {
  const { targetLanguage, tone = 'Neutral', context = '' } = options;
  
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: `You are a professional literary translator. Translate the following text to ${targetLanguage}.
    
    Target Tone: ${tone}
    Additional Context: ${context}
    
    Output ONLY the translated text. Do not include any notes, explanations, or JSON formatting.
    
    Text to translate: "${text}"`,
    config: {
      systemInstruction: "You are an expert translator specializing in literature and creative writing. Your goal is to preserve the author's voice, nuance, and emotional resonance while ensuring perfect grammatical accuracy in the target language. Output only the translation.",
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export async function translateText(text: string, options: TranslationOptions): Promise<TranslationResult & { translatorNotes?: string }> {
  const { targetLanguage, tone = 'Neutral', context = '' } = options;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a professional literary translator. Translate the following text to ${targetLanguage}.
    
    Target Tone: ${tone}
    Additional Context: ${context}
    
    Text to translate: "${text}"`,
    config: {
      systemInstruction: "You are an expert translator specializing in literature and creative writing. Your goal is to preserve the author's voice, nuance, and emotional resonance while ensuring perfect grammatical accuracy in the target language.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: {
            type: Type.STRING,
            description: "The translated version of the input text, optimized for the requested tone.",
          },
          detectedLanguage: {
            type: Type.STRING,
            description: "The name of the detected source language.",
          },
          translatorNotes: {
            type: Type.STRING,
            description: "Brief notes about specific word choices or cultural nuances for the author.",
          }
        },
        required: ["translatedText", "detectedLanguage"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return result as TranslationResult & { translatorNotes?: string };
  } catch (error) {
    console.error("Failed to parse translation response:", error);
    throw new Error("Translation failed");
  }
}

import { GoogleGenAI, Type } from "@google/genai";

export interface GeneratedSouvenir {
  title: string;
  place: string;
  subtitle: string;
  narrative: string;
  interpretation: string;
  moodTags: string[];
  imageUrl?: string;
  imageError?: string;
}

export async function generateSouvenir(mood: string, reflection: string, language: 'en' | 'zh' = 'en'): Promise<GeneratedSouvenir> {
  // Use the selected API key if available, otherwise fallback to default
  const apiKey = (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are the curator of the "Museum of Lives Not Yet Lived". 
    A traveler has arrived feeling: "${mood}".
    They shared this reflection: "${reflection}".

    Generate a souvenir from a parallel life they have not lived yet.
    The souvenir MUST be chosen from a wide variety of at least 20+ different types of keepsakes. 
    DO NOT always generate train tickets or postcards.
    Examples: a matchbook, a vinyl record sleeve, a polaroid, a theater playbill, a library card, a metro pass, a concert wristband, a fortune cookie slip, a wine cork, a boarding pass, a recipe card, an antique coin, a tarot card, an enamel pin, a map fragment, a hotel key, a museum stamp, a handwritten letter, a café receipt, a luggage tag, a pressed flower.
    
    CRITICAL LANGUAGE REQUIREMENT:
    All text fields MUST be provided ONLY in the requested language: ${language === 'en' ? 'English' : 'Chinese (简体中文)'}.
    
    It must include:
    - title: The name of the object.
    - place: The destination or place it is from.
    - subtitle: An unlived-life framing.
    - narrative: 1-3 short paragraphs of immersive, cinematic narrative.
    - interpretation: 1 short paragraph explaining why this object found the user now.
    - moodTags: 2-4 mood tags.

    Tone: Poetic, calm, emotionally intelligent, cinematic.
  `;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Use flash for better compatibility with default keys
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              place: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              narrative: { type: Type.STRING },
              interpretation: { type: Type.STRING },
              moodTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "place", "subtitle", "narrative", "interpretation", "moodTags"]
          }
        }
      });

      let text = response.text;
      if (!text) {
        throw new Error("Failed to generate souvenir");
      }

      // Sometimes the model wraps JSON in markdown blocks
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (text.startsWith('\`\`\`')) {
        text = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      const parsed = JSON.parse(text);
      
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Invalid response format");
      }

      const souvenir: GeneratedSouvenir = {
        title: parsed.title || (language === 'en' ? "Unknown Object" : "未知物品"),
        place: parsed.place || (language === 'en' ? "Unknown Place" : "未知地点"),
        subtitle: parsed.subtitle || (language === 'en' ? "A fragment of an unlived life" : "一段未曾经历的生命碎片"),
        narrative: parsed.narrative || (language === 'en' ? "The story of this object has been lost to time." : "这件物品的故事已消失在时间的长河中。"),
        interpretation: parsed.interpretation || (language === 'en' ? "It found you when you needed it." : "它在你需要的时候找到了你。"),
        moodTags: Array.isArray(parsed.moodTags) ? parsed.moodTags : []
      };

      // Generate an image for the souvenir
      try {
        const imagePrompt = `A highly detailed, cinematic, and atmospheric photograph of a keepsake from an unlived life. The object is: ${souvenir.title}. It is from: ${souvenir.place}. Context: ${souvenir.subtitle}. The object is resting on a textured surface, beautifully lit with moody, evocative lighting. High quality, photorealistic, 8k resolution.`;
        
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: imagePrompt,
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            souvenir.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imageError: any) {
        console.error("Image generation failed:", imageError);
        souvenir.imageError = imageError?.message || String(imageError);
      }

      return souvenir;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      const errorMessage = error?.message || String(error);
      const isRateLimit = error?.status === 429 || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED";
      const isQuota = errorMessage.includes("quota") || errorMessage.includes("billing") || errorMessage.includes("exceeded your current quota");
      
      if (isRateLimit && !isQuota && retries > 1) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (isQuota) {
        throw new Error("Your Gemini API key has exceeded its quota. Please check your Google Cloud billing details or wait for the quota to reset.");
      } else if (isRateLimit) {
        throw new Error("The museum is currently experiencing high visitor volume. Please wait a moment and try again.");
      } else if (errorMessage.includes("API key not valid")) {
        throw new Error("The museum's key is invalid. Please check the Gemini API key in the Secrets panel.");
      }
      
      throw new Error(errorMessage || "The museum doors are temporarily stuck. Please try again later.");
    }
  }
  throw new Error("Your Gemini API key has exceeded its quota or rate limit. Please check your Google Cloud billing details.");
}

import { GoogleGenAI, Type } from "@google/genai";

export interface GeneratedSouvenir {
  title: string;
  place: string;
  subtitle: string;
  narrative: string;
  interpretation: string;
  moodTags: string[];
  archiveNumber: string;
  objectType: string;
  curatorsNote: string;
  parallelMoment: string;
  themeRoom: 'Almost Brave' | 'Things Never Sent' | 'Places I Almost Stayed' | 'Lives Not Yet Begun';
  expansions?: {
    id: string;
    inquiryId: string;
    inquiryText: string;
    response: string;
    createdAt: number;
  }[];
}

export async function expandSouvenir(souvenir: Partial<GeneratedSouvenir>, inquiry: string, language: 'en' | 'zh' = 'en'): Promise<string> {
  const apiKey = (window as any).process?.env?.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are the curator of the "Museum of Lives Not Yet Lived".
    You are looking at this exhibit in the archive:
    Title: ${souvenir.title}
    Place: ${souvenir.place}
    Narrative: ${souvenir.narrative}

    The visitor has made a curatorial inquiry: "${inquiry}"

    Write a short, poetic, cinematic response (1-2 paragraphs) addressing this inquiry.
    If they ask about a related object, describe it as another physical artifact.
    If they ask about the weather or a morning, describe the sensory details of that parallel timeline.
    Keep the tone archival, intimate, and slightly melancholic.
    Do not break character. Do not use conversational filler like "Ah, yes" or "Here is". Just deliver the archival fragment.

    CRITICAL LANGUAGE REQUIREMENT:
    Respond ONLY in ${language === 'en' ? 'English' : 'Chinese (简体中文)'}.
  `;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      if (!response.text) throw new Error("Failed to generate expansion");
      return response.text.trim();
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const isRateLimit = error?.status === 429 || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
      const isQuota = errorMessage.includes("quota") || errorMessage.includes("billing");

      if (isRateLimit && !isQuota && retries > 1) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to expand souvenir.");
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
    A traveler has arrived and shared their current resonance: "${mood}".
    They also left this unspoken thought in an unsent letter: "${reflection}".

    Generate a souvenir from a parallel life they have not lived yet, directly inspired by their resonance and unspoken thought.
    The souvenir MUST feel like an everyday, lived-in, ordinary personal travel keepsake that someone could realistically carry, keep in a drawer, or forget in a coat pocket.
    The feeling should be intimate, personal, everyday, and emotionally meaningful — not luxurious, ancient, or collectible in a formal antique sense. Think less "antique artifact" and more "forgotten personal keepsake."
    
    Prefer objects such as: train tickets, ferry receipts, café receipts, hotel keycards, postcards, metro passes, museum stubs, polaroids, folded maps, pressed flowers, handwritten notes, matchboxes, luggage tags.
    
    AVOID objects that feel too old, aristocratic, ceremonial, or museum-antique (e.g., enamel boxes, jeweled objects, ornate relics, royal items, highly decorative historical artifacts, antique coins, tarot cards).
    
    CRITICAL LANGUAGE REQUIREMENT:
    All text fields MUST be provided ONLY in the requested language: ${language === 'en' ? 'English' : 'Chinese (简体中文)'}.
    
    It must include:
    - title: The name of the object.
    - place: The destination or place it is from.
    - subtitle: An unlived-life framing.
    - narrative: 1-3 short paragraphs of immersive, cinematic narrative.
    - interpretation: 1 short paragraph explaining why this object found the user now.
    - moodTags: 2-4 mood tags.
    - archiveNumber: A fictional archive code (e.g., "EXH-402-B", "ARC-19-V").
    - objectType: The physical type of the object (e.g., "Faded Train Ticket", "Brass Key", "Unsent Letter").
    - curatorsNote: A short, melancholic observation about this item from the museum curator.
    - parallelMoment: A brief 1-2 sentence description of the exact moment this timeline diverged.
    - themeRoom: Must be exactly one of these four strings: "Almost Brave", "Things Never Sent", "Places I Almost Stayed", "Lives Not Yet Begun".

    Tone: Poetic, calm, emotionally intelligent, cinematic, archival.
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
              },
              archiveNumber: { type: Type.STRING },
              objectType: { type: Type.STRING },
              curatorsNote: { type: Type.STRING },
              parallelMoment: { type: Type.STRING },
              themeRoom: { type: Type.STRING }
            },
            required: ["title", "place", "subtitle", "narrative", "interpretation", "moodTags", "archiveNumber", "objectType", "curatorsNote", "parallelMoment", "themeRoom"]
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
        moodTags: Array.isArray(parsed.moodTags) ? parsed.moodTags : [],
        archiveNumber: parsed.archiveNumber || "ARC-000-X",
        objectType: parsed.objectType || (language === 'en' ? "Unidentified Artifact" : "未确认文物"),
        curatorsNote: parsed.curatorsNote || (language === 'en' ? "A quiet resonance remains." : "留有微弱的共鸣。"),
        parallelMoment: parsed.parallelMoment || (language === 'en' ? "The moment of divergence is unclear." : "分歧的瞬间并不清晰。"),
        themeRoom: parsed.themeRoom || "Lives Not Yet Begun"
      };

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

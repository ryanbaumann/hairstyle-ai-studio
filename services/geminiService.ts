import { GoogleGenAI, Type } from "@google/genai";
import { HairstyleOption } from "../types";

// We create a fresh instance every time to ensure we capture the latest API key
// which might be set via window.aistudio.openSelectKey()
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in process.env");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTitleFromPrompt = async (promptText: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Summarize this hairstyle description into a catchy, specific title of 4 words or less. Description: "${promptText}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'text/plain',
      }
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "New Hairstyle";
  } catch (e) {
    console.error("Title generation failed", e);
    return "New Hairstyle";
  }
};

import { STYLES } from "../data/styleOptions";

// ... existing imports

export const analyzeUserImage = async (base64Image: string): Promise<{ gender: 'Men' | 'Women' | 'All'; recommendedStyleId?: string | null }> => {
  const ai = getAiClient();
  
  // Flatten styles for the prompt
  const availableStyles = STYLES.flatMap(cat => cat.items.map(item => ({
    id: item.id,
    label: item.label,
    desc: item.desc,
    category: cat.category
  })));

  try {
    const [mimeType, data] = base64Image.split(';base64,');
    
    const prompt = `
      Analyze the person in this photo.
      
      1. Determine their gender presentation ('Men' or 'Women').
      2. Recommend the ONE best matching hairstyle from the list below to start with.
         - Choose a style that would suit their face shape and current hair length, or offer a stylish upgrade.
         - Don't go too crazy immediately; pick a solid, attractive option.
         - For men, prefer trending masculine cuts.
         - For women, prefer trending feminine cuts.
      
      Available Styles:
      ${JSON.stringify(availableStyles.map(s => ({ id: s.id, label: s.label, desc: s.desc, category: s.category })), null, 2)}
      
      Return STRICT JSON:
      {
        "gender": "Men" | "Women",
        "recommendedStyleId": "string (must match one of the IDs above)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [
        {
          inlineData: {
            mimeType: mimeType.split(':')[1] || 'image/jpeg',
            data: data
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      }
    });
    
    const text = response.text;
    if (!text) return { gender: 'All', recommendedStyleId: null };
    
    const result = JSON.parse(text);
    return {
      gender: result.gender === 'Male' ? 'Men' : (result.gender === 'Female' ? 'Women' : (result.gender || 'All')), // Handle potential 'Male'/'Female' output normalization
      recommendedStyleId: result.recommendedStyleId || null
    };
    
  } catch (e) {
    console.warn("Analysis failed, defaulting to All", e);
    return { gender: 'All', recommendedStyleId: null };
  }
};

export const generateStyleSuggestions = async (
  baseContext: string
): Promise<HairstyleOption[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Suggest 6 trending, distinct, and highly visual hairstyles for a makeover app. 
    Context: ${baseContext}.
    
    Return a JSON list. 
    Each item should have:
    - id: unique string
    - label: short, punchy name (e.g. "Pixie Cut")
    - description: A clear, visual description of the cut, texture, and length.
    - category: one of ["style", "color", "texture", "length"] (lowercase)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ['id', 'label', 'description', 'category']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    
    // Map and sanitize to ensure strict type compliance
    return parsed.map((item: any) => ({
      ...item,
      category: (item.category?.toLowerCase() as any) || 'style'
    })) as HairstyleOption[];
    
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    // Fallback static data if API fails
    return [
      { 
        id: '1', 
        label: 'Textured Bob', 
        description: 'Chin-length bob with choppy layers and beachy waves.', 
        category: 'style',
      },
      { 
        id: '2', 
        label: 'Platinum Pixie', 
        description: 'Ultra-short pixie cut in icy platinum blonde.', 
        category: 'color',
      },
      { 
        id: '3', 
        label: 'Silk Press', 
        description: 'Long, bone-straight hair with high shine.', 
        category: 'texture',
      },
    ];
  }
};

export const generateHairstyleImage = async (
  images: { front: string | null; side: string | null; back: string | null },
  styleDescription: string,
  styleReferenceImage: string | null = null,
  styleReferenceUrl: string | null = null,
  onThinking?: (thought: string) => void
): Promise<string> => {
  const ai = getAiClient();
  
  // Construct parts
  const parts: any[] = [];
  
  // 1. Add Subject Images
  if (images.front) {
    const [mimeType, data] = images.front.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1] || 'image/jpeg',
        data: data
      }
    });
  }
  if (images.side) {
    const [mimeType, data] = images.side.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1] || 'image/jpeg',
        data: data
      }
    });
  }
  if (images.back) {
    const [mimeType, data] = images.back.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1] || 'image/jpeg',
        data: data
      }
    });
  }

  // 2. Add Style Reference Image (if provided)
  // We place this LAST in the image sequence so we can refer to it easily in the prompt
  if (styleReferenceImage) {
    const [mimeType, data] = styleReferenceImage.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1] || 'image/jpeg',
        data: data
      }
    });
  }

  // 3. Construct the detailed prompt
  let promptText = `
    You are a professional hair stylist and visual artist.
    
    TASK: Apply a new hairstyle to the SUBJECT (the person in the first 1-3 images).
    
    STYLE INSTRUCTION: "${styleDescription}"
    ${styleReferenceUrl ? `STYLE INSPIRATION URL: ${styleReferenceUrl} (Incorporate the vibe/style from this video/link if known).` : ''}
  `;

  if (styleReferenceImage) {
    promptText += `
    CRITICAL: The FINAL image provided in the input sequence is a REFERENCE IMAGE for the hairstyle.
    - Extract the hairstyle (cut, texture, color) from that Reference Image.
    - Apply it seamlessly to the Subject in the first images.
    `;
  }

  promptText += `
    Output Requirement:
    - Generate a single high-resolution image with an aspect ratio of 16:9.
    - The image MUST be a composite matrix (1x3 grid) showing the Subject with the new hairstyle from three angles:
      1. Left Panel: Front View
      2. Center Panel: Side View (Profile)
      3. Right Panel: Back View
    - Maintain the Subject's facial identity, features, and expression EXACTLY as in the original images. Do not alter the face.
    - Only change the hair. Keep lighting and background professional and clean (studio style).
    - If side or back views were not provided for the subject, infer them realistically while keeping the face consistent with the front view.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-image-preview',
      contents: parts,
      config: {
        imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
        },
        thinkingConfig: {
            includeThoughts: true
        }
      }
    });

    let finalImageProp: any = null;

    for await (const chunk of response) {
        for (const part of chunk.candidates?.[0]?.content?.parts || []) {
            if (part.thought && onThinking) {
                // We got a thought chunk
                onThinking(part.text || '');
            }
            if (part.inlineData) {
                // We got the image data
                finalImageProp = part.inlineData;
            }
        }
    }

    if (finalImageProp) {
        return `data:${finalImageProp.mimeType};base64,${finalImageProp.data}`;
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const refineHairstyleImage = async (
  currentImage: string,
  refinementInstruction: string,
  styleReferenceImage: string | null = null,
  styleReferenceUrl: string | null = null,
  onThinking?: (thought: string) => void
): Promise<string> => {
  const ai = getAiClient();
  
  const parts: any[] = [];

  // 1. Current Image (The one to be edited)
  const [mimeType, data] = currentImage.split(';base64,');
  parts.push({
    inlineData: {
      mimeType: mimeType.split(':')[1] || 'image/jpeg',
      data: data
    }
  });

  // 2. Optional Style Reference Image
  if (styleReferenceImage) {
    const [refMimeType, refData] = styleReferenceImage.split(';base64,');
    parts.push({
      inlineData: {
        mimeType: refMimeType.split(':')[1] || 'image/jpeg',
        data: refData
      }
    });
  }

  // 3. Prompt Construction
  let promptText = `
    You are a professional hair stylist editing a photo.
    
    IMAGE CONTEXT:
    - The FIRST image provided is the "Current Result" (a 1x3 matrix of Front, Side, Back views).
    ${styleReferenceImage ? '- The SECOND image provided is a "Style Reference".' : ''}
    
    INSTRUCTION: "${refinementInstruction}"
    ${styleReferenceUrl ? `STYLE INSPIRATION URL: ${styleReferenceUrl}` : ''}
    
    RULES:
    1. MODIFY ONLY the hair of the subject in the first image according to the instruction. 
    ${styleReferenceImage ? '2. USE the style/texture/color from the second image as the source of truth for the change.' : ''}
    3. STRICTLY MAINTAIN the 1x3 matrix layout. Do not merge the panels.
    4. PRESERVE the person's identity, face, and expression exactly. Do not alter facial features.
    5. If the instruction is about length, color, or style, apply it consistently across all 3 views.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-pro-image-preview',
      contents: parts,
      config: {
        imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
        },
        thinkingConfig: {
            includeThoughts: true
        }
      }
    });

    let finalImageProp: any = null;

    for await (const chunk of response) {
        for (const part of chunk.candidates?.[0]?.content?.parts || []) {
            if (part.thought && onThinking) {
                 onThinking(part.text || '');
            }
            if (part.inlineData) {
                finalImageProp = part.inlineData;
            }
        }
    }

    if (finalImageProp) {
        return `data:${finalImageProp.mimeType};base64,${finalImageProp.data}`;
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image refinement failed:", error);
    throw error;
  }
};
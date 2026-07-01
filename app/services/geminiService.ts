import { OutputLayout, HairstyleOption, GenerationMode } from '../types';

export const generateTitleFromPrompt = async (promptText: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText })
    });
    const data = await response.json();
    return data.title || 'New Hairstyle';
  } catch (err) {
    console.error('Title generation error:', err);
    return 'New Hairstyle';
  }
};

export const analyzeUserImage = async (
  base64Image: string,
  availableStyles: HairstyleOption[] = []
): Promise<{ gender: 'Men' | 'Women' | 'All'; recommendedStyleId: string | null }> => {
  try {
    const response = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, availableStyles })
    });
    const data = await response.json();
    return {
      gender: data.gender || 'All',
      recommendedStyleId: data.recommendedStyleId || null
    };
  } catch (err) {
    console.warn("Analysis failed, defaulting to All", err);
    return { gender: 'All', recommendedStyleId: null };
  }
};

export const generateStyleSuggestions = async (
  baseContext: string
): Promise<HairstyleOption[]> => {
  try {
    const response = await fetch('/api/gemini/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseContext })
    });
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    throw new Error('Invalid suggestions response');
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

const handleStreamingResponse = async (
  response: Response,
  onThinking?: (thought: string) => void
): Promise<string> => {
  if (!response.ok) {
    let errorMsg = 'Image generation failed';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (e) {
      // Not JSON
    }
    throw new Error(`HTTP Error ${response.status}: ${errorMsg}`);
  }

  if (!response.body) throw new Error("No response body returned from proxy.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Process SSE line by line
    let lines = buffer.split('\n\n');
    buffer = lines.pop() || ''; // Keep the incomplete line in the buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.substring(6).trim();
        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'thought' && onThinking) {
            onThinking(parsed.text);
          } else if (parsed.type === 'image') {
            return parsed.url;
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message || 'Generation error from server');
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes('Generation error')) throw e;
          // Ignore JSON parse errors for incomplete SSE chunks if any
        }
      }
    }
  }

  throw new Error("Stream ended without returning an image.");
};

export const generateHairstyleImage = async (
  images: { front: string | null; side: string | null; back: string | null },
  styleDescription: string,
  styleReferenceImage: string | null = null,
  styleReferenceUrl: string | null = null,
  onThinking?: (thought: string) => void,
  generationMode: GenerationMode = 'fast',
  outputLayout: OutputLayout = 'single',
  imageSize: "0.5K" | "1K" = "1K"
): Promise<string> => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images,
      styleDescription,
      styleReferenceImage,
      styleReferenceUrl,
      generationMode,
      outputLayout,
      imageSize
    })
  });

  return handleStreamingResponse(response, onThinking);
};

export const refineHairstyleImage = async (
  currentImage: string,
  refinementInstruction: string,
  styleReferenceImage: string | null = null,
  styleReferenceUrl: string | null = null,
  onThinking?: (thought: string) => void,
  generationMode: GenerationMode = 'fast',
  outputLayout: OutputLayout = 'single',
  imageSize: "0.5K" | "1K" = "1K"
): Promise<string> => {
  const response = await fetch('/api/gemini/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentImage,
      refinementInstruction,
      styleReferenceImage,
      styleReferenceUrl,
      generationMode,
      outputLayout,
      imageSize
    })
  });

  return handleStreamingResponse(response, onThinking);
};
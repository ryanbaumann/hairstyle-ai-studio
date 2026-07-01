import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Cloud Run's load balancer for client IP rate-limiting
app.set('trust proxy', 1);

// Enable CORS for local development (e.g. Vite on port 5173 contacting Server on port 3001)
// In production, we don't need CORS because the frontend and backend are served from the same origin.
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set body limit to 10MB to accommodate high-res base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not set. API calls will fail.');
}
const ai = new GoogleGenAI({ apiKey });

// Define Models (aligned with geminiModels.ts)
const TEXT_FAST_MODEL = 'gemini-2.5-flash';
const IMAGE_FAST_MODEL = 'gemini-3.1-flash-lite-image';
const IMAGE_DEFAULT_MODEL = 'gemini-3.1-flash-image';

function getImageModelForMode(mode) {
  // HARD CAP: Force all generation modes to the cheapest model to keep costs under $10/mo
  return IMAGE_FAST_MODEL;
}

// --- Rate Limiters ---
// Standard API actions (titles, suggestions): 60 requests per hour per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  message: { error: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Expensive Image operations (generate, refine): HARD CAP 5 requests per hour per IP to protect billing
const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Hard cap reached: Maximum 5 hairstyle generations per hour allowed. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global limit to strictly cap maximum API expenses per instance
const globalImageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // HARD CAP: max 10 image generations per day per instance to keep costs under $10/mo
  keyGenerator: () => 'global',
  message: { error: 'Global daily generation limit reached (10 per day). Please try again tomorrow to help us manage costs.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters to API routes
app.use('/api/gemini/title', generalLimiter);
app.use('/api/gemini/suggestions', generalLimiter);
app.use('/api/gemini/analyze', generalLimiter);
app.use('/api/gemini/generate', globalImageLimiter, imageGenerationLimiter);
app.use('/api/gemini/refine', globalImageLimiter, imageGenerationLimiter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', proxyMode: true, hasApiKey: !!process.env.GEMINI_API_KEY });
});

// --- API Proxy Endpoints ---

// 1. Generate Title
app.post('/api/gemini/title', async (req, res) => {
  const { promptText } = req.body;
  if (!promptText) {
    return res.status(400).json({ error: 'promptText is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: TEXT_FAST_MODEL,
      contents: `Summarize this hairstyle description into a catchy, specific title of 4 words or less. Description: "${promptText}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'text/plain',
      }
    });
    const title = response.text?.trim().replace(/^"|"$/g, '') || 'New Hairstyle';
    res.json({ title });
  } catch (err) {
    console.error('Title generation error:', err);
    res.json({ title: 'New Hairstyle' }); // Return fallback on error
  }
});

// 2. Analyze User Image
app.post('/api/gemini/analyze', async (req, res) => {
  const { base64Image, availableStyles } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: 'base64Image is required' });
  }

  try {
    const [mimeTypePart, data] = base64Image.split(';base64,');
    const mimeType = mimeTypePart.split(':')[1] || 'image/jpeg';
    
    const prompt = `
      Analyze the person in this photo.
      
      1. Determine their gender presentation ('Men' or 'Women').
      2. Recommend the ONE best matching hairstyle from the list below to start with.
         - Choose a style that would suit their face shape and current hair length, or offer a stylish upgrade.
         - Don't go too crazy immediately; pick a solid, attractive option.
         - For men, prefer trending masculine cuts.
         - For women, prefer trending feminine cuts.
      
      Available Styles:
      ${JSON.stringify(availableStyles || [], null, 2)}
      
      Return STRICT JSON:
      {
        "gender": "Men" | "Women",
        "recommendedStyleId": "string (must match one of the IDs above)"
      }
    `;

    const response = await ai.models.generateContent({
      model: TEXT_FAST_MODEL,
      contents: [
        {
          inlineData: { mimeType, data }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    const text = response.text;
    if (!text) {
      return res.json({ gender: 'All', recommendedStyleId: null });
    }

    const result = JSON.parse(text);
    res.json({
      gender: result.gender === 'Male' ? 'Men' : (result.gender === 'Female' ? 'Women' : (result.gender || 'All')),
      recommendedStyleId: result.recommendedStyleId || null
    });
  } catch (err) {
    console.error('Image analysis error:', err);
    res.json({ gender: 'All', recommendedStyleId: null });
  }
});

// 3. Generate Suggestions
app.post('/api/gemini/suggestions', async (req, res) => {
  const { baseContext } = req.body;
  if (!baseContext) {
    return res.status(400).json({ error: 'baseContext is required' });
  }

  try {
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

    const response = await ai.models.generateContent({
      model: TEXT_FAST_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
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
    if (!text) {
      return res.json([]);
    }

    const parsed = JSON.parse(text);
    const sanitized = parsed.map(item => ({
      ...item,
      category: (item.category?.toLowerCase()) || 'style'
    }));
    res.json(sanitized);
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Helper for model fallback in server-side streaming
async function runServerWithModelFallback(initialModel, parts, res) {
  // HARD CAP: Removed fallback chain to prevent escalating costs
  const modelChain = [
    IMAGE_FAST_MODEL
  ];

  const uniqueModelChain = Array.from(new Set(modelChain));
  let startIndex = uniqueModelChain.indexOf(initialModel);
  if (startIndex === -1) startIndex = 0;

  let lastError = null;

  for (let i = startIndex; i < uniqueModelChain.length; i++) {
    const currentModel = uniqueModelChain[i];
    const effectiveSize = "1K"; // Always use 1K for image models

    try {
      const stream = await ai.models.generateContentStream({
        model: currentModel,
        contents: parts,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: effectiveSize,
          }
        }
      });

      let finalImageProp = null;

      for await (const chunk of stream) {
        for (const part of chunk.candidates?.[0]?.content?.parts || []) {
          if (part.thought) {
            res.write(`data: ${JSON.stringify({ type: 'thought', text: part.text || '' })}\n\n`);
          }
          if (part.inlineData) {
            finalImageProp = part.inlineData;
          }
        }
      }

      if (finalImageProp) {
        const url = `data:${finalImageProp.mimeType};base64,${finalImageProp.data}`;
        res.write(`data: ${JSON.stringify({ type: 'image', url })}\n\n`);
        return;
      }
      
      throw new Error("No image data in model response.");
    } catch (error) {
      lastError = error;
      const errorStr = String(error.message || error);
      const isNotFoundError = errorStr.includes("404") || errorStr.includes("NOT_FOUND") || errorStr.includes("not found");
      
      if (isNotFoundError && i < uniqueModelChain.length - 1) {
        console.warn(`Model ${currentModel} failed (404). Trying fallback ${uniqueModelChain[i+1]}...`);
        res.write(`data: ${JSON.stringify({ type: 'thought', text: `\n[System: Model ${currentModel} failed or unavailable. Trying fallback model...]` })}\n\n`);
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error("Model fallback chain exhausted.");
}

// 4. Generate Hairstyle Image
app.post('/api/gemini/generate', async (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const {
    images,
    styleDescription,
    styleReferenceImage,
    styleReferenceUrl,
    generationMode,
    outputLayout
  } = req.body;

  try {
    const parts = [];

    // Add subject images
    if (images?.front) {
      const [mime, data] = images.front.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }
    if (images?.side) {
      const [mime, data] = images.side.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }
    if (images?.back) {
      const [mime, data] = images.back.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }

    // Add reference image
    if (styleReferenceImage) {
      const [mime, data] = styleReferenceImage.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }

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
      - Generation mode: ${generationMode || 'fast'}.
      - Output layout: ${outputLayout || 'single'}.
      - Maintain the Subject's facial identity, face shape, age, skin tone, features, and expression exactly as in the original images.
      - Modify only hair: cut, color, texture, volume, styling, and hairline-adjacent styling.
      - Keep lighting and background premium, clean, and editorial unless the requested style requires otherwise.
      - If output layout is single, create one polished front-view reveal.
      - If output layout is salon-sheet, generate a 1x3 grid with front, side, and back views. Label any inferred view subtly when source side/back views were not provided.
      - If output layout is before-after, create a clean before/after comparison using the original and transformed look.
    `;

    parts.push({ text: promptText });

    const initialModel = getImageModelForMode(generationMode);
    await runServerWithModelFallback(initialModel, parts, res);
    res.end();
  } catch (err) {
    console.error('Image generation error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message || 'Generation failed' })}\n\n`);
    res.end();
  }
});

// 5. Refine Hairstyle Image
app.post('/api/gemini/refine', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const {
    currentImage,
    refinementInstruction,
    styleReferenceImage,
    styleReferenceUrl,
    generationMode,
    outputLayout
  } = req.body;

  try {
    const parts = [];

    // Current Image to edit
    if (currentImage) {
      const [mime, data] = currentImage.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }

    // Optional style reference
    if (styleReferenceImage) {
      const [mime, data] = styleReferenceImage.split(';base64,');
      parts.push({ inlineData: { mimeType: mime.split(':')[1] || 'image/jpeg', data } });
    }

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
      3. Preserve the requested output layout (${outputLayout}) unless the user explicitly asks to change it.
      4. PRESERVE the person's identity, face, expression, age, skin tone, and facial features exactly.
      5. If the instruction is about length, color, or style, apply it consistently across the visible hair.
      6. Model quality mode: ${generationMode || 'fast'}.
    `;

    parts.push({ text: promptText });

    const initialModel = getImageModelForMode(generationMode);
    await runServerWithModelFallback(initialModel, parts, res);
    res.end();
  } catch (err) {
    console.error('Image refinement error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message || 'Refinement failed' })}\n\n`);
    res.end();
  }
});

// --- Serve Static Assets ---
// Serve built client code
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback all other routes to index.html for React SPA router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxy mode is active for Gemini API calls.`);
});

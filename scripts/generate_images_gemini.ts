
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: VITE_GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });
const IMAGE_MODEL = "gemini-3-pro-image-preview";

async function generateImage(prompt: string, filename: string) {
  console.log(`Generating image for: ${prompt}`);
  try {
    // Correct API usage for @google/genai v0.2+
    const result = await genAI.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        // @ts-ignore
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    // Handle response structure for new SDK
    // The response object structure might differ, usually response.candidates[0].content.parts
    // But let's check if the SDK returns a response object directly or if we need .response
    
    // In geminiService.ts: const response = await ai.models.generateContent(...)
    // Then checks response.text or stream.
    
    // Let's assume standard response structure
    const candidates = result.candidates;
    let imageBase64 = null;
    
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
             if (part.inlineData) {
                imageBase64 = part.inlineData.data;
                break;
             }
        }
    }

    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, 'base64');
      const filepath = path.join(process.cwd(), 'public/images', filename);
      fs.writeFileSync(filepath, buffer);
      console.log(`Successfully saved image to ${filepath}`);
    } else {
      console.error(`No image data received for ${prompt}`);
    }
  } catch (error) {
    console.error(`Error generating image for ${prompt}:`, error);
  }
}

async function main() {
  const imagesToGenerate = [
    {
      prompt: "A high-quality, professional portrait of a woman with a Mixie haircut (Pixie-Mullet hybrid). The style features short chic micro-bangs and choppy layers on top, transitioning into longer wispy layers at the nape of the neck. Dark brown hair with subtle texture. Photorealistic, studio lighting.",
      filename: "mixie-cut-woman.png"
    },
    {
      prompt: "A high-quality, professional portrait of a woman with a trendy Shag haircut featuring holographic silver and pastel lavender coloring. Medium length with heavy layering and face-framing curtain bangs. Voluminous, edgy, key lighting. Photorealistic.",
      filename: "holographic-shag-woman.png"
    },
    {
      prompt: "A high-quality, professional portrait of a man with a Modern Curly Fringe / Textured Crop. High skin fade on the sides, with a heavy pile of natural messy curls falling forward onto the forehead. Medium brown hair. Photorealistic, studio lighting.",
      filename: "curly-fringe-man.png"
    },
    {
      prompt: "A high-quality, professional portrait of a man with a Soft Pompadour hairstyle. The hair is swept back with volume but has a matte, natural finish (not greasy). Short tapered scissor-cut sides. Dark blonde hair. Photorealistic, studio lighting.",
      filename: "soft-pompadour-man.png"
    }
  ];

  // Ensure directory exists
  const dir = path.join(process.cwd(), 'public/images');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const item of imagesToGenerate) {
    await generateImage(item.prompt, item.filename);
    console.log("Waiting 10 seconds before next request to avoid rate limits...");
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

main();

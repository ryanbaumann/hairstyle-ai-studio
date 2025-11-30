
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("Error: API_KEY not found in .env file");
  process.exit(1);
}

const genAI = new GoogleGenAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-002" }); // Using a stable model for text-to-image if available, or text-to-text if that's what we have. Wait, Gemini 1.5 doesn't do image generation directly in the same way as specialized models, but the user wants to use the SDK. If they want image generation, we should use the correct model if available, or stick to the tool if that's the only way. 
// Actually, the user's service uses 'gemini-3-pro-image-preview'. Let's try to use that if possible, or fallback to a known working one.
// Given the constraints, I will use the same model as in their service.

const IMAGE_MODEL = "gemini-3-pro-image-preview";

async function generateImage(prompt: string, filename: string) {
  console.log(`Generating image for: ${prompt}`);
  try {
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    
    // Using the correct configuration for image generation if supported by the SDK version
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // @ts-ignore - Specific to image models
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });
    const response = await result.response;
    
    // Check if we got an image back. The SDK might return it in parts.
    let imageBase64 = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }

    if (imageBase64) {
      const buffer = Buffer.from(imageBase64, 'base64');
      const filepath = path.join(process.cwd(), 'public/images', filename);
      fs.writeFileSync(filepath, buffer);
      console.log(`Successfully saved image to ${filepath}`);
    } else {
      console.error(`No image data received for ${prompt}`);
      // Fallback: if we can't generate, at least we tried.
    }
  } catch (error) {
    console.error(`Error generating image for ${prompt}:`, error);
  }
}

async function main() {
  const imagesToGenerate = [
    {
      prompt: "A high-quality, professional portrait of a woman with a sleek, glass-hair bob cut, deep espresso color. Photorealistic, studio lighting, fashion photography style.",
      filename: "sleek-glass-bob-woman.png"
    },
    {
      prompt: "A high-quality, professional portrait of a woman with a textured copper shag hairstyle. Photorealistic, studio lighting, fashion photography style.",
      filename: "copper-shag-woman.png"
    },
    {
      prompt: "A high-quality, professional portrait of a man with a textured crop hairstyle and a skin fade. Photorealistic, studio lighting, fashion photography style.",
      filename: "textured-crop-man.png"
    },
    {
      prompt: "A high-quality, professional portrait of a man with long, flowing natural waves. Photorealistic, studio lighting, fashion photography style.",
      filename: "long-flow-man.png"
    },
    {
      prompt: "A high-quality, professional portrait of a man with a modern, textured mullet hairstyle. Photorealistic, studio lighting, fashion photography style.",
      filename: "modern-mullet-man.png"
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

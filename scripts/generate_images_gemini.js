
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: VITE_GEMINI_API_KEY not found");
  process.exit(1);
}

// Instantiate with API key
const ai = new GoogleGenAI(API_KEY);

async function generateImage(prompt, filename) {
  console.log(`Generating image for: ${prompt}`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const filepath = path.join(process.cwd(), 'public/images', filename);
          fs.writeFileSync(filepath, buffer);
          console.log(`Successfully saved image to ${filepath}`);
          return;
        }
      }
    }
    console.error(`No image data received for ${prompt}`);
    console.log("Response:", JSON.stringify(response, null, 2));
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

# HairStyle AI Studio

A "Vibe Coding" experiment using Gemini 3 and React to create a real-time AI hairstyle makeover studio.

## Features
- **3D-Aware Hairstyle Generation**: Uses a 1x3 matrix (Front, Side, Back) to generate consistent hairstyles.
- **Thinking Process Visualization**: Shows Gemini's real-time reasoning stream.
- **Auto-Style Recommendation**: Analyzes your photo to suggest the best trending style.
- **Local Asset Generation**: Utilities to generate custom stylesheet assets.

## Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env`:
   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```

3. **Run**
   ```bash
   npm run dev
   ```

## Utilities
- **Generate Assets**: `npx tsx scripts/generate_images_gemini.ts` - Generates placeholder assets using Gemini.
- **Optimize Images**: `sh scripts/optimize-hairstyles.sh` - Optimizes images for web.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Google GenAI SDK (Gemini 3 Pro + Flash Lite)

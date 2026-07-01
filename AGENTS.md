# AGENTS.md — Hairstyle AI Studio

## Project overview
Hairstyle AI Studio is a React + Vite + TypeScript web app for AI hairstyle visualization using Gemini image models.

## Key files
- `app/services/geminiService.ts`: Gemini calls, prompts, image generation/refinement.
- `app/services/geminiModels.ts`: Canonical model names and model/layout labels.
- `app/hooks/useAppFlow.ts`: Flow state, history, generation/refinement actions.
- `app/components/`: upload, style, loading, result, and refinement UI.
- `app/types.ts`: shared app state and generated-image metadata.

## Commands
- `npm install`: install dependencies.
- `npm run dev`: start local Vite server.
- `npm run typecheck`: TypeScript validation.
- `npm run build`: production build.
- `npm run check`: typecheck plus build.

## Gemini model policy
Use constants from `app/services/geminiModels.ts`; do not hardcode model strings in components. Default production-quality image work should use `gemini-3.1-flash-image`; fast previews should use `gemini-3.1-flash-lite-image`; premium work should use `gemini-3-pro-image`.

## Secret handling
- `VITE_GEMINI_API_KEY` is for local demos only and is public in the browser bundle.
- Production deployments must use a server-side `GEMINI_API_KEY` through a serverless/API proxy.
- Never commit real API keys or screenshots containing keys.

## UX rules
Prioritize a polished mobile-first salon workflow: Upload → Style/model/layout → Generate → Refine/share/download. Avoid blocking `alert()` calls; use inline, recoverable UI.

## Privacy rules
User face images are sensitive. Clearly explain when images are sent to Gemini, keep browser history local unless server storage is explicitly added, and preserve delete/clear-history affordances.

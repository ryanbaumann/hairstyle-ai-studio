# Hairstyle AI Studio

Hairstyle AI Studio is a modern React + Vite app for trying on hairstyles with Google's Gemini image-generation models. It supports uploaded front/side/back references, curated style presets, free-form style prompting, refinement, downloads, and browser-local history.

## Highlights

- **Gemini 3.1 image workflow**: Fast Preview, Studio Quality, and Pro / 4K model modes are centralized in `services/geminiModels.ts`.
- **Flexible result layouts**: Single Reveal, Salon Sheet, and Before / After generation metadata are built into the flow.
- **Privacy-aware local history**: Generated images are stored in browser IndexedDB unless you add server storage.
- **Agent-ready repo docs**: See `AGENTS.md`, `.codex/skills/hairstyle-ai-studio/SKILL.md`, and `CHANGELOG.md`.

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind utility classes
- `@google/genai`
- Lucide React icons

## Gemini Models

Model names are defined in `services/geminiModels.ts`:

| UX mode | Model |
| --- | --- |
| Fast Preview | `gemini-3.1-flash-lite-image` |
| Studio Quality | `gemini-3.1-flash-image` |
| Pro / 4K | `gemini-3-pro-image` |

Text/title and style-assist calls use the configured fast text model constants in the same file.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

For local demos only, set:

```env
VITE_GEMINI_API_KEY=your_local_demo_key
```

> Important: `VITE_*` variables are bundled into frontend code and are visible to browser users. Do not put a production-owned secret in `VITE_GEMINI_API_KEY`.

## Production Secret Handling

For a public deployment, use a server-side API boundary:

1. Store the real key as `GEMINI_API_KEY` in your hosting provider's secret manager.
2. Create a serverless/API route that calls Gemini from the server.
3. Have the browser call your route instead of directly calling Gemini with a frontend key.
4. Validate request sizes and image MIME types before forwarding to Gemini.

The app currently supports direct browser calls for local demos and AI Studio-style key selection. Treat that path as a demo/development mode, not a production secret strategy.

## Scripts

```bash
npm run dev        # local Vite server
npm run typecheck  # TypeScript validation
npm run build      # production build
npm run preview    # preview production build
npm run check      # typecheck + build
```

## Privacy Notes

- User images are sent to Gemini for generation/refinement.
- Generated history is stored locally in this browser using IndexedDB.
- Users can delete individual history items or clear all history.
- Only upload images you own or have permission to process.

## Agent Workflow

Future AI agents should read:

1. `AGENTS.md`
2. `.codex/skills/hairstyle-ai-studio/SKILL.md`
3. `services/geminiModels.ts`
4. `services/geminiService.ts`
5. `hooks/useAppFlow.ts`

Run `npm run check` before committing changes.

## Image Generation & Optimization

Generate preset images:

```bash
npx tsx scripts/generate_images_gemini.ts
```

Optimize generated images:

```bash
sh scripts/optimize-hairstyles.sh
```

## License

MIT

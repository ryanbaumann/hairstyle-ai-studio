# Hairstyle AI Studio Skill

Use this skill when changing this repository's Gemini model integration, UX flow, deployment docs, or agent-readiness files.

## Workflow
1. Read `AGENTS.md` first.
2. Check `services/geminiModels.ts` before changing any model names.
3. Keep Gemini prompts in `services/geminiService.ts`, not components.
4. Keep app orchestration in `hooks/useAppFlow.ts`.
5. Keep shared metadata in `types.ts`.
6. Run `npm run typecheck` and `npm run build` before committing.

## Secret checklist
- Never put production keys in `VITE_*` variables.
- Use `VITE_GEMINI_API_KEY` only for local demos.
- Use server-side `GEMINI_API_KEY` for deployed apps.
- Update `.env.example` and README when environment behavior changes.

## UX checklist
- Mobile-first upload/style/result paths.
- Inline recovery instead of alerts.
- Clear privacy copy near uploads.
- Result actions: download, refine, regenerate, start over.
- Model/layout choices should be understandable to non-technical users.

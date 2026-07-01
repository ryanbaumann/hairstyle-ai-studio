# 📝 Changelog

## 🚀 Unreleased

### ✨ Added
- Unit tests for `services/geminiService.ts` using Vitest to verify prompt construction, schema parameters, streaming outputs, and error handling.
- Test script `"test": "vitest run"` in `package.json` to execute unit tests.
- Gemini image model mode configuration for Fast Preview, Studio Quality, and Pro / 4K.
- Output layout metadata for Single Reveal, Salon Sheet, and Before / After generation.
- Repo-local `AGENTS.md` and a workspace agent skill for future AI-agent readiness.
- `.env.example` documenting local demo keys versus production server-side secrets.
- Typecheck/check package scripts.

### 🐛 Fixed
- Replaced non-existent `gemini-3.1-flash-lite-image` model reference with `gemini-3.1-flash-image` and `gemini-3-pro-image` to fix `404 Not Found` API errors.
- Updated text models to `gemini-3.1-flash-lite`.
- Fixed mobile viewport layout issues by replacing `h-screen` with `h-[100dvh]` and adding bottom padding to avoid interference with the Safari address bar and sticky footers.
- Fixed a UI bug where the "Update" button in the "Refine & Perfect" view was unintentionally hidden on mobile screens.

### 🔄 Changed
- Migrated all Gemini calls to standard Models API (`models.generateContent` and `models.generateContentStream`) due to CORS preflight restrictions on browser-side calls in a pure client-side SPA.
- Set the default generation mode to 'fast'.
- Supported 500kb progressive load (using 0.5K resolution for fast previews) before upgrading to 1K studio-quality generation.
- Updated app copy and UI controls around current Gemini 3.1 image model workflows.
- Replaced alert-based generation/refinement failures with recoverable inline error state.
- Clarified privacy copy for user-uploaded images and browser-local history.

### 🔒 Security
- Documented that `VITE_GEMINI_API_KEY` is public and only appropriate for local/demo use.

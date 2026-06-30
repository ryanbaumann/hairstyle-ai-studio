# Changelog

## Unreleased

### Added
- Gemini image model mode configuration for Fast Preview, Studio Quality, and Pro / 4K.
- Output layout metadata for Single Reveal, Salon Sheet, and Before / After generation.
- Repo-local `AGENTS.md` and a Codex skill for future AI-agent readiness.
- `.env.example` documenting local demo keys versus production server-side secrets.
- Typecheck/check package scripts.

### Changed
- Updated app copy and UI controls around current Gemini 3.1 image model workflows.
- Replaced alert-based generation/refinement failures with recoverable inline error state.
- Clarified privacy copy for user-uploaded images and browser-local history.

### Security
- Documented that `VITE_GEMINI_API_KEY` is public and only appropriate for local/demo use.

# Deployment Guide

## Recommended production shape

Use a server-side API boundary for Gemini calls. The browser should upload image data and style instructions to your API route; the API route should read `GEMINI_API_KEY` from the host secret manager and call Gemini from the server.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | Browser bundle | Local demo only. Public to users. |
| `GEMINI_API_KEY` | Server only | Production Gemini secret. Never expose to client code. |

## Vercel-style deployment checklist

1. Add `GEMINI_API_KEY` in Project Settings → Environment Variables.
2. Keep `VITE_GEMINI_API_KEY` unset in production unless you intentionally want users to provide/demo their own exposed key.
3. Add or connect a serverless route such as `/api/gemini/generate` before launching publicly.
4. Validate request payload sizes, MIME types, and consent UX before forwarding images to Gemini.
5. Run `npm run check` before deployment.

## Local demo checklist

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_GEMINI_API_KEY` only when you understand that it is visible in browser code.

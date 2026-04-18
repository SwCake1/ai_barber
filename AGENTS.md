# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Vite + React + TypeScript app. UI entry points live in `src/main.tsx` and `src/App.tsx`. Gemini integration is isolated in `src/services/gemini.ts`. Global styling lives in `src/index.css`, with Tailwind v4 imported there. Static app metadata is in `metadata.json`, and the HTML shell is `index.html`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server on port `3000` and expose it on `0.0.0.0`.
- `npm run build`: create a production bundle in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run `tsc --noEmit` as the current type-check gate.
- `npm run clean`: remove `dist/`.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Follow the existing code style: 2-space indentation, semicolons, and compact imports. Name components and exported types in `PascalCase`, functions and variables in `camelCase`, and keep service-specific logic under `src/services/`. Prefer small, explicit state transitions over packed handlers. Keep UI copy and error messages intentional; this app already mixes English code with Russian-facing text, so avoid accidental language drift.

## Testing Guidelines
There is no test framework configured yet. Do not fake coverage claims. At minimum, run `npm run lint` and `npm run build` before submitting changes. If you add tests, keep them next to the feature as `*.test.ts` or `*.test.tsx` and document the command you introduce in `package.json`.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so there is no observable local convention to copy. Use short, imperative commit subjects such as `feat: add retry handling for Gemini errors` or `fix: reset previews on new upload`. PRs should state the user-visible change, note any config or env updates, and include screenshots or short recordings for UI changes.

## Security & Configuration Tips
Keep secrets out of the repo. Store the Gemini key in `.env.local` as `GEMINI_API_KEY` and update `.env.example` when configuration changes. Never hardcode API keys or commit generated `dist/` output.

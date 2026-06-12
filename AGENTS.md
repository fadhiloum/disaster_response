# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js-compatible Vinext app for disaster response coordination. Main app code lives in `app/`: pages and route handlers are colocated by feature, shared UI is in `app/components`, data access is in `app/lib/data`, and OpenAI helpers are in `app/lib/ai`. API routes live under `app/api`. Tests live in `tests/`, currently using Vitest. Static assets and DOCX templates are in `public/`. Prisma schema and migrations are in `prisma/`; Drizzle/D1 scaffolding is in `db/`, `drizzle/`, and `examples/d1/`. Project documentation is in `docs/`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Vinext dev server.
- `npm run test`: run Vitest tests once.
- `npm run lint`: run ESLint over the project.
- `npm run vercel-build`: run the production Next.js build used by Vercel.
- `npm run prisma:generate`: generate the Prisma client.
- `npm run prisma:migrate`: run local Prisma migrations.
- `npm run db:generate:drizzle`: generate Drizzle migrations.

Run `npm run test`, `npm run lint`, and `npm run vercel-build` before deployment-facing changes.

## Coding Style & Naming Conventions

Use TypeScript, React server components by default, and client components only when interactivity is required. Follow existing two-space indentation and concise named exports. Component files use kebab case, such as `ai-sitrep-draft.tsx`; exported components use PascalCase. Keep backend access behind `app/lib/data` rather than importing demo data, Prisma, or Drizzle directly in pages. Keep OpenAI calls server-side only.

## Testing Guidelines

Vitest is the test framework. Name tests by behavior and place them in `tests/` with `*.test.ts`. Mock external services such as OpenAI; tests must not call live APIs or require real secrets. Prioritize route handlers, repository adapters, and high-risk data transformations.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries, for example `integrate openai`, `backend selector`, and `fix vercel error`. Keep commits focused and descriptive. Pull requests should include a summary, verification commands run, screenshots for UI changes, linked issues when available, and notes for env var or deployment changes.

## Security & Configuration Tips

Use `.env.example` as the public template only. Never commit real `.env` secrets. `OPENAI_API_KEY` must remain server-side and must not use a `NEXT_PUBLIC_` prefix. Select data mode with `DATA_BACKEND=demo|prisma|drizzle`; Prisma uses `DATABASE_URL`. For production, configure secrets in Vercel environment variables instead of relying on local `.env`.

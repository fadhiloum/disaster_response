# Disaster Response Platform

MVP web app for coordinating incidents, needs, resources, tasks, partners, maps,
and situation reports during emergency response operations.

## Current Build Slice

- Dashboard with active incidents, affected population, urgent needs, open tasks,
  resource gaps, and map preview
- Incident list, create form, and incident detail view
- Incident detail sections for overview, map, needs, tasks, resources, partners,
  and situation reports
- Resource inventory view
- Full operational map view
- SitRep list, preview, and text export endpoint
- AI-assisted SitRep drafting through the OpenAI Responses API
- Admin view for users, roles, and organizations
- Demo-backed API routes matching the MVP contract
- Shared data repository with demo, Prisma, and Drizzle backend slots

## Tech Shape

- Next.js-compatible vinext app
- React and TypeScript
- Tailwind CSS
- Prisma schema targeting PostgreSQL
- Drizzle/D1 scaffold retained for Cloudflare-oriented deployments
- OpenAI SDK for AI-assisted drafting
- Demo data in `app/lib/demo-data.ts`

## Run Locally

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution blocks the npm shim:

```bash
npm.cmd install
npm.cmd run dev
```

## Verify

```bash
npm run test
npm run lint
npm run vercel-build
```

## Persistence Notes

The app reads data through `app/lib/data`. Select the backend with
`DATA_BACKEND`:

- `demo`: in-repo sample data, no database required
- `prisma`: PostgreSQL through Prisma and `DATABASE_URL`
- `drizzle`: reserved Drizzle/D1 adapter slot

The database contract lives in `prisma/schema.prisma`, with `DATABASE_URL`
documented in `.env.example`.

Next persistence tasks:

- Add seed data for Prisma-backed environments.
- Fill any remaining DTO fields that are currently derived/defaulted by the
  Prisma adapter.
- Implement the Drizzle/D1 adapter tables if Cloudflare D1 becomes a target.
- Add server-side role checks to mutation routes.

## OpenAI Notes

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` to enable AI-assisted SitRep
drafting. The key is used only in server routes and must not be exposed to the
browser.

See `docs/OpenAI-Integration.md` for endpoint behavior, local checks, payload
details, and production guardrails. See `docs/SitRep-Drafting.md` for the
feature workflow and SitRep-specific test steps.

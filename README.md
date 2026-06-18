# Disaster Response Platform

MVP web app for coordinating programs, needs, resources, tasks, partners, maps,
and situation reports during emergency response operations.

## Current Build Slice

- Dashboard with active programs, affected population, urgent needs, open tasks,
  resource gaps, and map preview
- Program list, create form, and program detail view
- Program creation fields for master budget, sub-program allocations, and
  initial fund requests
- Program detail sections for overview, map, needs, tasks, deployment, budget,
  partners, and situation reports
- Program detail workflow forms for responder need submission, coordinator task
  assignment, and manual SitRep creation
- Resource inventory view
- Deployment workspace resource create/update form
- Full operational map view
- SitRep list, preview, text export, and PDF export endpoint
- AI-assisted SitRep drafting through the OpenAI Responses API with live web
  context and visible source links
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

## Installation
- Fork the repository first.
- Create a new folder on your desktop, open the folder on [VSCode](https://code.visualstudio.com/).
- Clone your repository, use git clone command.
  

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

Apply migrations and seed a Prisma-backed database with:

```bash
npm run prisma:deploy
npm run prisma:seed
```

Next persistence tasks:

- Implement the Drizzle/D1 adapter tables if Cloudflare D1 becomes a target.
- Continue hardening validation, role-aware UI states, and audit logging.

Prisma-backed mode now persists program, need, task, resource, resource
commitment, partner activity, SitRep, and concept note mutations through the
shared data repository.

## OpenAI Notes

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` to enable AI-assisted SitRep
drafting. The generator uses the Responses API web search tool to include recent
external context from authorities, NGOs, UN/IFRC-style sources, and reputable
local reporting. The key is used only in server routes and must not be exposed to
the browser.

See `docs/OpenAI-Integration.md` for endpoint behavior, local checks, payload
details, and production guardrails. See `docs/SitRep-Drafting.md` for the
feature workflow and SitRep-specific test steps.

## Auth Notes

The current auth slice uses an HTTP-only `dr_session_user` cookie backed by demo
users from the shared data repository. Use the sidebar account control to sign
in as a demo user, or log in locally with:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maya.chen@example.org"}'
```

Mutation routes now require roles. Coordinators and admins can create programs,
tasks, resources, SitReps, and AI drafts. Responders can submit needs and update
tasks. Partners can create and update partner activities.

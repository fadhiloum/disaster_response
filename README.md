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
- Admin view for users, roles, and organizations
- Demo-backed API routes matching the MVP contract
- Prisma schema for the PostgreSQL persistence pass

## Tech Shape

- Next.js-compatible vinext app
- React and TypeScript
- Tailwind CSS
- Prisma schema targeting PostgreSQL
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
npm run build
```

## Persistence Notes

The first build slice uses seeded in-repo data so the product can be evaluated
immediately. The database contract lives in `prisma/schema.prisma`, with
`DATABASE_URL` documented in `.env.example`.

Next persistence tasks:

- Add Prisma and `@prisma/client` dependencies.
- Generate the Prisma client.
- Create migrations for PostgreSQL.
- Replace demo route handlers with database-backed handlers.
- Add server-side role checks to mutation routes.

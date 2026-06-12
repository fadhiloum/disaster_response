# Disaster Response Platform Architecture

## Overview

The Disaster Response Platform is a Next.js-compatible Vinext application for
coordinating disaster response programs, needs, tasks, resources, partner
activities, maps, budgets, and situation reports. The architecture keeps UI,
route handlers, data access, authentication, and AI integrations separated so
the MVP can run in demo mode while still supporting Prisma-backed production
persistence.

## System Context

```text
Users
  |
  v
Next.js App Router pages and client components
  |
  v
Route handlers under app/api
  |
  +--> Auth helpers and role checks
  +--> Shared data repository
  +--> OpenAI server-side helpers
  |
  v
Data backend selected by DATA_BACKEND
  |
  +--> demo in-memory repository
  +--> Prisma/PostgreSQL repository
  +--> reserved Drizzle/D1 adapter
```

The app is built around server-rendered pages by default. Client components are
used only where interactivity is required, such as workflow forms, map filters,
session controls, AI draft interactions, and status controls.

## Application Layers

### Presentation Layer

Primary pages live under `app/`:

- `app/page.tsx` and `app/dashboard/page.tsx`: common operating picture.
- `app/incidents`: program list, creation, edit, and detail workflows.
- `app/deployment`: resources, teams, and logistics workspace.
- `app/map`: operational map view.
- `app/sitreps`: saved situation report list and exports.
- `app/admin`: demo users, roles, and organizations.

Shared UI components live in `app/components`. Feature-specific interactive
forms are colocated with their route segments, for example
`app/incidents/[id]/incident-workflow-forms.tsx`.

### API Layer

Route handlers live under `app/api`. They validate request payloads, enforce
roles for mutations, call the shared data repository, and write audit logs for
important operational changes.

Major route groups:

- `app/api/auth`: login and logout.
- `app/api/me`: current user lookup.
- `app/api/incidents`: program CRUD and nested workflow routes.
- `app/api/needs`, `app/api/tasks`, `app/api/resources`, `app/api/activities`:
  direct mutation routes for operational entities.
- `app/api/sitreps`: SitRep lifecycle updates and text/PDF exports.
- `app/api/ai`: server-side AI drafting routes.

### Data Access Layer

All backend data access goes through `app/lib/data`. Pages and route handlers
should not import demo data, Prisma, or Drizzle directly.

The repository interface is defined in `app/lib/data/repository.ts` and covers:

- Users and current user lookup.
- Dashboard summary.
- Programs, needs, tasks, resources, teams, partner activities.
- Situation reports and lifecycle updates.
- Concept note versions.
- Audit log creation and reads.

Backend selection is controlled by `DATA_BACKEND`:

- `demo`: in-repo demo data for local development and tests.
- `prisma`: PostgreSQL persistence through Prisma.
- `drizzle`: reserved adapter slot for future D1/Drizzle work.

### Persistence Layer

Prisma schema and migrations live in `prisma/`. PostgreSQL is the production
target. The data model is PostGIS-ready through latitude and longitude fields,
but advanced geospatial queries are intentionally deferred until distance or
spatial filtering requirements justify PostGIS-specific implementation.

Drizzle/D1 scaffolding lives under `db/`, `drizzle/`, and `examples/d1/`, but
the active durable backend is Prisma.

## Core Domain Model

The MVP domain centers on these records:

- `User` and organization membership.
- `Incident`, used as the program/response object.
- `NeedReport`, field-reported demand.
- `ResponseTask`, operational follow-up.
- `Resource` and resource commitments.
- `DeployedTeam`.
- `PartnerActivity`, the partner 3W record.
- `SituationReport`, including status, revision, review metadata, and exports.
- `AuditLog`, used to trace operational mutations.
- `ConceptNote`, used for reviewed concept-note drafts.

Program records also include master budget controls, sub-program allocations,
and fund requests.

## Authentication And Authorization

Current MVP authentication uses HTTP-only cookie sessions backed by repository
users. Route helpers in `app/lib/auth.ts` provide current-user lookup and role
checks.

Mutation routes use role checks to limit write access. The next production
architecture step is to replace demo cookie auth with a production identity
provider, then add route-level protection for private pages and role-aware UI
states.

## Audit Trail

Audit creation is centralized through `app/api/audit.ts`. Core mutation routes
record actor, action, entity type, entity ID, summary, timestamp, and optional
before/after data.

Program detail pages surface recent operational and SitRep audit entries so
coordinators can review important changes without inspecting the database.

## AI Integration

OpenAI usage is server-side only under `app/lib/ai` and `app/api/ai`.

Current AI workflows:

- SitRep drafting from program, needs, tasks, resources, teams, partner
  activities, prior reports, budget context, and recent web context.
- Concept-note drafting as an editable, versioned coordinator-reviewed draft.

AI output remains draft-only until reviewed by a coordinator. Future AI
workflows such as map analysis, task prioritization, operational chat, resource
matching, and program creation should add privacy rules, schemas, rate limits,
request logging, review states, audit states, and mocked route tests before
writing operational records.

## Mapping

The current map is a lightweight client component in `app/components/ops-map.tsx`.
It supports layers and filters for programs, needs, resources, teams, and partner
activities.

Provider direction:

- Keep the current lightweight map for the MVP.
- Move to Leaflet first if the app needs true pan/zoom, clustering, GeoJSON, or
  tile-layer controls.
- Reserve Mapbox for a later polished production map if pricing, token
  management, and licensing requirements are acceptable.
- Add PostGIS-backed queries only when advanced spatial filtering or distance
  calculations are required.

## Reporting

Situation reports can be created manually or generated from reviewed AI drafts.
Saved SitReps support lifecycle status, revision tracking, review metadata, and
audit logging.

Export support is implemented in `app/api/sitreps/[id]/export/route.ts`:

- Operational text/PDF.
- Donor text/PDF.
- Executive text/PDF.

The PDF generator is intentionally dependency-light. Production donor templates
can be refined later if branding, print, or layout requirements become stricter.

## Testing And Verification

Vitest tests live in `tests/`. Current coverage focuses on route handlers,
repository writes, AI draft routes, SitRep lifecycle behavior, exports, and
high-risk data transformations.

Use these commands before deployment-facing changes:

```bash
npm run test
npm run lint
npm run vercel-build
```

`npm run vercel-build` runs Prisma migration deployment, Prisma generation, and
the production Next.js build. It requires the configured database to be
reachable and able to acquire Prisma migration locks.

## Deployment

The intended production deployment is Vercel plus managed PostgreSQL. Required
configuration includes:

- `DATA_BACKEND=prisma`
- `DATABASE_URL`
- `OPENAI_API_KEY` for server-side AI workflows
- Optional `OPENAI_MODEL`

Secrets must be configured in the deployment environment. OpenAI keys must stay
server-side and must not use a `NEXT_PUBLIC_` prefix.

## Architectural Priorities

Near-term hardening should focus on:

- Production authentication and route-level page protection.
- Role-aware UI states.
- Validation and error-state consistency.
- SitRep edit and approval UX polish.
- Permission-check tests and repository adapter coverage.
- Accessibility and mobile review for field workflows.

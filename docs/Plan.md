# Disaster Response Platform - Implementation Plan

## Objective

Build the MVP described in `Project.md`: a web app for coordinating disaster response programs, needs, resources, tasks, partner activities, maps, budgets, and situation reports.

## Guiding Principles

- Prioritize operational clarity over decorative UI.
- Keep workflows usable on both desktop command centers and mobile field devices.
- Start with a reliable core data model, then layer role-based permissions and map views on top.
- Make the dashboard useful early, even before every advanced feature is complete.
- Keep APIs, validation, and database access cleanly separated.

## Proposed Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes or route handlers
- Database: PostgreSQL with Prisma
- Alternate persistence: Drizzle/D1 adapter slot retained behind the shared data repository
- AI: OpenAI Responses API for assisted operational drafting
- Geospatial: PostGIS-ready latitude and longitude fields for MVP, with PostGIS queries added as needed
- Auth: NextAuth or Supabase Auth
- Maps: Leaflet for MVP, with Mapbox as an optional upgrade
- File storage: S3-compatible storage or Supabase Storage
- Deployment: Vercel plus managed PostgreSQL

## Current Progress

As of the current codebase, the app has moved beyond initial scaffolding into a
working demo MVP slice:

- App shell, navigation, dashboard, program pages, resource view, map view,
  deployment workspace, SitRep view, and admin view are implemented.
- API route handlers exist for programs, needs, tasks, resources, partner
  activities, SitReps, auth placeholders, current user, concept-note export, and
  AI SitRep drafting.
- Auth now has an HTTP-only cookie session backed by repository users, with
  login, logout, current-user lookup, and role checks on write routes.
- Data access is centralized behind `app/lib/data` with `demo`, `prisma`, and
  reserved `drizzle` backend modes selected by `DATA_BACKEND`.
- Prisma schema and initial migration exist for PostgreSQL-oriented
  persistence, with production migrations applied through `npm run
  prisma:deploy` and seed data loaded through `npm run prisma:seed`.
- Program records now include master budget controls, sub-program allocations,
  and fund requests that must remain within the master budget.
- Prisma-backed program reads now preserve operational location/update fields,
  sub-program allocations, fund requests, and resource assignments.
- OpenAI SitRep drafting is implemented through the Responses API with required
  web search context and covered by mocked Vitest route tests.
- The current OpenAI integration is deliberately scoped to generating editable
  situation report drafts from existing program data plus recent external web
  context. It does not yet power map analysis, task prioritization, chat,
  resource matching, program creation, report export, or document generation.
- Reviewed AI SitRep drafts can now be saved through
  `POST /api/incidents/:id/sitreps` and persisted through the shared data
  repository.
- Local verification commands are available through `npm run test`,
  `npm run lint`, and `npm run vercel-build`.

Remaining MVP work is mostly hardening: production auth provider integration,
production persistence writes, form validation depth, richer tests, audit logs,
and deployment environment setup.

## Phase 1: Project Foundation

Status: mostly complete.

### Goals

- Create the app shell and shared layout.
- Establish data modeling, validation, and development conventions.
- Make the project easy to run locally.

### Work Items

- Completed: Scaffold Next.js-compatible Vinext app with TypeScript and
  Tailwind CSS.
- Completed: Add Prisma schema and initial migration for PostgreSQL.
- Completed: Define base models for users, organizations, programs, needs,
  resources, tasks, partner activities, teams, and SitReps.
- Completed: Add realistic in-repo demo data for local development.
- Completed: Add production-grade Prisma seed data and seed command for
  Prisma-backed environments.
- Completed: Create shared app shell and reusable UI primitives.
- Completed: Add environment documentation in `.env.example` and README.

### Exit Criteria

- App runs locally.
- Database schema migrates successfully.
- Seed data populates a realistic demo environment.
- Core layout and navigation are in place.

## Phase 2: Authentication and Roles

Status: partially complete.

### Goals

- Let users sign in.
- Restrict actions by role.
- Support the MVP personas from the product spec.

### Roles

- Admin: full access
- Coordinator: manage programs, tasks, resources, and reports
- Responder: create updates, needs, and task status changes
- Partner: update own 3W activities
- Viewer: read-only dashboard access

### Work Items

- Completed: Add cookie-backed login, logout, and current-user API routes.
- Completed: Add admin view showing demo users, roles, and organizations.
- Completed: Add shared server-side auth helpers.
- Completed: Add role checks for mutation routes.
- Remaining: Replace demo cookie auth with a production authentication provider.
- Remaining: Add route-level protection for private pages.
- Remaining: Hide or disable unavailable UI actions by role.
- Remaining: Add audit logs that record the authenticated actor for mutations.

### Exit Criteria

- Users can log in and out.
- Unauthorized users cannot access protected data mutations.
- Each role sees only the actions available to it.

## Phase 3: Program Management

Status: partially complete for demo mode.

### Goals

- Make programs the central organizing object for response activity.

### Work Items

- Completed: Build `/incidents` list page with filtering workspace.
- Completed: Build `/incidents/new` create form using product-facing program terminology.
- Completed: Add master budget, sub-program allocation, and initial fund request fields to program creation.
- Completed: Build `/incidents/[id]` detail page with sections for:
  - Overview
  - Map
  - Needs
  - Tasks
  - Deployment
  - Budget control
  - Partners
  - Situation Reports
- Completed: Implement program API route handlers using the current `/api/incidents` paths:
  - `GET /api/incidents`
  - `POST /api/incidents`
  - `GET /api/incidents/:id`
  - `PATCH /api/incidents/:id`
  - `DELETE /api/incidents/:id`
- Completed: Add `/incidents/[id]/edit` page.
- Remaining: Persist create/update/delete operations in Prisma-backed mode.
- Remaining: Add stricter validation for required fields, status, severity,
  disaster type, and coordinates.

### Exit Criteria

- Coordinators can create and update programs.
- Users can view program details.
- Program data is visible across dashboard and detail views.

## Phase 4: Needs and Task Coordination

Status: partially complete for demo mode.

### Goals

- Support field reporting and operational follow-through.

### Work Items

- Completed: Show program needs and task tables in program detail.
- Completed: Implement route handlers:
  - `GET /api/incidents/:id/needs`
  - `POST /api/incidents/:id/needs`
  - `PATCH /api/needs/:id`
  - `GET /api/incidents/:id/tasks`
  - `POST /api/incidents/:id/tasks`
  - `PATCH /api/tasks/:id`
- Remaining: Add responder-facing need submission UI.
- Remaining: Add coordinator task creation and assignment UI.
- Remaining: Persist status workflow changes in Prisma-backed mode.
- Remaining: Add validation and role checks.

### Exit Criteria

- Responders can submit needs with locations.
- Coordinators can verify needs and assign tasks.
- Responders can update task status.

## Phase 5: Resources and Partner 3W

Status: partially complete for demo mode.

### Goals

- Track logistics and partner response coverage.

### Work Items

- Completed: Build `/resources` inventory page.
- Completed: Show program resources and partner 3W activity in program detail.
- Completed: Implement route handlers:
  - `GET /api/resources`
  - `POST /api/resources`
  - `PATCH /api/resources/:id`
  - `POST /api/resources/:id/commit`
  - `GET /api/incidents/:id/activities`
  - `POST /api/incidents/:id/activities`
  - `PATCH /api/activities/:id`
- Completed: Add deployment workspace for teams, programs, and resources.
- Remaining: Add full resource creation and update forms.
- Remaining: Persist resource commitments and partner activity changes in
  Prisma-backed mode.
- Remaining: Add validation, role checks, and stock conflict handling.

### Exit Criteria

- Logistics officers can track stock and commitments.
- Coordinators can identify resource gaps.
- Partner activities are visible by program and location.

## Phase 6: Dashboard and Map

Status: mostly complete for demo mode.

### Goals

- Provide a common operating picture.

### Work Items

- Completed: Build `/dashboard` and home dashboard with:
  - Active programs
  - Severity mix
  - Open urgent needs
  - Resource gaps
  - Open tasks
  - Latest situation updates
- Completed: Build `/map` operational map view.
- Completed: Add map data for programs, needs, resources, teams, and partner
  activities.
- Remaining: Add richer map layer controls and filters by program, type,
  urgency, status, and organization.
- Remaining: Evaluate Leaflet or Mapbox if the current map needs more advanced
  geospatial interaction.

### Exit Criteria

- Dashboard shows active response status at a glance.
- Map displays key operational entities with useful filters.
- Mobile layout remains usable for responders in the field.

## Phase 7: Situation Reports

Status: partially complete, with AI drafting implemented.

### Goals

- Generate concise reports from program data.
- Support user-reviewed AI drafting without automatically publishing generated text.

### Work Items

- Completed: Build `/sitreps` list page.
- Completed: Build Situation Reports section in program detail.
- Remaining: Add create/edit flow for SitRep sections:
  - Summary
  - Current impact
  - Priority needs
  - Response actions
  - Gaps
  - Next operational period priorities
- Completed: Add text export endpoint.
- Remaining: Add PDF export after report layout is stable.
- Completed: Add AI-assisted draft generation from program, needs, task,
  resource, team, partner, previous report, budget, and fund request context.
- Completed: Require OpenAI web search during SitRep generation to add recent
  external updates from authorities, other NGOs, UN/IFRC-style sources, and
  reputable local reporting.
- Completed: Return and display web source links below the editable SitRep draft.
- Completed: Save reviewed AI drafts as official SitRep records through the
  SitRep POST route.
- Completed: Implement route handlers:
  - `GET /api/incidents/:id/sitreps`
  - `POST /api/incidents/:id/sitreps`
  - `GET /api/sitreps/:id/export`
  - `POST /api/ai/incidents/:id/situation-report`
- Completed: Add focused docs in `docs/OpenAI-Integration.md` and
  `docs/SitRep-Drafting.md`.
- Completed: Add Vitest coverage for the AI SitRep draft and SitRep save routes.
- Remaining: Add PDF export.
- Remaining: Add approval workflow and audit trail.

### Exit Criteria

- Coordinators can create SitReps for programs.
- Coordinators can generate editable AI SitRep drafts from program data and
  recent web context.
- SitReps can be exported as text or PDF.
- Report content reflects current program data.

## Phase 8: Admin and Hardening

Status: started.

### Goals

- Make the MVP safer, clearer, and ready for demo or pilot use.

### Work Items

- Completed: Build `/admin` for demo users, roles, and organizations.
- Completed: Add initial Vitest setup and route tests for OpenAI SitRep
  drafting.
- Completed: Add contributor guide in `AGENTS.md`.
- Remaining: Add audit-friendly timestamps and created-by fields consistently
  across mutation paths.
- Remaining: Add error states, empty states, loading states, and form validation
  feedback across all workflows.
- Remaining: Add tests for high-risk API routes, repository adapters, and
  permission checks.
- Remaining: Add basic accessibility checks for forms, navigation, and map
  controls.
- Remaining: Review mobile layouts.

### Exit Criteria

- Admins can manage users and organizations.
- Core workflows have test coverage.
- App handles empty, loading, and error states gracefully.

## Phase 9: Expanded OpenAI Workflows

Status: future scope.

### Goals

- Extend OpenAI support beyond SitRep drafting only after auth, role checks,
  audit logging, and data governance are in place.
- Keep generated output reviewable by coordinators before it changes official
  operational records.

### Candidate Use Cases

- Map analysis: summarize clusters, coverage gaps, access constraints, and
  high-priority locations from program map layers.
- Task prioritization: rank open tasks using urgency, affected population,
  deadlines, dependencies, and available teams.
- Operational chat: answer coordinator questions from program data with clear
  references to source records.
- Resource matching: suggest inventory, teams, or partner activities that can
  address verified needs.
- Program creation: draft program records from responder notes or intake text
  while requiring human review before saving.
- Report export: generate executive summaries or donor-ready variants from
  reviewed SitRep content.
- Document generation: draft concept notes, briefings, and partner updates from
  approved program data.

### Work Items

- Remaining: Define privacy rules and allowed data fields for each AI workflow.
- Remaining: Add prompt and output schemas per workflow.
- Remaining: Add per-user rate limits and request logging.
- Remaining: Add review, approval, and audit states before AI output updates
  official records.
- Remaining: Add tests that mock OpenAI for each AI route.

### Exit Criteria

- Each AI workflow has a documented purpose, prompt payload, review path, and
  rollback behavior.
- No AI-generated output becomes operational record data without human approval.
- Sensitive data is excluded unless explicitly approved by policy.

## Initial Data Model Checklist

- User
- Organization
- Program
- NeedReport
- Resource
- Task
- PartnerActivity
- SituationReport

## MVP Milestones

1. Mostly complete: Local app, schema, demo data, and layout are working.
2. Partially complete: Cookie auth and mutation role checks exist; production
   auth provider, page protection, and audit logs remain.
3. Partially complete: Program pages and route handlers exist; durable Prisma
   writes and validation need hardening.
4. Partially complete: Needs and task data is visible with route handlers;
   full workflow UI and persistence need hardening.
5. Partially complete: Resources and partner 3W are visible with route
   handlers; creation, validation, and durable writes need hardening.
6. Mostly complete: Dashboard and map provide a useful demo operating picture.
7. Partially complete: SitReps can be listed and exported as text; AI drafts can
   be generated; PDF export and approval workflow remain.
8. Started: Admin view and AI route tests exist; broader tests, permissions,
   accessibility, and mobile polish remain.

## Risks and Open Decisions

- Auth provider: decide whether to keep the current cookie pattern or replace it
  with NextAuth, Supabase Auth, or another production identity provider.
- Map provider: Leaflet is simpler for MVP, Mapbox may be better for polished production mapping.
- Geospatial depth: MVP can store coordinates directly, but advanced filtering should use PostGIS.
- Offline mode: useful for field responders, but should remain post-MVP unless explicitly prioritized.
- PDF generation: should be added after SitRep content and layout are stable.
- File uploads: attachments and photos should be scoped carefully to avoid delaying core workflows.
- AI output governance: generated operational text must remain draft-only until
  reviewed by an accountable coordinator.
- OpenAI data handling: review prompt payloads against privacy policy before
  production use.
- Expanded AI scope: map analysis, task prioritization, chat, resource matching,
  program creation, report export, and document generation should remain future
  scope until auth, audit logging, rate limits, and approval workflows are in
  place.

## Suggested First Build Slice

Start with a narrow but end-to-end slice:

1. Authenticated coordinator logs in.
2. Coordinator creates a program.
3. Responder submits a need for that program.
4. Coordinator verifies the need and assigns a task.
5. Dashboard shows the active program, urgent need, and open task.
6. Map shows the program and need locations.

This slice proves the core operating model before expanding into inventory, partner coordination, and reports.

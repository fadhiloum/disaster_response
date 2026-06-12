# Disaster Response Platform - Implementation Plan

## Objective

Build the MVP described in `Project.md`: a web app for coordinating disaster response incidents, needs, resources, tasks, partner activities, maps, and situation reports.

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

## Phase 1: Project Foundation

### Goals

- Create the app shell and shared layout.
- Establish data modeling, validation, and development conventions.
- Make the project easy to run locally.

### Work Items

- Scaffold Next.js with TypeScript and Tailwind CSS.
- Add Prisma and configure PostgreSQL connection.
- Define base models: User, Organization, Incident, NeedReport, Resource, Task, PartnerActivity, SituationReport.
- Add seed data for demo incidents, users, resources, tasks, and partner activities.
- Create shared UI primitives for forms, tables, badges, status labels, filters, and page headers.
- Add environment configuration documentation.

### Exit Criteria

- App runs locally.
- Database schema migrates successfully.
- Seed data populates a realistic demo environment.
- Core layout and navigation are in place.

## Phase 2: Authentication and Roles

### Goals

- Let users sign in.
- Restrict actions by role.
- Support the MVP personas from the product spec.

### Roles

- Admin: full access
- Coordinator: manage incidents, tasks, resources, and reports
- Responder: create updates, needs, and task status changes
- Partner: update own 3W activities
- Viewer: read-only dashboard access

### Work Items

- Implement authentication.
- Add current-user API endpoint.
- Add role checks for API mutations.
- Add route-level protection for private pages.
- Add UI affordances that hide or disable unavailable actions.

### Exit Criteria

- Users can log in and out.
- Unauthorized users cannot access protected data mutations.
- Each role sees only the actions available to it.

## Phase 3: Incident Management

### Goals

- Make incidents the central organizing object for response activity.

### Work Items

- Build `/incidents` list page with filtering by status, severity, and disaster type.
- Build `/incidents/new` create form.
- Build `/incidents/[id]` detail page with tabs:
  - Overview
  - Map
  - Needs
  - Tasks
  - Resources
  - Partners
  - Situation Reports
- Implement incident API endpoints:
  - `GET /api/incidents`
  - `POST /api/incidents`
  - `GET /api/incidents/:id`
  - `PATCH /api/incidents/:id`
  - `DELETE /api/incidents/:id`
- Add validation for required fields, status, severity, disaster type, and coordinates.

### Exit Criteria

- Coordinators can create and update incidents.
- Users can view incident details.
- Incident data is visible across dashboard and detail views.

## Phase 4: Needs and Task Coordination

### Goals

- Support field reporting and operational follow-through.

### Work Items

- Build need report form for responders.
- Build needs table with category, urgency, status, location, quantity, and affected people.
- Add need status workflow: reported, verified, assigned, fulfilled, closed.
- Build task creation and assignment flow.
- Add task board or task table with priority, assignee, due time, and status.
- Implement API endpoints:
  - `GET /api/incidents/:id/needs`
  - `POST /api/incidents/:id/needs`
  - `PATCH /api/needs/:id`
  - `GET /api/incidents/:id/tasks`
  - `POST /api/incidents/:id/tasks`
  - `PATCH /api/tasks/:id`

### Exit Criteria

- Responders can submit needs with locations.
- Coordinators can verify needs and assign tasks.
- Responders can update task status.

## Phase 5: Resources and Partner 3W

### Goals

- Track logistics and partner response coverage.

### Work Items

- Build `/resources` inventory page.
- Add resource creation and update forms.
- Track quantity available, quantity committed, warehouse, expiry date, and assigned incident.
- Add resource commitment action.
- Build partner activity tab using 3W format: who, what, where.
- Implement API endpoints:
  - `GET /api/resources`
  - `POST /api/resources`
  - `PATCH /api/resources/:id`
  - `POST /api/resources/:id/commit`
  - `GET /api/incidents/:id/activities`
  - `POST /api/incidents/:id/activities`
  - `PATCH /api/activities/:id`

### Exit Criteria

- Logistics officers can track stock and commitments.
- Coordinators can identify resource gaps.
- Partner activities are visible by incident and location.

## Phase 6: Dashboard and Map

### Goals

- Provide a common operating picture.

### Work Items

- Build `/dashboard` with:
  - Active incidents
  - Severity mix
  - Open urgent needs
  - Resource gaps
  - Open tasks
  - Latest situation updates
- Build `/map` full-screen operational map.
- Add map layers for incidents, needs, shelters or warehouses, teams, and partner activities.
- Add filters for incident, type, urgency, status, and organization.

### Exit Criteria

- Dashboard shows active response status at a glance.
- Map displays key operational entities with useful filters.
- Mobile layout remains usable for responders in the field.

## Phase 7: Situation Reports

### Goals

- Generate concise reports from incident data.
- Support user-reviewed AI drafting without automatically publishing generated text.

### Work Items

- Build `/sitreps` list page.
- Build situation report tab in incident detail.
- Add create/edit flow for SitRep sections:
  - Summary
  - Current impact
  - Priority needs
  - Response actions
  - Gaps
  - Next operational period priorities
- Add text export first.
- Add PDF export after report layout is stable.
- Add AI-assisted draft generation from incident, needs, task, resource, team,
  partner, and previous report context.
- Implement API endpoints:
  - `GET /api/incidents/:id/sitreps`
  - `POST /api/incidents/:id/sitreps`
  - `GET /api/sitreps/:id/export`
  - `POST /api/ai/incidents/:id/situation-report`

### Exit Criteria

- Coordinators can create SitReps for incidents.
- Coordinators can generate editable AI SitRep drafts.
- SitReps can be exported as text or PDF.
- Report content reflects current incident data.

## Phase 8: Admin and Hardening

### Goals

- Make the MVP safer, clearer, and ready for demo or pilot use.

### Work Items

- Build `/admin` for users, roles, and organizations.
- Add audit-friendly timestamps and created-by fields to key records.
- Add error states, empty states, loading states, and form validation feedback.
- Add tests for high-risk API routes and permission checks.
- Add basic accessibility checks for forms, navigation, and map controls.
- Review mobile layouts.

### Exit Criteria

- Admins can manage users and organizations.
- Core workflows have test coverage.
- App handles empty, loading, and error states gracefully.

## Initial Data Model Checklist

- User
- Organization
- Incident
- NeedReport
- Resource
- Task
- PartnerActivity
- SituationReport

## MVP Milestones

1. Local app, database, schema, seed data, and layout are working.
2. Authentication and role-based access are working.
3. Incident CRUD and incident detail tabs are working.
4. Needs and task workflows are working.
5. Resources and partner 3W workflows are working.
6. Dashboard and map provide a useful operating picture.
7. Situation reports can be generated and exported.
8. Admin tools, tests, and mobile polish are complete.

## Risks and Open Decisions

- Auth provider: decide between NextAuth and Supabase Auth before implementation.
- Map provider: Leaflet is simpler for MVP, Mapbox may be better for polished production mapping.
- Geospatial depth: MVP can store coordinates directly, but advanced filtering should use PostGIS.
- Offline mode: useful for field responders, but should remain post-MVP unless explicitly prioritized.
- PDF generation: should be added after SitRep content and layout are stable.
- File uploads: attachments and photos should be scoped carefully to avoid delaying core workflows.
- AI output governance: generated operational text must remain draft-only until
  reviewed by an accountable coordinator.
- OpenAI data handling: review prompt payloads against privacy policy before
  production use.

## Suggested First Build Slice

Start with a narrow but end-to-end slice:

1. Authenticated coordinator logs in.
2. Coordinator creates an incident.
3. Responder submits a need for that incident.
4. Coordinator verifies the need and assigns a task.
5. Dashboard shows the active incident, urgent need, and open task.
6. Map shows the incident and need locations.

This slice proves the core operating model before expanding into inventory, partner coordination, and reports.

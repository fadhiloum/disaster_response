# OpenAI Platform Integration

## Current Scope

The app includes server-side OpenAI integrations for AI-assisted situation
report and concept note drafting.

Implemented SitRep flow:

1. User opens a program detail page.
2. User clicks `Draft with AI` in the Situation Reports section.
3. The client calls `POST /api/ai/incidents/[id]/situation-report`.
4. The route loads program context through the shared data repository.
5. The route calls the OpenAI Responses API.
6. The response is returned as editable draft text.
7. After review, the coordinator can save the draft as a SitRep through
   `POST /api/incidents/[id]/sitreps`.

The generated text is not saved automatically. A coordinator must review and
save the draft before it becomes a SitRep record.

Implemented concept note flow:

1. User opens a program detail page.
2. User clicks `Draft with AI` in the Concept Note section.
3. The client calls `POST /api/ai/incidents/[id]/concept-note`.
4. The route loads program context, needs, tasks, deployment, partners, budget
   controls, and recent SitReps.
5. The response is returned as editable concept note text.
6. The coordinator can save the reviewed draft as a new version through
   `POST /api/incidents/[id]/concept-note`.
7. The coordinator can export the template-backed DOCX concept note through
   `GET /api/incidents/[id]/concept-note`.

Saved concept notes are versioned per program. The DOCX export uses the latest
saved concept note sections by default, can export a selected version with
`?conceptNoteId=...`, and falls back to current program data when no saved note
exists.

## Environment Variables

Add these values to `.env` for local development and to the hosting provider for
production.

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
OPENAI_REQUEST_TIMEOUT_MS=30000
```

Rules:

- `OPENAI_API_KEY` must stay server-side only.
- Do not prefix the key with `NEXT_PUBLIC_`.
- `OPENAI_MODEL` is optional. If it is not set, the app uses `gpt-5.5`.
- `OPENAI_REQUEST_TIMEOUT_MS` is optional. If it is not set, the app waits up to
  30 seconds for an AI draft.
- The app can still build without `OPENAI_API_KEY`; the endpoint returns a
  clear `503` if the key is missing at runtime.

## Files

- `app/lib/ai/openai.ts`
  - Exposes the configured model.
  - Checks whether an API key is present.
  - Creates the OpenAI client lazily so no-key builds still work.

- `app/api/ai/incidents/[id]/situation-report/route.ts`
  - Server-only route for SitRep drafting.
  - Loads program, needs, tasks, resources, teams, partner activities, budget
    controls, and previous reports.
  - Sends a constrained operational prompt to the Responses API.
  - Returns `{ data: { draft, incidentId, model } }`.

- `app/api/ai/incidents/[id]/concept-note/route.ts`
  - Server-only route for concept note drafting.
  - Loads program, needs, tasks, resources, teams, partner activities, budget
    controls, and previous reports.
  - Sends a constrained concept note prompt to the Responses API.
  - Returns `{ data: { draft, incidentId, model } }`.

- `app/incidents/[id]/ai-sitrep-draft.tsx`
  - Client component that calls the route.
  - Shows loading and error states.
  - Displays the generated draft in an editable textarea.
  - Saves reviewed drafts through the SitRep POST route.

- `app/incidents/[id]/ai-concept-note-draft.tsx`
  - Client component that calls the concept note route.
  - Shows loading and error states.
  - Displays the generated draft in an editable textarea.
  - Loads saved concept note versions.
  - Restores selected versions into the editor.
  - Saves reviewed drafts as new versions and links to selected-version DOCX
    export.

- `app/incidents/[id]/page.tsx`
  - Renders the AI drafting panels inside the Concept Note and Situation
    Reports sections.

## Endpoint

```http
POST /api/ai/incidents/:id/situation-report
```

```http
POST /api/ai/incidents/:id/concept-note
```

```http
POST /api/incidents/:id/concept-note
```

```http
GET /api/incidents/:id/concept-note
```

Success response:

```json
{
  "data": {
    "draft": "## Summary\n...",
    "incidentId": "flood-riverside",
    "model": "gpt-5.5"
  }
}
```

Error responses:

- `404` when the program does not exist.
- `503` when `OPENAI_API_KEY` is not configured.
- `504` when the OpenAI request times out.

## Local Checks

Generate a draft:

```bash
curl -s -X POST \
  http://localhost:3000/api/ai/incidents/flood-riverside/situation-report
```

Generate a concept note draft:

```bash
curl -s -X POST \
  http://localhost:3000/api/ai/incidents/flood-riverside/concept-note
```

Save a reviewed concept note draft:

```bash
curl -s -X POST \
  -H 'Content-Type: application/json' \
  -d '{"content":"## Background\nReviewed concept note draft"}' \
  http://localhost:3000/api/incidents/flood-riverside/concept-note
```

Export a specific saved concept note version:

```bash
curl -s -OJ \
  'http://localhost:3000/api/incidents/flood-riverside/concept-note?conceptNoteId=concept-note-id'
```

Verify unknown program handling:

```bash
curl -s -i -X POST \
  http://localhost:3000/api/ai/incidents/unknown/situation-report
```

Build and lint:

```bash
npm run test
npm run lint
npm run vercel-build
```

## Data Sent to OpenAI

The current prompt includes operational program context:

- Program title, type, severity, status, location, affected population, lead,
  description, and latest update.
- Needs reports for the program.
- Tasks for the program.
- Assigned resources and deployed teams.
- Partner 3W activities.
- Master budget and current fund requests.
- Up to two previous SitReps.

Before production use, review this payload against the organization privacy
policy. Avoid sending unnecessary personal data, exact household-level details,
or sensitive medical information unless explicitly approved.

## Operational Guardrails

Treat AI output as a draft.

Recommended production hardening:

- Add reviewed or approved status transitions for concept note versions.
- Add per-user or per-program rate limits.
- Add request logging for timestamp, user, program ID, and model, but avoid
  storing full prompts by default.
- Add an approval workflow before saving generated SitReps.
- Add prompt and output length limits.
- Add a model fallback or user-facing retry state for transient API failures.
- Add tests that mock the OpenAI client rather than calling the live API.

## Future Extensions

Useful next AI features:

- Draft concept-note sections from program data.
- Summarize the latest program changes.
- Recommend priority actions from open needs, tasks, and inventory.
- Match resource inventory to reported needs.
- Flag duplicate or conflicting needs reports.
- Translate finalized SitReps into supported operating languages.

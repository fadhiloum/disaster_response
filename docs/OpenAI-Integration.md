# OpenAI Platform Integration

## Current Scope

The app includes a server-side OpenAI integration for AI-assisted situation
report drafting.

Implemented flow:

1. User opens a program detail page.
2. User clicks `Generate SitRep` at the top of the page or `Generate with AI`
   in the Situation Reports section.
3. The client calls `POST /api/ai/incidents/[id]/situation-report`.
4. The route loads program context through the shared data repository.
5. The route requires the OpenAI Responses API web search tool to fetch recent
   external context from authorities, other NGOs, UN/IFRC-style sources, and
   reputable local reporting.
6. The response is returned as editable draft text with source links.
7. After review, the coordinator can save the draft as a SitRep through
   `POST /api/incidents/[id]/sitreps`.

The generated text is not saved automatically. A coordinator must review and
save the draft before it becomes a SitRep record.

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
  30 seconds for a SitRep draft.
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
  - Requires a web search call and asks the model to prioritize official local
    disaster management authorities, government agencies, NGOs, IFRC/Red
    Cross/Crescent, OCHA/ReliefWeb, UN agencies, and reputable local media.
  - Sends a constrained operational prompt to the Responses API.
  - Returns `{ data: { draft, incidentId, model, sources } }`.

- `app/incidents/[id]/ai-sitrep-draft.tsx`
  - Client component that calls the route.
  - Shows loading and error states.
  - Displays the generated draft in an editable textarea.
  - Displays web sources returned by the API as clickable links.
  - Saves reviewed drafts through the SitRep POST route.

- `app/incidents/[id]/page.tsx`
  - Renders the AI drafting panel inside the Situation Reports section.

## Endpoint

```http
POST /api/ai/incidents/:id/situation-report
```

Success response:

```json
{
  "data": {
    "draft": "## Summary\n...",
    "incidentId": "flood-riverside",
    "model": "gpt-5.5",
    "sources": [
      {
        "title": "Agency update",
        "url": "https://example.org/update"
      }
    ]
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
- Recent web context from authorities, other NGOs, UN/IFRC-style sources, and
  reputable local reporting. The UI must keep returned source links visible when
  web context is shown.
- Up to two previous SitReps.

Before production use, review this payload against the organization privacy
policy. Avoid sending unnecessary personal data, exact household-level details,
or sensitive medical information unless explicitly approved.

## Operational Guardrails

Treat AI output as a draft.

Recommended production hardening:

- Add authentication and role checks to the AI route.
- Add per-user or per-program rate limits.
- Add request logging for timestamp, user, program ID, and model, but avoid
  storing full prompts by default.
- Add an approval workflow before saving generated SitReps.
- Add prompt and output length limits.
- Add a model fallback or user-facing retry state for transient API failures.
- Review source allowlisting if production policy requires only approved
  authority or partner domains.
- Add tests that mock the OpenAI client rather than calling the live API.

## Future Extensions

Useful next AI features:

- Draft concept-note sections from program data.
- Summarize the latest program changes.
- Store reviewed web-source citations with finalized SitReps.
- Recommend priority actions from open needs, tasks, and inventory.
- Match resource inventory to reported needs.
- Flag duplicate or conflicting needs reports.
- Translate finalized SitReps into supported operating languages.

# AI SitRep Drafting

## Purpose

AI-assisted SitRep drafting helps coordinators turn current program data and
fresh external web context into a reviewable situation report draft. The feature
is intended to reduce first-draft time, not replace human review or approval.

The generated draft is not saved automatically. A coordinator should edit,
verify, and submit the final SitRep through the normal operational workflow.

## User Flow

1. Open a program detail page, for example `/incidents/flood-riverside`.
2. Go to the Situation Reports section.
3. Click `Generate with AI`.
4. Review the generated draft in the editable text area.
5. Edit the text as needed.
6. Click `Save as SitRep` to create an official SitRep record from the reviewed
   draft.

The client component for this workflow is
`app/incidents/[id]/ai-sitrep-draft.tsx`.

## Technical Flow

The browser calls this route:

```http
POST /api/ai/incidents/:id/situation-report
```

The route handler is
`app/api/ai/incidents/[id]/situation-report/route.ts`.

On each request, the route:

1. Verifies `OPENAI_API_KEY` is configured.
2. Loads the program through `app/lib/data`.
3. Loads related needs, tasks, resources, teams, activities, and recent SitReps.
4. Requires the OpenAI Responses API web search tool to retrieve recent external
   context.
5. Sends a constrained prompt to the OpenAI Responses API.
6. Returns the generated draft text and web sources to the client.
7. The client parses the reviewed draft into SitRep sections and posts it to
   `POST /api/incidents/:id/sitreps`.
8. The SitRep route validates required sections and persists the report through
   `app/lib/data`.

The OpenAI client helper is `app/lib/ai/openai.ts`. It reads
`OPENAI_API_KEY` and uses `OPENAI_MODEL`, defaulting to `gpt-5.5` when the model
is not set. `OPENAI_REQUEST_TIMEOUT_MS` controls the per-request timeout and
defaults to `30000`.

## Data Included in the Prompt

The prompt includes operational program context only:

- Program title, type, status, severity, location, lead, description, and latest
  update.
- Affected population, open needs, resource gaps, and assigned teams.
- Program needs, tasks, resources, deployed teams, partner activities, master
  budget, and fund requests.
- Recent web context from official local disaster management authorities,
  government agencies, other NGOs, IFRC/Red Cross/Crescent, OCHA/ReliefWeb, UN
  agencies, or reputable local media.
- Up to two previous SitReps for continuity.

Avoid adding unnecessary personal data, medical details, or sensitive household
information to program records before generating a draft.

When web context is used, the UI displays the source links returned by the
Responses API below the editable draft.

## Local Testing

Set the environment variables:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
OPENAI_REQUEST_TIMEOUT_MS=30000
```

Start the app:

```bash
npm run dev
```

Test from the browser:

```text
http://localhost:3000/incidents/flood-riverside
```

Test the route directly:

```bash
curl -s -X POST \
  http://localhost:3000/api/ai/incidents/flood-riverside/situation-report
```

Expected success response:

```json
{
  "data": {
    "draft": "## Summary\n...",
    "incidentId": "flood-riverside",
    "model": "gpt-5.5"
  }
}
```

Expected errors:

- `503` if `OPENAI_API_KEY` is missing.
- `404` if the program ID does not exist.
- `504` if the OpenAI request times out.

## Automated Tests

Run:

```bash
npm run test
```

The route tests are in `tests/ai-sitrep-route.test.ts`. They mock the OpenAI
client and verify missing-key, missing-program, and successful-draft behavior.
`tests/sitrep-route.test.ts` covers reviewed draft persistence through the
SitRep POST route.

## Production Notes

Configure `OPENAI_API_KEY` and `OPENAI_MODEL` in the hosting provider, not in
committed files. For Vercel, use project environment variables.

Before operational use, add authentication, role checks, rate limits, and an
approval step before any AI-generated report can become an official SitRep.

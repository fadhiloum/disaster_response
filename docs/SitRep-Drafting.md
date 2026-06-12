# AI SitRep Drafting

## Purpose

AI-assisted SitRep drafting helps coordinators turn current incident data into a
reviewable situation report draft. The feature is intended to reduce first-draft
time, not replace human review or approval.

The generated draft is not saved automatically. A coordinator should edit,
verify, and submit the final SitRep through the normal operational workflow.

## User Flow

1. Open an incident detail page, for example `/incidents/flood-riverside`.
2. Go to the Situation Reports section.
3. Click `Draft with AI`.
4. Review the generated draft in the editable text area.
5. Copy or adapt the reviewed text into the final SitRep process.

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
2. Loads the incident through `app/lib/data`.
3. Loads related needs, tasks, resources, teams, activities, and recent SitReps.
4. Sends a constrained prompt to the OpenAI Responses API.
5. Returns the generated draft text to the client.

The OpenAI client helper is `app/lib/ai/openai.ts`. It reads
`OPENAI_API_KEY` and uses `OPENAI_MODEL`, defaulting to `gpt-5.5` when the model
is not set.

## Data Included in the Prompt

The prompt includes operational incident context only:

- Incident title, type, status, severity, location, lead, description, and latest
  update.
- Affected population, open needs, resource gaps, and assigned teams.
- Incident needs, tasks, resources, deployed teams, and partner activities.
- Up to two previous SitReps for continuity.

Avoid adding unnecessary personal data, medical details, or sensitive household
information to incident records before generating a draft.

## Local Testing

Set the environment variables:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
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
- `404` if the incident ID does not exist.

## Automated Tests

Run:

```bash
npm run test
```

The route tests are in `tests/ai-sitrep-route.test.ts`. They mock the OpenAI
client and verify missing-key, missing-incident, and successful-draft behavior.

## Production Notes

Configure `OPENAI_API_KEY` and `OPENAI_MODEL` in the hosting provider, not in
committed files. For Vercel, use project environment variables.

Before operational use, add authentication, role checks, rate limits, and an
approval step before any AI-generated report can become an official SitRep.

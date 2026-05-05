---
sidebar_position: 3
---

# API Reference

Every endpoint with a copy-pasteable `curl`. All routes are mounted
under `/api/v1`. Demo base URL:

```
BASE=https://partner-api-demo.g2sentry.com/api/v1
```

Swap the host to `partner-api.g2sentry.com` for production.

Interactive Swagger: [https://partner-api-demo.g2sentry.com/swagger-ui.html](https://partner-api-demo.g2sentry.com/swagger-ui.html).

## Authentication

All endpoints except `/access/login` and `/access/refresh` require a
bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOi…
```

### `POST /access/login`

Exchange partner credentials for a token pair.

```bash
curl -s -X POST $BASE/access/login \
  -H 'Content-Type: application/json' \
  -d '{
    "partnerKey": "acme-corp",
    "partnerSecret": "…"
  }'
```

```json
{
  "partnerKey": "acme-corp",
  "name": "Acme Corp, Inc.",
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "eyJhbGciOi…"
}
```

- Access token lifetime: **15 min**.
- Refresh token lifetime: **7 days**.
- `name` is the partner's display name as registered with G2 Sentry.

### `GET /access/refresh`

Get a fresh access token without resubmitting the partner secret.
Pass the refresh token in the `refreshToken` request header (not a
body, not a cookie).

```bash
curl -s "$BASE/access/refresh" \
  -H "refreshToken: $REFRESH_TOKEN"
```

```json
{
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "eyJhbGciOi…"
}
```

## Jobs

### `POST /jobs` — Create a job

Required: `name`, `location`, `whenDate`, `duration`. Either
`location.address` or `location.gps` (or both) must be set.

```bash
curl -s -X POST $BASE/jobs \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Open house at 123 Main St",
    "description": "Quiet block, single entrance, 3-hour shift.",
    "whenDate": "2026-05-01T17:00:00Z",
    "duration": 180,
    "location": {
      "address": {
        "address1": "123 Main St",
        "address2": "Apt 4B",
        "city": "New York",
        "state": "NY",
        "zip": "10001"
      },
      "gps": {
        "latitude": 40.717495,
        "longitude": -74.169667
      }
    },
    "client": {
      "clientId": "customer-42",
      "clientInfo": "Bob Smith — VIP client",
      "clientPhone": "1234567890"
    }
  }'
```

Response (`201`):

```json
{ "jobId": 9142 }
```

Key fields:

| Field | Notes |
|---|---|
| `name` | Shown to the Guardian. Up to 255 chars. |
| `whenDate` | ISO-8601 UTC. Must be at least the cut-off window in the future (see [Workflow](./workflow.md)). |
| `duration` | Minutes. |
| `location.address.state` | 2-letter uppercase code (e.g. `NY`). |
| `location.address.zip` | 5 or 9 digits. |
| `client.clientId` | Your own identifier for the end user. Echoed back on subsequent calls. Opaque to G2 Sentry. |
| `client.clientPhone` | Used for Sinch-masked contact during the shift. The Guardian never sees the real number. |

The response is intentionally minimal — call `GET /jobs/{jobId}` to
retrieve the full record.

### `GET /jobs/{jobId}` — Job detail

Returns the full job record plus the assigned Guardian (if any) and
real-time status.

```bash
curl -s "$BASE/jobs/9142" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Response:

```json
{
  "jobId": 9142,
  "status": "InProgress",
  "guardian": {
    "guardianId": 4771,
    "firstName": "Alex",
    "lastName": "K.",
    "avatarThumbnailUrl": "https://…",
    "phone": "+15551234567"
  },
  "job": {
    "name": "Open house at 123 Main St",
    "description": "Quiet block, single entrance, 3-hour shift.",
    "whenDate": "2026-05-01T17:00:00Z",
    "duration": 180,
    "location": {
      "address": {
        "address1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001"
      },
      "gps": {
        "latitude": 40.717495,
        "longitude": -74.169667
      }
    },
    "client": {
      "clientId": "customer-42",
      "clientInfo": "Bob Smith — VIP client",
      "clientPhone": "1234567890"
    }
  }
}
```

`guardian.phone` is the Sinch-masked number — call it to reach the
Guardian without exposing their personal line. It stops working
shortly after the job moves to `Completed`.

### `PATCH /jobs/{jobId}` — Update before the cut-off

Send any subset of mutable fields. Requests after the cut-off return
`422 Unprocessable Entity`.

```bash
curl -s -X PATCH $BASE/jobs/9142 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "duration": 240,
    "description": "Updated brief — extended by an hour.",
    "clientPhone": "+15551239999"
  }'
```

Patchable fields: `name`, `location`, `whenDate`, `duration`,
`description`, `clientId`, `clientInfo`, `clientPhone`. Note that
client fields are flat on `JobUpdate`, unlike the nested `client.*` on
`POST /jobs`.

Response: a generic message envelope.

```json
{ "code": "SUCCESS", "message": "Job updated" }
```

### `GET /jobs/{jobId}/cancel` — Cancel before the cut-off

```bash
curl -s "$BASE/jobs/9142/cancel" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

- `200` — job moves to `Canceled`. If a Guardian was already
  assigned, the cancellation may incur a fee per your contract.
- `422` — past the cut-off. Email ops to cancel.

```json
{ "code": "SUCCESS", "message": "Job canceled" }
```

### `GET /jobs/{jobId}/status` — Current status

Lightweight, use for polling fallback if you miss a callback.

```bash
curl -s "$BASE/jobs/9142/status" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{ "jobId": 9142, "status": "Completed" }
```

`status` is one of: `New`, `Assigned`, `InProgress`, `Completed`,
`Canceled`.

### `POST /jobs/{jobId}/review` — Submit partner review

Only valid once the job is `Completed`. `rate` is required and must
be 1–5; `review` is optional.

```bash
curl -s -X POST $BASE/jobs/9142/review \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "rate": 5,
    "review": "Showed up early, very professional."
  }'
```

```json
{ "code": "SUCCESS", "message": "Review submitted" }
```

### `GET /jobs/{jobId}/guardians/{guardianId}` — Guardian profile

Returns the profile of the Guardian assigned to this job. Only
available once the job is at least `Assigned`.

```bash
curl -s "$BASE/jobs/9142/guardians/4771" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "guardianId": 4771,
  "firstName": "Alex",
  "lastName": "K.",
  "bio": "Five years in event security. Bilingual EN/ES.",
  "avatarUrl": "https://…"
}
```

`avatarUrl` is a short-lived signed S3 URL — refresh it by calling
this endpoint again rather than caching the link long-term.

## Errors

All error responses use the same envelope:

```json
{
  "code": "CUT_OFF_EXCEEDED",
  "message": "Cancellation window closed — contact G2 Sentry ops."
}
```

`400` validation failures additionally include a `errors[]` array
with per-field messages:

```json
{
  "message": "Validation failed",
  "errors": [
    { "fieldName": "whenDate", "message": "must be in the future" },
    { "fieldName": "location", "message": "address or gps required" }
  ]
}
```

| Status | Meaning |
|---|---|
| `400` | Request shape is invalid (missing required field, bad ISO date, etc.) |
| `401` | Token missing, invalid, or expired. Refresh and retry. |
| `403` | Token is for a different partner than the job. |
| `404` | Unknown job, or job belongs to another partner (same response by design — we don't confirm existence across partners). |
| `422` | Business rule rejected the request (e.g. past cut-off, job already completed). |
| `429` | Rate limit hit. See [Tech Overview](../get-started/g2-sentry-tech-overview.md#whats-guaranteed-and-whats-not). |
| `5xx` | Our side. Retry with backoff; open a ticket if it persists. |

## Rate limits

**60 requests per minute** per partner key by default. If that's tight
for your use case, email us and we'll raise it.

## Next

- [Workflow](./workflow.md) for the states jobs move through.
- [Callbacks](./callbacks.md) for webhook payloads and signature
  verification.

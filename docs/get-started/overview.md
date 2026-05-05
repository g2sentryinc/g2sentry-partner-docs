---
sidebar_position: 1
---

# Get Started

This is the fastest path from "I need a guardian booked through my
platform" to "I just created my first job." About ten minutes if you
already have `curl` and an email account ready.

## 1. Request partner access

Email [mikeg@g2sentry.com](mailto:mikeg@g2sentry.com) with:

- your company name and a short description of the product you're
  integrating with G2 Sentry,
- a contact email for operational alerts,
- the public URL your backend will expose for callbacks (you can
  provide a placeholder for now — you'll set the real one in the
  portal later).

You'll get back:

| What | Example |
|---|---|
| **Partner key** | `acme-corp` |
| **Partner secret** (green) | `d41d8cd98f00b204e9800998ecf8427e...` |
| **Callback secret** (for HMAC) | `7b9c…f0e2` (set in the portal after first login) |
| **Portal login** | `https://portal-demo.g2sentry.com` |

The partner key and partner secret authenticate you to the API. The
callback secret is what G2 Sentry uses to sign webhooks it sends to
your server.

## 2. Pick an environment

| Env | Base URL | When to use |
|---|---|---|
| **Demo** | `https://partner-api-demo.g2sentry.com/api/v1` | Every test. Jobs here do not dispatch real guardians. |
| **Production** | `https://partner-api.g2sentry.com/api/v1` | Real jobs, real guardians, real billing. Cut over only after a successful demo round-trip. |

All endpoints are under `/api/v1`. Every example in these docs assumes
demo.

## 3. Log in

Exchange your partner key and secret for a short-lived access token:

```bash
curl -s -X POST https://partner-api-demo.g2sentry.com/api/v1/access/login \
  -H 'Content-Type: application/json' \
  -d '{
    "partnerKey": "acme-corp",
    "partnerSecret": "…"
  }'
```

Response:

```json
{
  "partnerKey": "acme-corp",
  "name": "Acme Corp, Inc.",
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "eyJhbGciOi…"
}
```

Access tokens live for **15 minutes**. Refresh tokens live for **7 days**.
When the access token expires, send the refresh token in the
`refreshToken` header to `GET /access/refresh` for a new pair — no
need to re-submit the partner secret.

## 4. Create your first job

```bash
curl -s -X POST https://partner-api-demo.g2sentry.com/api/v1/jobs \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Open house at 123 Main St",
    "whenDate": "2026-05-01T17:00:00Z",
    "duration": 120,
    "location": {
      "address": {
        "address1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip": "10001"
      }
    },
    "client": {
      "clientId": "customer-42",
      "clientPhone": "+15551234567"
    }
  }'
```

You'll get back `{ "jobId": … }` — that's your handle for every
subsequent call. Fetch the full record (status, address, assigned
Guardian) with `GET /jobs/{jobId}`.

## 5. Wire up callbacks

Once a guardian is assigned to the job, G2 Sentry POSTs your callback
URL with a small JSON payload signed with your callback secret. Your
server should:

1. Verify the `X-Signature` header against the raw request body.
2. Update the job's state in your own database.
3. Return a 2xx response as soon as possible — we retry non-2xx with
   exponential backoff.

The full walk-through (plus working Node and Python signature
verifiers) lives in [Callbacks](../partner-api/callbacks.md).

## 6. Run the sample app

The fastest way to see the full round-trip is to fork the
[CodeSandbox test app](../cookbook/codesandbox-test-app.md): it logs
in, creates a job, receives callbacks, verifies them, and prints the
state transitions live in your browser.

## What's next

- Learn what states a job moves through →
  [Workflow](../partner-api/workflow.md)
- Read the full endpoint reference →
  [API](../partner-api/API.md)
- Explore the portal →
  [Portal](../portal/overview.md)

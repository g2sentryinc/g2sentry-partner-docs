---
sidebar_position: 4
---

# Callbacks

When a job changes state, G2 Sentry POSTs a small signed JSON payload
to the callback URL configured on your partner profile. This is how
your backend stays in sync with what the Guardian is actually doing
in the field — drive your UI off these events rather than polling.

## Delivery guarantees

- **At least once.** Your handler must be idempotent. We key retries
  on `(jobId, eventType)` so a duplicate is always the same payload.
- **Retry on non-2xx.** 1s, 5s, 30s, 2m, 10m, 1h. After that we give
  up and log the failure internally.
- **Not strictly ordered.** `JobStarted` can arrive before `JobAssigned`
  under retry conditions. Treat the `jobStatus` field in the payload
  as authoritative, not the arrival sequence.
- **HTTPS only.** Plain-HTTP callback URLs are rejected at profile
  save time.

## What events fire

| `eventType` | Sent when | Resulting `jobStatus` |
|---|---|---|
| `JobAssigned` | A Guardian accepts the offer. | `Assigned` |
| `JobStarted` | The Guardian arrives and starts the shift. | `InProgress` |
| `JobCompleted` | The Guardian closes the shift. | `Completed` |
| `JobWithdrawed` | The Guardian withdraws before cut-off. Job is un-assigned and available again. | `New` |

Internal events (`NewJob`, `JobGuardianRate`, `JobClientRate`) are not
pushed. Poll `/jobs/{id}/status` if you need them.

## Payload shape

All callbacks are `POST application/json` with this envelope:

```json
{
  "jobId": 9142,
  "eventType": "JobAssigned",
  "jobName": "Open house at 123 Main St",
  "jobStatus": "Assigned",
  "guardianPhone": "+12345678901"
}
```

| Field | Type | Present for |
|---|---|---|
| `jobId` | integer | Every event |
| `eventType` | string | Every event — one of the four above |
| `jobName` | string | Every event |
| `jobStatus` | string | Every event — the state the job is in *after* this event |
| `guardianPhone` | string (optional) | `JobAssigned`, `JobStarted` — Sinch-masked number; valid for the shift |

The masked `guardianPhone` is a real, callable number that routes to
the Guardian but hides their personal number. It stops working shortly
after `JobCompleted`.

## Signature verification

Every request carries an HMAC-SHA256 signature in the `X-Signature`
header, computed over the **raw request body** using your callback
secret as the key and hex-encoded:

```
X-Signature: 3c0a1f…
```

Verify **before parsing JSON** — once you parse, the byte-exact body
is gone, and naively re-serialising won't match because whitespace and
key order aren't stable.

### Node.js (Express)

```js
import express from 'express';
import crypto from 'node:crypto';

const app = express();

// Capture the raw body for signature verification before parsing.
app.use('/callbacks/g2sentry', express.raw({ type: 'application/json' }));

const SECRET = process.env.G2SENTRY_CALLBACK_SECRET;

app.post('/callbacks/g2sentry', (req, res) => {
  const provided = req.header('X-Signature') || '';
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(req.body)           // raw Buffer — do not JSON.stringify
    .digest('hex');

  const ok =
    provided.length === expected.length &&
    crypto.timingSafeEqual(
      Buffer.from(provided, 'hex'),
      Buffer.from(expected, 'hex'),
    );

  if (!ok) return res.status(401).send('invalid signature');

  const event = JSON.parse(req.body.toString('utf8'));
  handleEvent(event);           // your business logic — keep it fast
  res.status(204).end();        // ack quickly, do heavy work async
});
```

### Python (FastAPI)

```python
import hmac
import hashlib
import os
from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI()
SECRET = os.environ["G2SENTRY_CALLBACK_SECRET"].encode()

@app.post("/callbacks/g2sentry")
async def g2sentry_callback(
    request: Request,
    x_signature: str = Header(...),
):
    raw = await request.body()          # bytes, not the parsed model
    expected = hmac.new(SECRET, raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_signature):
        raise HTTPException(401, "invalid signature")

    event = await request.json()
    handle_event(event)                 # your business logic
    return {"ok": True}
```

### What trips people up

- **Re-serialising before hashing.** `JSON.stringify(req.body)` produces
  a byte-different body from what we sent. Always hash the raw bytes.
- **Body-parser mutations.** Frameworks like Express add implicit JSON
  parsing that consumes the raw stream. Mount the raw-body handler
  *before* any JSON middleware on the callback route.
- **Trimming whitespace.** Don't. The signature is over the bytes we
  sent, not a cleaned-up version.
- **Wrong secret.** The callback secret is separate from the partner
  secret. You set and rotate it in the [portal](../portal/overview.md).

## Local development

Callback URLs must be reachable from the public internet. During
development, expose your local server with an HTTP tunnel:

```bash
# ngrok
ngrok http 3000
# cloudflared
cloudflared tunnel --url http://localhost:3000
```

Paste the https URL into your partner profile callback field in the
portal, then create a demo job to see signed events arrive.

## Runnable sample

The [CodeSandbox test app](../cookbook/codesandbox-test-app.md) is a
small Express server that creates a job against the demo environment,
receives its callbacks, verifies the signatures, and prints the state
transitions live in the browser. Clone it, paste your credentials,
and you have a working reference implementation in under five
minutes.

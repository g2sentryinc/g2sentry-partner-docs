---
sidebar_position: 1
---

# G2 Sentry Partner Docs

These docs cover everything you need to integrate a product with
G2 Sentry's on-demand physical security service: how our API works,
how callbacks are signed and delivered, what the portal can do for
you, and a working sample project you can fork.

## Start here

- **Never integrated before?** Head to [Get Started](./get-started/overview.md).
  Two pages, ten minutes, ends with your first successful job creation
  against the demo environment.
- **Already have credentials?** Jump straight to [Partner API ›
  Overview](./partner-api/overview.md) or the [API reference](./partner-api/API.md).
- **Looking for signed webhooks?** See [Callbacks](./partner-api/callbacks.md)
  — includes a working HMAC verification snippet in Node and Python.
- **Want to kick the tyres fast?** Clone the
  [CodeSandbox test app](./cookbook/codesandbox-test-app.md) — a small
  Express receiver that creates a job, verifies callbacks, and renders
  status updates in the browser.

## How the documentation is organised

| Section | Who it's for |
|---|---|
| **Get Started** | First-time integrators — contact, credentials, environments, first call. |
| **Partner API** | Developers wiring up job creation, status polling, and callbacks. |
| **Portal** | Ops teams managing billing, secrets, and the partner profile. |
| **Cookbook** | Sample projects and runnable recipes. |

## Conventions used in these docs

- **`demo.`** prefixes a sandbox URL you can safely hit with test
  credentials. Use it for every example in these docs.
- **`prod.`** prefixes the production URL. Only swap to production once
  your integration has passed a real job end-to-end against demo.
- Fenced `curl` blocks are copy-pasteable — just replace the placeholder
  values (`$PARTNER_KEY`, `$PARTNER_SECRET`, `$ACCESS_TOKEN`).
- JSON examples show the full wire payload. Field order and whitespace
  in your real traffic may differ.

## Need help?

Email [mikeg@g2sentry.com](mailto:mikeg@g2sentry.com). We read every
message and usually reply the same day.

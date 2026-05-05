---
sidebar_position: 1
---

# The G2 Sentry Portal

The portal is the web UI where you handle the things that shouldn't
live in your integration code: rotating API credentials, checking
billing, investigating a specific job, configuring your callback URL.

Partners and internal G2 Sentry ops share the portal; this page
covers the partner-facing surface only.

## Sign in

- **Demo**: [https://portal-demo.g2sentry.com](https://portal-demo.g2sentry.com)
- **Production**: [https://portal.g2sentry.com](https://portal.g2sentry.com)

Sign in with the email tied to your partner account. If you haven't
received credentials yet, see [Get Started](../get-started/overview.md).

## What partners can do

### Credentials
- View the current partner key.
- Rotate the **green** partner secret (what you sign API calls with).
  Old value keeps working for a short grace window so you can roll
  it out without downtime.
- Rotate the **callback** secret (what we sign webhooks with).
- Edit the callback URL — what HTTPS endpoint we POST job events to.

### Team
- List and invite other users from your partner organisation.
- Disable a teammate who's left.
- Trigger a password-reset request for a teammate.

### Jobs
- Browse all jobs your partner has created.
- Filter by status, partner client, or date range.
- Open a job to see its full timeline — every state transition and the
  timestamp it happened.
- Cancel a stuck job directly from the UI (subject to the same 2-hour
  cut-off as the API).

### Dashboard
- Active-job count and today's completed / failed.
- 7-day trend chart of job volume and completion rate.
- Status breakdown donut (New / Assigned / In Progress / Completed /
  Canceled).
- Per-client leaderboard by job volume.

### Billing
- Current billing period totals and the charge that will land at
  period close.
- Completed-vs-failed breakdown for the period.

## When to use the portal vs the API

| Task | Portal | API |
|---|---|---|
| Book, cancel, rate a specific job | ✓ | ✓ |
| Mass-create jobs from your own system | — | ✓ |
| Rotate secrets | ✓ | — |
| Edit callback URL | ✓ | — |
| Invite a teammate | ✓ | — |
| Review billing for the period | ✓ | — |

API-first for anything your end users need to drive; portal for
everything else.

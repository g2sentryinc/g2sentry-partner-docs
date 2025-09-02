---
sidebar_position: 4
---

# Partner API Callbacks

## Overview

Callbacks are a fundamental part of the `G2 Sentry Partner API`, designed to keep your platform up-to-date with real-time job status changes. When significant events occur for jobs requested via the API, G2 Sentry sends HTTP POST requests to your configured callback URL. This enables your system to react immediately to changes, such as updating your UI, notifying users, or triggering automated workflows.

Callbacks are sent for the following job events:
- **JobAssigned**: A guardian has been assigned to the job.
- **JobStarted**: The guardian has started the job.
- **JobCompleted**: The job has been completed.
- **JobWithdrawed**: The job has been withdrawn or canceled.

## Securing Callbacks with HMAC

To ensure the authenticity and integrity of callback requests, each callback includes an HMAC signature in the request headers. This signature is calculated using your callback secret and the raw JSON payload. Your system should verify this signature before processing the callback.

**Example header:**
```
X-Signature: <signature>
```

**How to verify:**
1. Use your callback secret as the HMAC key.
2. Calculate the HMAC SHA256 hash of the raw request body.
3. Compare your calculated signature with the value in the `X-Signature` header.

## Callback Payload Format

All callback payloads are sent as JSON objects. Below are the possible fields and examples for each event type.

### Common Fields

- `jobId` (integer): Unique identifier of the job.
- `eventType` (string): Type of event (`JobAssigned`, `JobStarted`, `JobCompleted`, `JobWithdrawed`).
- `jobName` (string): Name or description of the job.
- `jobStatus` (string): Current status of the job.

### Additional Fields

- `guardianPhone` (string, optional): Masked phone number for contacting the assigned guardian (included for jobs in progress).

### Example Payloads

**Job Assigned**
```json
{
  "jobId": 5,
  "eventType": "JobAssigned",
  "jobName": "Open House at 123 Main St",
  "jobStatus": "Assigned"
}
```

**Job Assigned (with guardian phone)**
```json
{
  "jobId": 5,
  "eventType": "JobAssigned",
  "jobName": "Open House at 123 Main St",
  "jobStatus": "Assigned",
  "guardianPhone": "+12345678901"
}
```

**Job Started**
```json
{
  "jobId": 5,
  "eventType": "JobStarted",
  "jobName": "Open House at 123 Main St",
  "jobStatus": "InProgress",
  "guardianPhone": "+12345678901"
}
```

**Job Completed**
```json
{
  "jobId": 5,
  "eventType": "JobCompleted",
  "jobName": "Open House at 123 Main St",
  "jobStatus": "Completed"
}
```

**Job Withdrawed**
```json
{
  "jobId": 5,
  "eventType": "JobWithdrawed",
  "jobName": "Open House at 123 Main St",
  "jobStatus": "New"
}
```

## Supported Event Types

While the API defines several event types, only the following are sent as callbacks:

- `JobAssigned`
- `JobStarted`
- `JobCompleted`
- `JobWithdrawed`

Other event types such as `NewJob`, `JobGuardianRate`, and `JobClientRate` are not currently sent via callbacks.

## Sample Implementation

For a practical example of how to implement and verify callbacks using Node.js, see the sample project:

[https://github.com/g2sentryinc/g2sentry-partner-sample](https://github.com/g2sentryinc/g2sentry-partner-sample)

This project demonstrates receiving callbacks, verifying HMAC signatures, and processing job events.

---
For more details on configuring your callback URL and secret, refer to the
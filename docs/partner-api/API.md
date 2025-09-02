---
sidebar_position: 3
---

# Partner Open API Overview

The G2 Sentry Partner API enables seamless integration with G2 Sentry’s guardian service, allowing partners to automate job requests, manage jobs, track statuses, and interact with guardians. The API is built using the OpenAPI 3.1.0 standard, ensuring compatibility and ease of use with modern development tools.

## Key Features

- **Authentication:** Secure access using JWT tokens. Partners authenticate with their key and secret to obtain access and refresh tokens.
- **Job Management:** Create, update, cancel, and review jobs for your clients. Retrieve job details and real-time status.
- **Guardian Operations:** Access guardian profiles assigned to jobs.
- **Callbacks:** Receive real-time job status updates via callbacks to your platform.  
  *See [Callbacks](./Callbacks.md) for details.*
- **RESTful Design:** All endpoints follow REST principles for predictable integration.

## Resources

- **Swagger UI (Demo Environment):**  
  [https://partner-api-demo.g2sentry.com/swagger-ui.html](https://partner-api-demo.g2sentry.com/swagger-ui.html)

- **Postman Collection:**  
  [Download the Postman Collection](./G2SentryPartnerAPI.postman_collection.json)

## API Operations

| Operation                       | Method & Path                       | Description                                                                 |
|----------------------------------|-------------------------------------|-----------------------------------------------------------------------------|
| **Login**                       | `POST /access/login`                | Authenticate with partner key and secret to receive access and refresh tokens. |
| **Refresh Token**                | `GET /access/refresh`               | Obtain a new access token using a refresh token.                            |
| **Create Job**                   | `POST /jobs`                        | Request a new guardian job for a client.                                    |
| **Get Job Details**              | `GET /jobs/{jobId}`                 | Retrieve job details and real-time status.                                  |
| **Update Job**                   | `PATCH /jobs/{jobId}`               | Update job before the cut off date/time.                                                         |
| **Cancel Job**                   | `GET /jobs/{jobId}/cancel`          | Cancel a job if not yet accepted.                                           |
| **Review Job**                   | `POST /jobs/{jobId}/review`         | Submit a rating and review for a completed job.                             |
| **Get Job Status**               | `GET /jobs/{jobId}/status`          | Get real-time job status.                             |
| **Get Guardian Profile**         | `GET /jobs/{jobId}/guardians/{guardianId}` | Retrieve the profile of the guardian assigned to a job.                     |

> For more details on callbacks and receiving job status updates, see [Callbacks](./callbacks.md).

## Getting Started

1. Review the [OpenAPI specification](../partner-api/g2sentry-partner-api.yaml) for detailed endpoint documentation.
2. Use the Postman collection to explore and test API requests.
3. Visit the Swagger UI for interactive API documentation and live testing.
4. Implement authentication and begin integrating job management and callback features into your platform.

For further details, see the full API documentation and example

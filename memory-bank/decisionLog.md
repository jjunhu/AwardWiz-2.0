# Decision Log

This file records architectural and implementation decisions using a list format.
2025-04-05 18:46:00 - Log of updates made.

*

## Decision

*   **[2025-04-05 18:46:00] - Use AWS EventBridge + Lambda for Scheduled Scraping:** Decided to use AWS EventBridge rules to trigger Lambda functions for routinely running the AA and United scrapers.

## Rationale

*   Aligns with the project's stated goal of moving towards a serverless AWS architecture (documented in `activeContext.md` and `systemPatterns.md`). Provides a scalable, managed, pay-per-use solution. Preferred over Fargate due to being the standard serverless event-driven approach, despite potential browser packaging challenges. Preferred over GitHub Actions (not production-grade) and EC2+Cron (not serverless, higher fixed cost).

## Implementation Details

*   Create EventBridge scheduled rules (cron or rate-based).
*   Develop Lambda function(s) responsible for invoking the scrapers (either via API call or by packaging scraper code).
*   Address potential challenges with packaging browser dependencies in Lambda (consider container images).
*   Monitor Lambda cold starts and execution time limits.
*   Set up necessary IAM roles and permissions.
*   Consider AWS Fargate as a fallback if Lambda proves too complex for browser automation.
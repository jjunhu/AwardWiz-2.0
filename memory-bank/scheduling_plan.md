# AWS EventBridge + Lambda Scheduling Implementation Plan

**Date:** 2025-04-05

**Goal:** Implement routine scheduling for the American Airlines (AA) and United scrapers using AWS EventBridge and Lambda, as decided in `decisionLog.md`.

## Implementation Steps

1.  **Define EventBridge Schedules:**
    *   Determine the desired frequency for running the AA and United scrapers (e.g., hourly, daily at specific times).
    *   Create two separate EventBridge scheduled rules (using cron or rate expressions) to trigger the Lambda function(s) at the defined frequencies, potentially passing scraper-specific parameters (like the scraper name) in the event payload.

2.  **Develop Lambda Function(s):**
    *   **Option A (API Call):** Create a Lambda function (Node.js/TypeScript) that receives the event payload (including scraper name, origin, destination, date - potentially dynamic). This Lambda will securely call the existing `awardwiz-scrapers` backend API endpoint (`/run/:scraperName...`) to trigger the scrape.
        *   Requires handling authentication (JWT) for the API call from Lambda.
        *   Requires the backend API to be accessible from the Lambda environment.
    *   **Option B (Direct Execution):** Create a Lambda function that packages the necessary scraper code (`aa.ts`, `united.ts`) and the Arkalis engine dependencies. The Lambda directly executes the scraper logic upon receiving the trigger event.
        *   **Challenge:** Packaging Arkalis and its headless browser dependencies (Chrome) within Lambda limits.
        *   **Solution:** Investigate using Lambda Container Images to package Chrome and all necessary libraries. This is noted as a consideration in `techContext.md`.

3.  **IAM Roles and Permissions:**
    *   Create an IAM execution role for the Lambda function(s).
    *   Grant necessary permissions:
        *   CloudWatch Logs access (for logging).
        *   Permissions to call the backend API (if using Option A) or access necessary resources (if using Option B).
        *   Permissions for EventBridge to invoke the Lambda function.

4.  **Deployment:**
    *   Choose an Infrastructure as Code (IaC) tool (e.g., AWS CloudFormation, Terraform, AWS CDK) as suggested in `activeContext.md`.
    *   Write IaC templates/scripts to define and deploy:
        *   The Lambda function(s) (including code/container image).
        *   The IAM role and policies.
        *   The EventBridge scheduled rules.

5.  **Configuration:**
    *   Manage environment variables for the Lambda function securely (e.g., using AWS Systems Manager Parameter Store or Secrets Manager for API keys, JWT secrets, etc.).

6.  **Monitoring and Logging:**
    *   Ensure Lambda logs are captured in CloudWatch Logs.
    *   Set up basic monitoring/alarms for Lambda errors or timeouts.

7.  **Testing:**
    *   Test invoking the Lambda function manually.
    *   Verify EventBridge rules trigger the Lambda correctly.
    *   Monitor scraper execution logs for success/failure.

## Considerations & Fallbacks

*   **Lambda Cold Starts:** Monitor impact on execution time, especially if scrapers are time-sensitive. Consider provisioned concurrency if necessary.
*   **Lambda Timeouts:** Ensure scraper execution fits within the 15-minute Lambda limit. If not, the Fargate approach might be necessary.
*   **Browser Dependencies:** The primary challenge is packaging/running the headless browser. If Lambda Container Images prove too complex or unreliable, reconsider the **AWS EventBridge + Fargate** approach as the fallback (documented in `decisionLog.md`).
*   **Error Handling:** Implement robust error handling within the Lambda function to catch scraper failures, timeouts, or API issues. Potentially integrate with SNS for failure notifications.
*   **Cost:** Monitor AWS costs associated with Lambda execution, EventBridge rules, and data transfer.

## Next Steps

*   Proceed to implementation, likely starting with the IaC setup and Lambda function development.
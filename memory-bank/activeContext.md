# AwardWiz Active Context

## Current Focus

The current focus for AwardWiz development is to enhance the scrapers functionality and implement AWS infrastructure integration for scheduled scraping and notifications. This involves several key areas of work:

### 1. Scraper Functionality

#### Airline Scrapers
- **Current State**: 
  - Working scrapers: American Airlines (aa), Aeroplan, Alaska, JetBlue, Southwest
  - Temporarily broken scrapers: Delta, United
  - Each scraper is implemented as a standalone module in the `awardwiz-scrapers/scrapers/` directory

- **Priority Tasks**:
  - Fix the United and Delta scrapers
  - Improve reliability of existing scrapers
  - Add error handling for anti-botting measures
  - Standardize response formats across all scrapers

#### Hotel Scrapers
- **Current State**:
  - No hotel scrapers currently implemented
  - The system is designed for airline award tickets only

- **Priority Tasks**:
  - Design and implement hotel scrapers with a similar interface to airline scrapers
  - Focus on major hotel chains: Hilton, Marriott, Hyatt, IHG
  - Create type definitions for hotel reward data
  - Update the frontend to handle hotel search results
  - Adapt the notification system to handle hotel availability alerts

### 2. AWS Infrastructure Integration

#### Scheduled Scraping
- **Current State**:
  - Currently using Firebase-based worker for marked fares
  - Background processing is limited to specific beta users
  - Running on-demand only when manually triggered

- **Priority Tasks**:
  - **Decision Made (2025-04-05):** Implement scheduled scraping using AWS Lambda functions triggered by EventBridge rules.
  - Define specific EventBridge rules (cron/rate) for AA and United scrapers.
  - Set up DynamoDB to store alert configurations and status
  - Create deployment scripts for AWS resources

#### Notification System
- **Current State**:
  - Basic email notification using Nodemailer
  - Email template exists but limited functionality
  - Only works for specific beta users
  - Email content is basic with no direct booking links

- **Priority Tasks**:
  - Implement AWS SNS for email and SMS notifications
  - Create more sophisticated notification templates
  - Add user preferences for notification frequency and channels
  - Implement notification history tracking

### 3. User Experience Improvements

- **Current State**:
  - Users can search for award availability
  - Limited alert functionality for beta users only
  - No way to manage or modify alerts after creation

- **Priority Tasks**:
  - Create user interface for setting up alerts with thresholds
  - Implement alert management screens
  - Add notification preference settings
  - Improve result display and filtering options

## Integration Strategy

The AWS integration will follow this approach:

1. **Data Storage Migration**:
   - Move alert configurations from Firebase to DynamoDB
   - Design schema to support both airline and hotel alerts

2. **Processing Pipeline**:
   - AWS EventBridge will trigger Lambda functions on schedule
   - Lambda functions will call the scraper backend API
   - Results will be compared against stored user thresholds
   - Matching results will trigger notifications

3. **Notification Delivery**:
   - AWS SNS will manage email and SMS delivery
   - Templates will be stored in S3
   - Notification history will be tracked in DynamoDB

## Immediate Next Steps

1. **Create Hotel Scraper Prototype**:
   - Start with Hilton API integration
   - Define standard hotel reward data format
   - Create adapters for hotel data similar to airline adapters

2. **Set Up AWS Infrastructure**:
   - Create basic AWS stack with CloudFormation or Terraform
   - Implement DynamoDB table for alert storage
   - Set up initial Lambda function for scraping

3. **Update Notification System**:
   - Enhance email templates for better user experience
   - Implement SMS notification capability
   - Add user preference management for notifications

## Technical Considerations

- Authentication needs to be maintained when moving to AWS
- Rate limiting must be preserved to prevent airline/hotel blocking
- Caching strategy should be reconsidered for serverless architecture
- Cold start times for Lambda with headless browsers may be an issue
- Consider using Lambda container images to package Chrome and dependencies

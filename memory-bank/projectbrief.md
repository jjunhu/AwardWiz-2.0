# AwardWiz Project Brief

## Project Overview
AwardWiz is a tool that searches airlines for award tickets, helping users find and monitor reward availability across multiple airlines. It allows users to track when low-fare award seats become available and can notify them when specific routes open up.

## Core Goals
1. Search multiple airlines for award ticket availability
2. Monitor changes in award availability
3. Alert users when desired award space opens up
4. Support both airline and hotel reward searches
5. Integrate with AWS infrastructure for scheduled scraping and notifications

## Target Users
- Travel enthusiasts who use airline miles and hotel points
- Users who want to be notified when specific award seats become available
- Users who want to compare award availability across multiple airlines

## Current Requirements and Priorities
1. **Get scrapers working for airlines and hotels**
   - Ensure all existing airline scrapers are functioning properly
   - Implement hotel scrapers for major hotel chains

2. **AWS Infrastructure Integration**
   - Set up scheduled scraping tasks on AWS
   - Implement notification system using AWS services
   - Create email and SMS alerts for users

## Key Features
- Multi-airline search capability
- Award seat availability monitoring
- Email and SMS notifications
- Support for direct flights
- Detection of premium cabin features (lie-flat pods, WiFi, etc.)
- Points/miles threshold monitoring
- Serverless architecture using AWS

## Success Metrics
- Reliable scraping across multiple airlines and hotels
- Timely notifications when award space opens
- Scalable and cost-effective AWS infrastructure
- User-friendly alert configuration

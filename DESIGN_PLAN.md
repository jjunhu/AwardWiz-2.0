# AwardWiz Design Document Outline (v3)

1.  **Introduction:**
    *   Project Goal: Search airline award availability.
    *   Core Problem: Accessing data from airline websites reliably, bypassing anti-botting.
2.  **High-Level Architecture:**
    *   Overview of the three main components: Frontend (UI), Backend (API/Orchestrator), Arkalis (Scraping Engine).
    *   Technology Stack Summary (Node.js, TypeScript, React, Vite, Express, Arkalis, Firebase, Docker).
    *   Mermaid Diagram illustrating component interaction.
3.  **Component Deep Dive:**
    *   **Frontend (`awardwiz/`)**
        *   Purpose: User Interface, Search Orchestration.
        *   Key Libraries: React, Vite, Ant Design, TanStack Query, Firebase Auth.
        *   Core Workflow (`useAwardSearch` hook): Route expansion -> Airline discovery (FR24) -> Scraper selection -> Award data fetching -> Aggregation.
        *   Authentication Flow.
        *   Caching Strategy (TanStack Query Persist).
        *   Code Snippet: `useAwardSearch` structure.
    *   **Backend API (`awardwiz-scrapers/`)**
        *   Purpose: API Gateway, Scraper Orchestration, Authentication/Authorization, Rate Limiting.
        *   Key Libraries: Express.js, Bottleneck, `express-jwt`, `jwks-rsa`.
        *   API Endpoint (`/run/...`).
        *   Authentication Handling (Google JWT, Service Worker JWT).
        *   Concurrency/Rate Limiting logic.
        *   Interaction with Arkalis (`runArkalis`).
        *   Code Snippet: Express route handler for `/run`.
    *   **Scraping Engine (`arkalis/`)**
        *   Purpose: Robust, anti-botting web scraping.
        *   Core Technology: Chrome DevTools Protocol (CDP).
        *   **Anti-Botting Techniques (Detailed):**
            *   Direct CDP Usage (vs. standard frameworks).
            *   Human-like Mouse Control (Bezier curves).
            *   "Cleaned-up" Chromium.
            *   Proxy Support (HTTP/SOCKS5 per scraper).
            *   Fingerprint Randomization (Screen size, browser size/position, timezone simulation).
            *   Testing Against Detection Suites.
        *   **Key Features:**
            *   **Shared Cache:** Details on how the global cache (`arkalis/response-cache.ts`) works, its persistence across scrapes, and configuration (TTL, path).
            *   Debugging (NoVNC).
            *   URL blocking/interception.
            *   Bandwidth Measurement.
            *   Retry Support.
        *   API (`arkalis.goto`, `arkalis.waitFor`, `arkalis.evaluate`).
        *   Code Snippet: Example usage from `arkalis/README.md`.
    *   **Individual Scrapers (`awardwiz-scrapers/scrapers/`)**
        *   Purpose: Implement logic for specific airlines.
        *   Structure: `meta` and `runScraper` exports.
        *   Interaction with Arkalis API (often using `evaluate` for direct API calls).
        *   Data Standardization.
        *   Code Snippet: Example `runScraper` from `aa.ts`.
4.  **Data Flow:**
    *   Step-by-step walkthrough of a user search request from frontend input to displayed results.
    *   Mermaid Sequence Diagram illustrating the flow.
5.  **Configuration & Environment:**
    *   Role of `.env` file.
    *   Key environment variables.
    *   Development Environment (Dev Container, `just` commands).
    *   Deployment (Docker).
6.  **Conclusion:**
    *   Summary of the project's design and strengths, highlighting the anti-botting focus and caching mechanisms.
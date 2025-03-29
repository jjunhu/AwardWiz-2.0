# AwardWiz Package Structure

This document outlines the package structure of the AwardWiz project, focusing on the main components and their relationships.

## Project Structure

```
awardwiz/
├── .dockerignore
├── .eslintrc.yml
├── .gitignore
├── config.json
├── config.schema.json
├── docker-compose.debug.yml
├── docker-compose.yml
├── Dockerfile
├── Justfile
├── package-lock.json
├── package.json
├── README.md
├── screenshot.png
├── tsconfig.json
├── wizard.png
│
├── arkalis/ - Scraping engine for avoiding anti-botting measures
│   ├── arkalis.png
│   ├── arkalis.ts
│   ├── browser.ts
│   ├── Dockerfile
│   ├── har-types.d.ts
│   ├── har.ts
│   ├── interaction.ts
│   ├── interceptor.ts
│   ├── page-helpers.ts
│   ├── proxy.ts
│   ├── README.md
│   ├── requests.ts
│   ├── response-cache.ts
│   └── test-anti-botting.ts
│
├── awardwiz/ - Frontend application
│   ├── .firebaserc
│   ├── airports.json
│   ├── firebase.json
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   ├── index.css
│   ├── index.html
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── vite.config.ts
│   ├── components/
│   │   ├── AwardSearchDebugTree.tsx
│   │   ├── DebugTree.tsx
│   │   ├── FastTooltip.tsx
│   │   ├── FlightSearch.tsx
│   │   ├── FlightSearchForm.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ScraperResultDetails.tsx
│   │   ├── SearchResults.tsx
│   │   └── SelectAirport.tsx
│   ├── emails/
│   │   └── notification.html
│   ├── helpers/
│   │   ├── common.ts
│   │   ├── firebase.ts
│   │   └── runScraper.ts
│   ├── hooks/
│   │   ├── awardSearch.ts
│   │   └── useAwardSearch.ts
│   ├── test/
│   │   └── DebugTree.test.tsx
│   ├── types/
│   │   ├── fr24.ts
│   │   └── scrapers.ts
│   └── workers/
│       ├── gen-statics.ts
│       ├── marked-fares.ts
│       └── preview-email.ts
│
├── awardwiz-scrapers/ - Backend scrapers for airline data
│   ├── awardwiz-types.d.ts
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── log.ts
│   ├── main-debug.ts
│   ├── main-server.ts
│   ├── scrapers.test.ts
│   ├── vite.config.ts
│   ├── scraper-types/ - Type definitions for scrapers
│   │   ├── aa.d.ts
│   │   ├── aeroplan.d.ts
│   │   ├── alaska.d.ts
│   │   ├── delta.d.ts
│   │   ├── fr24.d.ts
│   │   ├── jetblue.d.ts
│   │   ├── skiplagged.d.ts
│   │   ├── southwest.d.ts
│   │   └── united.d.ts
│   └── scrapers/ - Individual airline scrapers
│       ├── aa.ts
│       ├── aeroplan.ts
│       ├── alaska.ts
│       ├── delta.ts
│       ├── fr24.ts
│       ├── jetblue.ts
│       ├── skiplagged.ts
│       ├── southwest.ts
│       └── united.ts
│
└── test/
    └── awardwiz/
        ├── awardSearch.test.ts
        ├── __snapshots__/
        │   └── awardSearch.test.ts.snap
        └── stubs/
            ├── aa-oak-hnl.json
            ├── aa-sfo-hnl.json
            ├── aeroplan-sfo-hnl.json
            ├── alaska-sfo-hnl.json
            ├── fr24-invalid.json
            ├── fr24-missing-airline-info.json
            ├── fr24-oak-hnl.json
            ├── fr24-sfo-hnl.json
            ├── fr24-sfo-lih.json
            ├── skiplagged-oak-hnl.json
            └── skiplagged-sfo-hnl.json
```

## Key Components

1. **arkalis/** - A specialized scraping engine designed to avoid anti-botting measures used by airline websites. This is a core technology that enables reliable data collection.

2. **awardwiz-scrapers/** - Backend scraper modules for each supported airline. Contains the logic for extracting award seat data from airline websites.

3. **awardwiz/** - The frontend application that presents search results to users and handles user interactions, including notification setup.

4. **test/** - Contains test cases and mock data for testing functionality.

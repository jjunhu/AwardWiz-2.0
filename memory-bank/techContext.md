# AwardWiz Technical Context

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design (antd)
- **State Management**: 
  - React Query (@tanstack/react-query) for data fetching and caching
  - React Query persist client for persistence
- **Authentication**: Google OAuth via @react-oauth/google
- **Routing**: React (no dedicated router observed)

### Backend
- **Runtime**: Node.js with TypeScript
- **Server**: Express.js
- **Authentication**: JWT (express-jwt)
  - JWT verification via jwks-rsa
  - Rate limiting with express-rate-limit
- **Concurrency Control**: Bottleneck for managing concurrent requests

### Scraping Engine (Arkalis)
- **Browser Automation**: Direct Chrome DevTools Protocol (CDP) via chrome-remote-interface
- **Browser Launching**: chrome-launcher
- **HTTP Handling**: Custom implementation for request/response handling
- **Caching**: Custom file-based caching system

### Data Storage
- **Database**: Firebase Firestore
- **Service**: Firebase Authentication for user management
- **Local Storage**: File-based cache for scraper results

### Notification System
- **Email**: Nodemailer for email sending
- **Templates**: Handlebars for email template rendering
- **Scheduling**: Currently using worker processes

### DevOps & Tooling
- **Containerization**: Docker with Docker Compose
- **Task Runner**: Just (via Justfile)
- **Package Management**: npm
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript

## Development Setup

### Local Development Environment
The project uses VS Code Dev Containers for development, which provides a consistent environment with all necessary tools pre-installed:

```bash
# Starting the development environment
# 1. Load project in VSCode with Dev Containers extension
# 2. Use the "Open in Container" command

# Running a scraper for testing
just run-scraper aa SFO LAX 2023-12-01

# Running the backend server
just run-server

# Running the frontend
just run-vite
```

### Environment Variables
Required for running the application:
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_FIREBASE_CONFIG_JSON`: Firebase configuration in JSON format
- `VITE_SCRAPERS_URL`: URL for the scrapers backend service

Optional variables:
- `VITE_USE_FIREBASE_EMULATORS`: Use Firebase emulators for local development
- `VITE_LOKI_LOGGING_URL`: Grafana Loki URL for logging
- `VITE_LOKI_LOGGING_UID`: User ID for Loki logging
- `VITE_SMTP_CONNECTION_STRING`: SMTP connection string for email notifications
- `VITE_FIREBASE_SERVICE_ACCOUNT_JSON`: Firebase service account JSON for backend services
- `SERVICE_WORKER_JWT_SECRET`: Secret for service worker authentication

## Technical Constraints

### Anti-Botting Measures
Airlines and hotel websites employ sophisticated anti-botting techniques that require specialized approaches:
- Browser fingerprinting detection
- Mouse movement pattern analysis
- Rate limiting and IP blocking
- CAPTCHA and browser verification challenges

The Arkalis engine is specifically designed to work around these constraints with:
- Human-like mouse movements
- Browser fingerprint randomization
- Proxy support
- Request/response interception

### Scraping Reliability
Airline websites frequently change their structure and APIs, requiring:
- Regular scraper maintenance
- Robust error handling
- Fallback mechanisms
- Logging and monitoring

### Performance Considerations
- The headless browser approach is resource-intensive
- Each scraper may take several seconds to complete
- Concurrent scraping is limited to prevent overloading

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "@ant-design/icons": "^5.1.4",
    "@react-oauth/google": "^0.11.0",
    "@tanstack/react-query": "^4.29.19",
    "@tanstack/react-query-persist-client": "^4.29.19",
    "antd": "^5.6.3",
    "bottleneck": "^2.19.5",
    "chrome-launcher": "^0.15.2",
    "chrome-remote-interface": "^0.32.2",
    "express": "^4.18.2",
    "express-jwt": "^8.4.1",
    "express-rate-limit": "^6.7.0",
    "firebase": "^9.23.0",
    "firebase-admin": "^11.3.0",
    "handlebars": "^4.7.7",
    "nodemailer": "^6.8.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "winston": "^3.9.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^20.3.3",
    "@typescript-eslint/eslint-plugin": "^5.60.1",
    "@typescript-eslint/parser": "^5.60.1",
    "@vitejs/plugin-react": "^4.0.1",
    "eslint": "^8.44.0",
    "typescript": "^5.2.0-dev.20230629",
    "vite": "^4.3.9",
    "vitest": "^0.32.2"
  }
}
```

## Interface Design

### Common Data Structures

#### Flight With Fares
```typescript
interface FlightWithFares {
  departureDateTime: string;
  arrivalDateTime: string;
  origin: string;
  destination: string;
  flightNo: string;
  duration: number;
  aircraft: string;
  amenities: {
    hasPods: boolean;
    hasWiFi: boolean;
  };
  fares: FlightFare[];
}

interface FlightFare {
  cash: number;
  currencyOfCash: string;
  miles: number;
  cabin: "economy" | "business" | "first";
  scraper: string;
  bookingClass?: string;
  isSaverFare?: boolean;
}
```

#### Search Query
```typescript
interface SearchQuery {
  origins: string[];
  destinations: string[];
  departureDate: string;
}
```

## API Design

### Scraper API Endpoint
```
GET /run/:scraperName-:origin-:destination-:departureDate
```

Parameters:
- `scraperName`: The name of the scraper to run (e.g., "aa", "united", "delta")
- `origin`: 3-letter airport code for origin
- `destination`: 3-letter airport code for destination
- `departureDate`: Date in YYYY-MM-DD format

Authentication: JWT required
Rate Limiting: Enforced per user

Response: JSON with scraper results or error information

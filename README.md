# Live News Stream (Spring Boot + Angular)

Small demo application that fetches live news headlines from a free news API in a Spring Boot backend and pushes them to clients via **Server‑Sent Events (SSE)**.  
A minimal **Angular** frontend (served as static content by Spring Boot) consumes the SSE stream and renders the headlines using **Angular Material** cards.

---

## Architecture

- **Spring Boot backend**
  - Uses Spring Boot 3 / Spring Framework 6 to call a free news REST API (e.g. NewsAPI `top-headlines`).
  - Wraps each headline as a `NewsItem` and pushes it to connected clients via a `/news` SSE endpoint (using `SseEmitter`).
  - Polling interval is configurable (10–60 seconds). The scheduler reads the current value before scheduling the next poll.
  - Exposes `/config/polling-interval` (GET/POST) to read and update the polling interval and `/stream-sse` as a minimal example SSE endpoint (from the original Medium article).

- **Angular frontend**
  - Standalone Angular 18 app with Angular Material.
  - Connects to `/news` using `EventSource` 
  - Provides a toolbar dropdown to change the backend polling interval (10–60 seconds in 10‑second steps) by calling `/config/polling-interval`.
---

## Prerequisites

- JDK 21+
- Node.js + npm
- Angular CLI (for local development):

## API Calls

- Globally set interval:

  ```bash
  curl -X POST "localhost:8085/config/polling-interval?seconds=30"
  ```

- Fetch current poll interval:

  ```bash
  curl "localhost:8085/config/polling-interval"
  ```

- Fetch number of active client sessions:

  ```bash
  curl "localhost:8085/clients"
  ```
---


# Load test queries..
  ```bash
    # List all curl processes hitting 8085/news
    ps aux | grep "[c]url.*8085/news"
    
    # OR count them
    ps aux | grep -c "[c]url.*8085/news"
    
    # Detailed list with PIDs
    pgrep -f "curl.*8085/news" -l
    
    # Watch in real-time
    watch -n 1 'ps aux | grep "[c]url.*8085/news" | wc -l'
    
    # Kill them all
    pkill -f "curl.*8085/news"    
  ```

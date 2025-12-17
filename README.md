# Live News Stream (Spring Boot + Angular)

Small demo application that fetches live news headlines from a free news API in a Spring Boot backend and pushes them to clients via **Server‑Sent Events (SSE)**.  
A minimal **Angular** frontend (served as static content by Spring Boot) consumes the SSE stream and renders the headlines using **Angular Material** cards.[web:1][web:66]

---

## Architecture

- **Spring Boot backend**
    - Periodically calls a free news REST API (e.g. NewsAPI `top-headlines`).[web:1]
    - Wraps each headline as a `NewsItem` and pushes it to connected clients via `/news` SSE endpoint (using `SseEmitter`).
    - Exposes an example `/stream-sse` endpoint for simple SSE testing (as in the original Medium article).[web:1]

- **Angular frontend**
    - Simple standalone Angular app.
    - Connects to `/news` using `EventSource`.
    - Displays incoming headlines as a single-column list of Material cards.
    - Date is rendered in a bar on top of each card, followed by a divider and the article content.[web:71]

---

## Prerequisites
- JDK 21+
- Maven or Gradle (depending on your Spring Boot build)
- Node.js + npm
- Angular CLI (for local development):  

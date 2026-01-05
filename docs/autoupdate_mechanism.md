# Auto-Update Mechanism Architecture

## 1. Problem Statement
The Learner GUI currently only updates data (e.g., Mastery scores, active goals) on page load or manual refresh. This leads to stale data and a disconnected user experience. Polling (e.g., every 5 seconds) is not a viable solution as it would significantly increase server load given the potential number of concurrent learners.

## 2. Selected Solution: Server-Sent Events (SSE)

We will implement an auto-update mechanism using **Server-Sent Events (SSE)**.

### Rationale
- **Efficiency**: SSE establishes a single, persistent, unidirectional HTTP connection from Server to Client.
- **Low Latency**: Updates are pushed immediately when they happen.
- **Simplicity**: Supported natively by Spring Boot (`SseEmitter`) and modern browsers (`EventSource`).
- **Load Profite**: Unlike polling ("Are we there yet?"), the connection sits idle until an event occurs.

## 3. Architecture

### Backend (Spring Boot)
The backend uses an event-driven approach to decouple the business logic from the notification layer.

1.  **Event Definition**: `LearnerStateChangedEvent`
    - Payload: `skillpilotId` (Target Learner), `changeType` (e.g., `MASTERY_UPDATE`, `GOAL_UPDATE`).
2.  **Event Publication**:
    - `LearnerService` publishes `LearnerStateChangedEvent` via Spring's `ApplicationEventPublisher` whenever a state-changing operation completes (e.g., `setMastery`).
3.  **SSE Management (`SseService`)**:
    - Maintains a concurrent map of active `SseEmitter`s keyed by `skillpilotId`.
    - Implements an `@EventListener` for `LearnerStateChangedEvent`.
    - When an event is received, it looks up the emitter for the target learner and pushes a JSON notification.
4.  **API Endpoint (`UpdateController`)**:
    - `GET /api/ui/updates/{skillpilotId}`
    - Returns `text/event-stream`.
    - Registers the new emitter with `SseService`.

### Frontend (React)
The frontend manages the connection lifecycle and reacts to incoming events.

1.  **Hook (`useLearnerUpdates`)**:
    - Accepts `skillpilotId`.
    - Opens an `EventSource` connection to `/api/ui/updates/{skillpilotId}`.
    - Handles automatic reconnection (native to `EventSource`).
2.  **Consumption**:
    - Listens for specific event types.
    - Triggers `refreshMastery()` or other data re-fetch logic in `useLearnerProgress` when a notification is received.

## 4. Implementation Details

### API Protocol
**Endpoint:** `GET /api/ui/updates/{skillpilotId}`

**Response Stream:**
```text
data: {"type": "MASTERY_UPDATE", "timestamp": 123456789}

data: {"type": "ACTIVE_GOAL_UPDATE", "timestamp": 123456799}
```

### Security Considerations
- The SSE endpoint must be secured similarly to other learner endpoints (currently based on `skillpilotId` knowledge, future JWT integration).
- Heartbeats should be sent (or comment lines) to keep the connection alive ensuring proxies don't kill it.

## 5. Scalability Considerations

### Vertical Scalability (Single Server)
**Rating: Excellent**
- **Efficiency**: SSE is highly efficient for vertical scaling. Unlike polling, which consumes CPU resources with every check (e.g., 200 req/s for 1000 users), SSE maintains open connections with minimal CPU overhead (NIO non-blocking).
- **Capacity**: A standard Spring Boot instance can easily handle 10,000+ concurrent idle connections.

### Horizontal Scalability (Multi-Server)
**Rating: Needs Middleware**
- **Limitation**: The current design uses Spring's internal `ApplicationEventPublisher`. In a multi-server setup (Server A + Server B), an event triggered on Server A will not result in a notification for a user connected to Server B.
- **Solution**: To scale horizontally, the internal event bus must be replaced by an external Pub/Sub mechanism (e.g., **Redis**).
- **Recommendation**: Start with the Single-Node implementation (Current Plan). Refactoring to Redis is straightforward and only required when the user base exceeds the capacity of a single vertical instance.

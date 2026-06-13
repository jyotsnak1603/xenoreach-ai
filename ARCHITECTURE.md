# XenoReach AI - System Architecture

This document explains the technical tradeoffs, scale assumptions, and system design decisions made for XenoReach AI, specifically addressing the requirements of an AI-Native Mini CRM for Direct-to-Consumer brands.

## 1. Asynchronous Callback Loop (The Channel Service)

A core requirement of this CRM is robust message dispatch and delivery tracking. 

### Current Implementation (Scope-Appropriate)
- **CRM Backend (`crm-backend` / Django)**: When a campaign is launched, the Django API immediately returns a `200 OK` (simulating a `202 Accepted`). The actual heavy lifting of iterating through thousands of customers and pushing HTTP requests to the Channel Service is deferred to a background thread to avoid blocking the web server.
- **Channel Service (`channel-service` / FastAPI)**: Acts as an independent microservice representing a third-party messaging provider (like Twilio, SendGrid, or Gupshup). It receives dispatch requests and offloads the simulation to `FastAPI BackgroundTasks`.
- **The Loop**: The Channel Service simulates network and user behavior (Sent -> Delivered -> Opened -> Clicked -> Converted) with randomized delays and probabilities. It then sends webhooks back to the CRM (`/api/receipts/channel-callback/`).
- **Resilience**: I integrated the `tenacity` library in the Channel Service. If the CRM is temporarily down or under heavy load, the Channel Service utilizes exponential backoff to retry sending the webhook, ensuring zero data loss of critical engagement metrics.

### Production Scale Evolution
At 10M+ messages a day, synchronous HTTP dispatch (even in a thread) and simple API webhooks will fail.
- **Message Dispatch**: Instead of HTTP posts, the CRM would publish dispatch events to a message broker (e.g., **Apache Kafka** or **RabbitMQ**).
- **Callback Ingestion**: The CRM web server should not handle webhook ingestion directly. The API should dump incoming webhooks into a Redis or SQS queue immediately. A dedicated fleet of worker nodes (e.g., **Celery**) would then process the queue, update the database in bulk transactions, and prevent database locks.

## 2. AI-Native Integration

I treat AI as a deterministic software component, not just a text generator.

### Current Implementation
- I utilize **Gemini 2.5 Flash** leveraging its native `response_schema` capabilities.
- Instead of brittle regex parsing of markdown outputs, Django backend enforces rigid `Pydantic` schemas for every AI call (e.g., `CampaignPlanSchema`, `MessageVariantsSchema`).
- This guarantees that the AI always returns highly predictable, valid JSON that the CRM can instantly process without complex fallback handling.

## 3. Data Ingestion & Attribution

The holy grail of a marketing CRM is proving that a message caused a sale (Attribution).

### Current Implementation
- The Data Model explicitly tracks every message lifecycle via the `Communication` and `CommunicationEvent` models.
- The `Order` model contains a nullable `source_communication` ForeignKey.
- When the Channel Service simulates a "Converted" event, CRM webhook automatically mints a new `Order` tied directly to that `Communication`. This creates a closed-loop attribution system, allowing the Analytics dashboard to definitively say: "Campaign X generated ₹Y in revenue."

# RetailMind: Engineering Documentation & Portfolio Guide

## 📐 1. Architectural Trade-offs & Decisions

### **Microservices vs. Monolith**
**Decision:** Distributed Microservices.
**Rationale:** Computer Vision inference is compute-intensive and often requires specialized hardware (GPUs). By isolating the `cv_service`, we can deploy it on the "edge" while the `backend` and `ai_service` run in the cloud. This separation also prevents the Python Global Interpreter Lock (GIL) from blocking API requests during heavy model inference.

### **Database Choice: PostgreSQL**
**Decision:** Relational DB (PostgreSQL) with JSONB support.
**Rationale:** While analytics events are high-frequency, the metadata associated with them (Zones, Stores, Cameras) is highly relational. PostgreSQL provides the perfect balance of ACID compliance for business logic and JSONB flexibility for diverse CV event metadata.

### **Real-time Engine: Django Channels + Redis**
**Decision:** WebSocket abstraction via Django Channels.
**Rationale:** We required a pub/sub mechanism to broadcast events from the CV Service to multiple dashboard users. Redis acts as the high-performance backplane (Channel Layer), enabling stateless horizontal scaling of the backend workers.

---

## 👨‍💻 2. Interview Talking Points

### **"How do you handle real-time performance at scale?"**
"We use an event-driven pipeline. Instead of the frontend polling the database, the CV service pushes events to a REST endpoint. The backend then triggers a Django Signal that broadcasts the payload via Redis to all connected WebSocket clients. This ensures sub-second latency and minimizes database overhead."

### **"How do you prevent AI hallucinations in the Insights Assistant?"**
"We implement 'Structured Grounding'. The AI service never has direct access to the database. Instead, it queries a specific 'Analytics Summary' API. The resulting JSON is injected into a strict system prompt for the Gemini model. This ensures the LLM acts as a 'Reasoning Engine' over verified data, rather than a creative writer."

### **"Tell me about a complex technical challenge you solved."**
"Implementing the spatial analytics engine. We had to move beyond simple bounding boxes to polygonal zones. I integrated the `shapely` library to perform Point-in-Polygon calculations on the object centroids. I also implemented a state-tracking mechanism in the CV service to calculate 'Dwell Time' only when a person successfully exits a zone, preventing redundant database writes."

---

## 🚀 3. Scalability & Production Readiness

### **Current Bottlenecks**
1. **Sync Ingestion:** Currently, the CV Service POSTs directly to the Django API. For a 100-camera deployment, we should introduce a Message Broker (RabbitMQ/Kafka) to buffer events.
2. **In-Memory Tracking:** The `EventEngine` keeps track of active people in memory. For a persistent, multi-day tracking system, we should move active track states to a Redis cache.

### **Production Checklist**
- [ ] Implement JWT Authentication for WebSockets.
- [ ] Add Nginx as a Reverse Proxy with SSL termination.
- [ ] Transition from `sqlite` (if used) to RDS-managed PostgreSQL.
- [ ] Implement automated log rotation for the high-frequency CV logs.
- [ ] Use `gunicorn` with `uvicorn` workers for the Django ASGI deployment.

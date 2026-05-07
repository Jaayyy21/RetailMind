# RetailMind Architecture & Design

## 1. System Overview
RetailMind is a distributed AI-powered retail analytics platform. It transforms raw video data into actionable business intelligence using Computer Vision and LLMs.

## 2. Core Components

### 2.1 Backend (Django + DRF + Channels)
- **Role:** Central API Gateway, business logic hub, and real-time event dispatcher.
- **Key Technologies:** Python, Django, Redis (Channel Layer), PostgreSQL.
- **Responsibilities:**
    - Managing retail metadata (stores, zones, cameras).
    - Persisting processed analytics events.
    - Providing REST APIs for the dashboard.
    - Broadcasting real-time updates via WebSockets.

### 2.2 CV Service (Python + YOLOv8 + ByteTrack)
- **Role:** Edge/Cloud inference engine for spatial intelligence.
- **Key Technologies:** OpenCV, Ultralytics YOLOv8, ByteTrack.
- **Responsibilities:**
    - Ingesting video streams (RTSP/File).
    - Real-time object detection (People, Products).
    - Multi-object tracking (MOT) for path analytics.
    - Event Generation: Converting visual data into structured JSON events (e.g., `ENTRANCE_CROSSING`, `ZONE_DWELL_TIME`).
    - Pushing events to the Backend via REST/Message Queue.

### 2.3 Frontend Dashboard (React + Tailwind)
- **Role:** Executive and Operational interface.
- **Key Technologies:** React, Vite, Tailwind CSS, Recharts.
- **Responsibilities:**
    - Visualizing real-time occupancy and flow.
    - Historical trend analysis.
    - Interactive zone management.

### 2.4 AI Service (Gemini + RAG)
- **Role:** Intelligent insights and natural language interface.
- **Key Technologies:** Google Gemini API, LangChain, ChromaDB.
- **Responsibilities:**
    - Answering natural language queries about retail performance.
    - Generating weekly/monthly summary reports.
    - Predictive analytics based on historical trends.

## 3. Data Flow & Event Pipeline

1. **Inference:** CV Service processes a frame.
2. **Event Detection:** A person crosses a virtual "Entrance" line.
3. **Ingestion:** CV Service sends a `POST /api/v1/events/` request to the Backend.
4. **Persistence:** Backend validates and saves the event to PostgreSQL.
5. **Real-time Broadcast:** Backend triggers a Django Signal, which pushes the event to the `realtime_analytics` WebSocket group.
6. **UI Update:** The React Dashboard receives the event and updates the "Real-time Occupancy" counter instantly.

## 4. Scalability Considerations
- **Stateless CV Workers:** Multiple instances of the CV service can be deployed to handle different camera feeds.
- **Redis as a Buffer:** As the platform grows, we can introduce a message broker (RabbitMQ/Kafka) between the CV service and Backend to handle high-frequency bursts.
- **Database Partitioning:** PostgreSQL tables for events can be partitioned by time (e.g., monthly) for faster queries on historical data.

## 5. Deployment
The entire stack is containerized using **Docker** and orchestrated via **Docker Compose** for local development, making it ready for **Kubernetes (GKE)** deployment in a production environment.

# RetailMind: Smart Retail Intelligence Platform

RetailMind is a production-grade, AI-powered retail analytics ecosystem. It transforms raw video streams into actionable business intelligence using Computer Vision, real-time event streaming, and modern dashboarding.

## 🏗 System Architecture

RetailMind follows a distributed microservices architecture:

- **CV Service (Inference):** Python microservice running **YOLOv8** and **ByteTrack**. It processes video feeds (or mocks them) and emits structured events.
- **Backend (API Gateway):** **Django REST Framework** + **Django Channels**. It manages retail metadata, persists analytics in **PostgreSQL**, and broadcasts real-time updates via **Redis**.
- **Frontend (Dashboard):** **React** + **Vite** + **Tailwind**. A SaaS-grade analytics interface that connects to live event streams via WebSockets.
- **Infrastructure:** Fully containerized with **Docker**, orchestrated with health-aware dependency management.

## 🚀 Quick Start

### 1. Requirements
- Docker & Docker Compose
- (Optional) A local webcam or video file

### 2. Launching the Platform
```bash
# Clone and enter
git clone <repo-url>
cd RetailMind

# Setup environment
cp .env.example .env

# Build and Start
docker-compose up --build
```

### 3. Accessing the Dashboard
Once the services show as `healthy`:
- **Main Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Documentation:** [http://localhost:8000/api/v1/analytics/](http://localhost:8000/api/v1/analytics/)

## 📈 Core Features (Phase 1)
- **Real-time Occupancy:** Live tracking of customers currently in-store.
- **Traffic Analytics:** Counting entries and exits via Computer Vision.
- **Activity Feed:** Live stream of retail events (Entry, Exit, Occupancy changes).
- **Service Health Monitoring:** Real-time pulse of CV nodes and database connectivity.

## 🛠 Tech Stack
- **Vision:** YOLOv8, OpenCV, ByteTrack.
- **Backend:** Python 3.11, Django 4.2, Redis 7, PostgreSQL 15.
- **Frontend:** React 18, Tailwind CSS, Lucide Icons.
- **DevOps:** Docker, Healthchecks, Modular Service Scaffolding.

## 🗺 Roadmap
- **Phase 2:** Zone-based analytics (Heatmaps, Aisle performance).
- **Phase 3:** Gemini AI integration for natural language retail insights.

---
*Built with senior-level engineering practices for scalability, maintainability, and real-time performance.*

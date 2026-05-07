# Frontend Architecture: Scalable Analytics Dashboard

## 1. Directory Structure
We follow a modular, feature-based organization to prevent monolithic file growth:

- `src/components/`: Reusable UI atoms and molecules (Cards, Buttons, Layout).
- `src/features/analytics/`: Domain-specific components (OccupancyCard, EventFeed).
- `src/hooks/`: Custom hooks for shared logic (e.g., `useWebSocket`).
- `src/services/`: Pure logic layers for API calls and WebSocket management.
- `src/store/`: Centralized state (using Context or lightweight state management).

## 2. Real-time Data Layer
- **WebSocket Service:** A singleton or dedicated hook that handles connection lifecycle, automatic reconnection, and message parsing.
- **State Management:** Using React's `useState` and `useReducer` for the initial phase, structured to easily migrate to Redux or Zustand as complexity grows. Data is updated immutably to trigger efficient re-renders.

## 3. UI/UX Strategy
- **SaaS Aesthetic:** Clean, high-contrast typography, and a spacious grid system using **Tailwind CSS**.
- **Responsive Design:** Mobile-first approach with a sidebar that collapses on smaller screens.
- **Visual Feedback:** 
    - Real-time "pulse" indicators for the WebSocket connection status.
    - Animation transitions for the live event feed using simple CSS or Framer Motion.

## 4. Reusable Widgets
Analytics components are designed as "dumb" widgets that receive data via props, making them easy to test and reuse across different pages of the dashboard (e.g., Store Overview vs. Camera View).

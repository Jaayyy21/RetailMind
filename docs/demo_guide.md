# RetailMind Operational Demo Guide

## 1. The "Golden Path" Demo Walkthrough
To demonstrate RetailMind's capabilities to stakeholders or in a portfolio review, follow these exact steps:

### Step 1: Launch the Cluster
Open your terminal and run:
```bash
docker-compose up --build
```
*Visual check:* Watch the logs. You should see `db` acknowledge readiness, `backend` running migrations, and then `cv_service` outputting: `🎬 Pre-seeding store with initial shoppers...` followed by real-time emoji logs (✨ New Person, 🚶 Person Exited).

### Step 2: Open the Dashboard
Navigate to [http://localhost:3000](http://localhost:3000).

### Step 3: Presenting the Features
1. **Connectivity Indicator:** Point out the green "Live Data Feed" pulsing in the top right. This proves the WebSocket connection is active.
2. **Occupancy Counter:** Show the blue "Current Occupancy" card. Explain how it fluctuates automatically based on edge inference data.
3. **Traffic Metrics:** Highlight the Entry (Green) and Exit (Orange) cumulative counters.
4. **Live Event Feed:** Scroll down to the right-hand column. Watch as raw JSON payloads from the CV service are parsed into human-readable timestamps and event descriptions in real-time. Mention that the `Object ID` maps directly to ByteTrack's internal identity persistence.

## 2. Troubleshooting Guide

### Issue: Frontend stays on "Connecting..."
**Cause:** The backend WebSocket server is not reachable, or Redis is down.
**Fix:** 
1. Check backend logs: `docker logs retailmind-backend-1`
2. Ensure Redis is healthy: `docker logs retailmind-redis-1`
3. Verify your browser isn't blocking WS connections (check browser console).

### Issue: "Foreign Key Constraint Failed" in Backend Logs
**Cause:** The CV service is POSTing events to `Store 1`, but the database is empty.
**Fix:** The `entrypoint.sh` is designed to prevent this by auto-seeding data. If it happens, restart the stack `docker-compose down -v` and `docker-compose up` to trigger a clean database seed.

### Issue: CV Service exits immediately
**Cause:** It might be trying to access a webcam (`VIDEO_SOURCE=0`) that docker cannot access.
**Fix:** Ensure `.env` or `docker-compose.yml` has `VIDEO_SOURCE=mock` to use the simulated retail traffic loop.

## 3. Demo Mode Behavior Explained
When `VIDEO_SOURCE=mock`, the CV service bypasses OpenCV and Ultralytics. Instead, it runs an advanced probabilistic loop:
- **Pre-seeding:** Spawns 3-8 initial "people" so the dashboard isn't empty on load.
- **Traffic Bursts:** 15% chance every 2 seconds for a "group" (2-4 people) to enter simultaneously.
- **Natural Attrition:** 50% chance an existing tracked person leaves the store.
This creates highly realistic, staggered fluctuations on the dashboard rather than linear, boring $+1 / -1$ increments.

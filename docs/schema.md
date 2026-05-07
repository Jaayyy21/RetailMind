# RetailMind Database Schema Design

## Users & Auth
- `User`: Custom user model (email, role: Admin/Manager).

## Retail Infrastructure
- `Store`: (name, location, timezone).
- `Zone`: (store_id, name, type: Entrance/Checkout/Aisle, coordinates_json).
- `Camera`: (store_id, name, stream_url, position_metadata).

## Analytics Events
- `AnalyticsEvent`:
    - `id`: UUID
    - `timestamp`: DateTime
    - `event_type`: (ENTRY, EXIT, ZONE_ENTER, ZONE_EXIT, DWELL_TIME)
    - `camera_id`: FK to Camera
    - `zone_id`: FK to Zone (Optional)
    - `object_id`: String (Tracking ID from CV)
    - `metadata`: JSONB (Extra data like confidence, duration, etc.)

## Aggregated Metrics (for faster reporting)
- `HourlyOccupancy`: (store_id, timestamp, count)
- `DailyZonePerformance`: (zone_id, date, total_dwell_time, total_entries)

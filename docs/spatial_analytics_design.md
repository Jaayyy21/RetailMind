# Spatial Analytics Architecture: Moving from Points to Polygons

## 1. Geometric Logic
Retail zones are rarely simple rectangles. To support complex store layouts (L-shaped aisles, circular kiosks), we use **Polygonal Zones**.
- **Library:** `shapely` is used for its robust computational geometry.
- **Algorithm:** Point-in-Polygon (PIP). We calculate the **centroid** of the YOLO bounding box and determine if it resides within the `shapely.geometry.Polygon` defined for a zone.

## 2. State Management in CV Service
The `EventEngine` is upgraded to maintain a **Zone State Map**:
- `{track_id: current_zone_id}`
- `{track_id: {zone_id: entry_timestamp}}`

### Event Logic:
- **ZONE_ENTER:** Triggered when a `track_id` centroid moves from `None` to `Zone A` or from `Zone B` to `Zone A`.
- **ZONE_EXIT:** Triggered when a `track_id` moves from `Zone A` to `None`.
- **DWELL_TIME:** Calculated upon `ZONE_EXIT`. `duration = current_time - entry_timestamp`.
- **ZONE_TRANSITION:** A composite event (Exit A + Enter B) used to track customer flow patterns.

## 3. Data Flow
1. **Config:** CV Service loads Zone definitions (Polygons) from the Backend or a local config.
2. **Inference:** Every frame, centroids are calculated.
3. **Spatial Query:** For each active track, we check intersection with all defined polygons.
4. **State Transition:** Compare against the previous frame's state to emit events.

## 4. Scalability & Performance
- **Spatial Indexing:** For stores with hundreds of zones, we can implement an R-Tree index (via `rtree` or `geopandas`) to avoid $O(N \times M)$ checks.
- **Centroid Smoothing:** To prevent "flickering" events when a person stands on a boundary, we implement a **hysteresis buffer** (e.g., person must be in/out for 3 consecutive frames before triggering an event).

## 5. Future Heatmap Pipeline
The spatial engine provides the foundation for heatmaps. Instead of just events, we can periodically export `(x, y, timestamp)` breadcrumbs to a vector-tiled heatmap layer in the dashboard.

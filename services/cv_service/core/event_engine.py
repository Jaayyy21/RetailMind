import logging
import os
import time
from .spatial import ZoneManager

logger = logging.getLogger(__name__)

class EventEngine:
    """
    Translates raw tracking data into retail business events.
    Now supports Spatial Analytics (Zones, Dwell Time).
    """
    def __init__(self):
        self.prev_positions = {} # track_id -> bbox
        self.occupancy_count = 0
        
        # Spatial State
        self.zone_manager = ZoneManager()
        self.track_zone_map = {} # track_id -> current_zone_id
        self.track_entry_times = {} # track_id -> {zone_id: entry_time}
        
        # In production, these would be fetched from the backend or config
        self.store_id = int(os.getenv("STORE_ID", 1))
        self.camera_id = int(os.getenv("CAMERA_ID", 1))

        # Initialize Mock Zones for Phase 2 Demo
        self._setup_mock_zones()

    def _setup_mock_zones(self):
        # Define 3 simple zones for the mock 640x480 frame
        self.zone_manager.add_zone(1, [[0, 0], [200, 0], [200, 480], [0, 480]]) # Left: Entrance
        self.zone_manager.add_zone(2, [[200, 0], [440, 0], [440, 480], [200, 480]]) # Middle: Main Aisle
        self.zone_manager.add_zone(3, [[440, 0], [640, 0], [640, 480], [440, 480]]) # Right: Checkout

    def process_tracks(self, track_ids, boxes):
        events = []
        current_time = time.time()
        
        # 1. Global Occupancy Check
        current_count = len(track_ids)
        if current_count != self.occupancy_count:
            logger.info(f"📊 Occupancy Change: {self.occupancy_count} -> {current_count}")
            events.append(self._create_base_event("OCCUPANCY_UPDATE", "system", {"count": current_count}))
            self.occupancy_count = current_count

        active_ids = set(track_ids)

        # 2. Per-Object Spatial Processing
        for track_id, box in zip(track_ids, boxes):
            centroid_x, centroid_y = self.zone_manager.get_centroid(box)
            new_zone_id = self.zone_manager.get_zone_at_point(centroid_x, centroid_y)
            old_zone_id = self.track_zone_map.get(track_id)

            # --- Zone Transition Logic ---
            if new_zone_id != old_zone_id:
                # EXIT old zone
                if old_zone_id is not None:
                    entry_time = self.track_entry_times.get(track_id, {}).get(old_zone_id)
                    dwell_time = current_time - entry_time if entry_time else 0
                    
                    logger.info(f"🚶 ID {track_id} EXITED Zone {old_zone_id} after {dwell_time:.1f}s")
                    events.append(self._create_base_event("ZONE_EXIT", str(track_id), {
                        "zone_id": old_zone_id,
                        "dwell_time": dwell_time
                    }))

                # ENTER new zone
                if new_zone_id is not None:
                    logger.info(f"📍 ID {track_id} ENTERED Zone {new_zone_id}")
                    events.append(self._create_base_event("ZONE_ENTER", str(track_id), {"zone_id": new_zone_id}))
                    
                    # Track entry time for dwell calculation
                    if track_id not in self.track_entry_times:
                        self.track_entry_times[track_id] = {}
                    self.track_entry_times[track_id][new_zone_id] = current_time

                self.track_zone_map[track_id] = new_zone_id

            # Standard Entry Tracking
            if track_id not in self.prev_positions:
                logger.info(f"✨ New Person Detected: ID {track_id}")
                events.append(self._create_base_event("ENTRY", str(track_id), {"bbox": box.tolist()}))
            
            self.prev_positions[track_id] = box

        # 3. Global Exit Check (Object Disappeared)
        for old_id in list(self.prev_positions.keys()):
            if old_id not in active_ids:
                # Handle zone cleanup for exiting objects
                current_zone = self.track_zone_map.get(old_id)
                if current_zone is not None:
                    entry_time = self.track_entry_times.get(old_id, {}).get(current_zone)
                    dwell_time = current_time - entry_time if entry_time else 0
                    events.append(self._create_base_event("ZONE_EXIT", str(old_id), {
                        "zone_id": current_zone,
                        "dwell_time": dwell_time
                    }))

                logger.info(f"👋 Person Exited Store: ID {old_id}")
                events.append(self._create_base_event("EXIT", str(old_id), {"reason": "lost_track"}))
                
                # Cleanup state
                del self.prev_positions[old_id]
                self.track_zone_map.pop(old_id, None)
                self.track_entry_times.pop(old_id, None)
        
        return events

    def _create_base_event(self, event_type, object_id, metadata):
        return {
            "event_type": event_type,
            "object_id": object_id,
            "store": self.store_id,
            "camera": self.camera_id,
            "metadata": metadata
        }

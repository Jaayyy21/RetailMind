from shapely.geometry import Polygon, Point
import logging

logger = logging.getLogger(__name__)

class ZoneManager:
    def __init__(self):
        self.zones = {} # zone_id -> shapely.geometry.Polygon

    def add_zone(self, zone_id, coordinates):
        """
        coordinates: List of [x, y] pairs
        """
        if len(coordinates) < 3:
            logger.warning(f"Invalid polygon for zone {zone_id}. Need at least 3 points.")
            return
        
        self.zones[zone_id] = Polygon(coordinates)
        logger.info(f"📍 Zone {zone_id} initialized with {len(coordinates)} points.")

    def get_zone_at_point(self, x, y):
        """
        Returns the zone_id containing the point (x, y), or None.
        """
        point = Point(x, y)
        for zone_id, polygon in self.zones.items():
            if polygon.contains(point):
                return zone_id
        return None

    @staticmethod
    def get_centroid(bbox):
        """
        bbox: [x1, y1, x2, y2]
        """
        x_center = (bbox[0] + bbox[2]) / 2
        y_center = (bbox[1] + bbox[3]) / 2
        return x_center, y_center

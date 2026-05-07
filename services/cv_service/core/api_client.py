import requests
import logging
import os

logger = logging.getLogger(__name__)

class APIClient:
    def __init__(self):
        # Point to the specific events endpoint
        self.base_url = os.getenv("BACKEND_API_URL", "http://backend:8000/api/v1/")
        self.events_url = f"{self.base_url}analytics/events/"
        self.timeout = 5

    def post_event(self, event_data):
        """
        Sends an analytics event to the Django Backend via POST.
        """
        try:
            logger.info(f"🚀 Dispatching {event_data['event_type']} for Object {event_data['object_id']}")
            
            # Real POST request
            response = requests.post(
                self.events_url, 
                json=event_data, 
                timeout=self.timeout
            )
            
            if response.status_code == 201:
                logger.debug("Successfully posted event.")
            else:
                logger.error(f"Backend returned {response.status_code}: {response.text}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error posting event: {e}")

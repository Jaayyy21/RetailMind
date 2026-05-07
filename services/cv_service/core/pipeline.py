import logging
import cv2
from ultralytics import YOLO
from .tracker import ObjectTracker
from .event_engine import EventEngine
from .api_client import APIClient

logger = logging.getLogger(__name__)

class VisionPipeline:
    def __init__(self, model_path="yolov8n.pt", source=0):
        self.model = YOLO(model_path)
        self.tracker = ObjectTracker()
        self.event_engine = EventEngine()
        self.api_client = APIClient()
        self.source = source
        self.is_running = False

    def start(self):
        self.is_running = True
        
        if self.source == 'mock':
            logger.info("Starting Vision Pipeline in MOCK mode (simulating events).")
            self._run_mock_loop()
            return

        cap = cv2.VideoCapture(self.source)
        
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {self.source}. Falling back to MOCK mode.")
            self._run_mock_loop()
            return

        logger.info(f"Vision Pipeline started. Source: {self.source}")

        while self.is_running:
            success, frame = cap.read()
            if not success:
                logger.warning("End of video stream or failed to read frame.")
                break

            # 1. Inference & Tracking
            # persist=True enables ByteTrack/BoT-SORT internally in Ultralytics
            results = self.model.track(frame, persist=True, classes=[0], verbose=False) # class 0 is person

            if results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                track_ids = results[0].boxes.id.int().cpu().tolist()
                
                # 2. Event Generation
                events = self.event_engine.process_tracks(track_ids, boxes)
                
                # 3. Dispatch Events
                for event in events:
                    self.api_client.post_event(event)

        cap.release()
        cv2.destroyAllWindows()
        self.is_running = False

    def _run_mock_loop(self):
        import time
        import random
        import numpy as np
        
        # track_id -> {'x': float, 'y': float, 'velocity': float}
        track_states = {}
        max_track_id = 0
        
        logger.info("🎬 Initializing spatial simulation...")
            
        while self.is_running:
            # Variable polling interval for realism
            time.sleep(random.uniform(0.8, 2.5)) 
            
            # Simulate retail traffic patterns:
            # 1. Random bursts (Groups of shoppers)
            if random.random() > 0.90 and len(track_states) < 25:
                group_size = random.randint(2, 5)
                logger.info(f"👨‍👩‍👧‍👦 Group Entry: {group_size} people.")
                for _ in range(group_size):
                    max_track_id += 1
                    track_states[max_track_id] = {
                        'x': random.uniform(0, 30),
                        'y': random.uniform(100, 380),
                        'velocity': random.uniform(10, 35)
                    }

            # 2. Individual arrivals
            elif random.random() > 0.6 and len(track_states) < 30:
                max_track_id += 1
                track_states[max_track_id] = {
                    'x': random.uniform(0, 50),
                    'y': random.uniform(100, 380),
                    'velocity': random.uniform(15, 45)
                }

            # 3. Position updates & natural departures
            to_remove = []
            for tid, state in track_states.items():
                # Some people move faster, some slower (browsing)
                speed_modifier = random.uniform(0.5, 1.5)
                state['x'] += state['velocity'] * speed_modifier
                state['y'] += random.uniform(-8, 8)
                
                # Check for exit (640 width)
                if state['x'] > 640:
                    to_remove.append(tid)

            for tid in to_remove:
                del track_states[tid]

            # 4. Data Formatting & Processing
            track_ids = list(track_states.keys())
            boxes = []
            for tid in track_ids:
                s = track_states[tid]
                # Dynamic box size for more visual variety
                w, h = random.randint(35, 45), random.randint(90, 110)
                boxes.append([s['x']-w/2, s['y']-h/2, s['x']+w/2, s['y']+h/2])
            
            if track_ids or to_remove:
                events = self.event_engine.process_tracks(track_ids, np.array(boxes))
                for event in events:
                    self.api_client.post_event(event)

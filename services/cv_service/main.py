import logging
import os
import sys
from core.pipeline import VisionPipeline

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

def main():
    # Use environment variable for source (0 for webcam, path for video file, 'mock' for simulation)
    video_source = os.getenv("VIDEO_SOURCE", "mock")
    # Try to convert to int if it's a digit (webcam index)
    if video_source.isdigit():
        video_source = int(video_source)

    pipeline = VisionPipeline(source=video_source)
    
    try:
        pipeline.start()
    except KeyboardInterrupt:
        logger.info("CV Service shutting down...")
        pipeline.is_running = False

if __name__ == "__main__":
    main()

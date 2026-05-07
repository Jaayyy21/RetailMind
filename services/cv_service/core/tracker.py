class ObjectTracker:
    """
    Thin wrapper for tracking logic.
    YOLOv8 handles ByteTrack internally when persist=True is passed.
    This class exists to allow future extension with custom trackers
    (e.g., BoT-SORT or DeepSORT) without breaking the pipeline.
    """
    def __init__(self):
        pass

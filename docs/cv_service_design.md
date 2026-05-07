# CV Service Architecture: Intelligence at the Edge

## 1. Modular Design
The CV service is built as a pipeline of independent modules to ensure maintainability and high performance:

- **Core/Inference Engine:** Wraps YOLOv8. Responsible for raw detection.
- **Tracking Engine:** Uses ByteTrack (via Ultralytics) to maintain object identities across frames. This is critical for counting unique entries vs. simple detections.
- **Event Generator:** Processes tracking results to identify meaningful retail events (e.g., crossing a line, entering a zone).
- **Communication Layer:** Handles asynchronous HTTP/WebSocket calls to the Backend API.

## 2. Detection & Tracking Strategy
- **YOLOv8n (Nano):** Chosen for the prototype to ensure high FPS on standard hardware. Can be swapped for `yolov8s` or `yolov8m` in production.
- **ByteTrack:** Preferred over DeepSORT for retail environments because it performs better with occlusions (e.g., people walking behind displays) and is significantly faster.

## 3. Event Generation Pipeline
Instead of flooding the backend with a detection for every frame, the CV service maintains internal state:
1. **Detection:** Person found at coordinates (x,y).
2. **Tracking:** Person assigned `object_id: 42`.
3. **Zone Mapping:** Check if `object_id: 42` is inside `Zone A`.
4. **State Transition:** If person was NOT in `Zone A` in the previous frame but IS now, generate a `ZONE_ENTER` event.

## 4. Scalability
- **Processing Rate:** The pipeline supports frame-skipping (e.g., process every 2nd or 3rd frame) to maintain real-time performance on lower-end CPUs.
- **API Buffering:** Events are queued and sent in small batches or asynchronously to prevent blocking the inference loop.

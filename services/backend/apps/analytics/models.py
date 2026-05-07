from django.db import models
import uuid

class Store(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Zone(models.Model):
    ZONE_TYPES = [
        ('ENTRANCE', 'Entrance'),
        ('EXIT', 'Exit'),
        ('AISLE', 'Aisle'),
        ('CHECKOUT', 'Checkout'),
    ]
    store = models.ForeignKey(Store, related_name='zones', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES)
    coordinates = models.JSONField(help_text="Polygon coordinates for the zone")

    def __str__(self):
        return f"{self.store.name} - {self.name}"

class Camera(models.Model):
    store = models.ForeignKey(Store, related_name='cameras', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    stream_url = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.store.name} - {self.name}"

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('ENTRY', 'Entry'),
        ('EXIT', 'Exit'),
        ('ZONE_ENTER', 'Zone Enter'),
        ('ZONE_EXIT', 'Zone Exit'),
        ('OCCUPANCY_UPDATE', 'Occupancy Update'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True, blank=True)
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.CharField(max_length=100, help_text="Tracking ID from CV service")
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} @ {self.timestamp}"

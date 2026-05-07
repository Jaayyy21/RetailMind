import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import AnalyticsEvent, Store

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    def process_new_event(event_data):
        """
        Persists event to DB and broadcasts to WebSockets.
        Handles mapping zone_id from metadata to the Zone model.
        """
        # Extract zone_id from metadata if present (for ZONE_ENTER/EXIT)
        zone_id = event_data.get('metadata', {}).get('zone_id')
        if zone_id:
            # Note: In Phase 2, we assume zone_id maps to our DB PK
            event_data['zone_id'] = zone_id

        # 1. Create the event
        event = AnalyticsEvent.objects.create(**event_data)
        
        # 2. Broadcast via Django Channels
        channel_layer = get_channel_layer()
        store_id = str(event.store.id)
        group_name = f'analytics_{store_id}'
        
        broadcast_data = {
            'type': 'analytics_message',
            'message': {
                'id': str(event.id),
                'event_type': event.event_type,
                'timestamp': event.timestamp.isoformat(),
                'object_id': event.object_id,
                'zone_id': event.zone_id if event.zone else None,
                'metadata': event.metadata
            }
        }
        
        async_to_sync(channel_layer.group_send)(group_name, broadcast_data)
        
        return event

    @staticmethod
    def get_zone_statistics(store_id):
        """
        Calculates average dwell time and current occupancy per zone.
        """
        from django.db.models import Avg, Count, FloatField
        from django.db.models.functions import Cast
        from django.utils import timezone
        from datetime import timedelta

        last_hour = timezone.now() - timedelta(hours=1)
        
        # We need to cast the JSON dwell_time value to a float for aggregation
        stats = AnalyticsEvent.objects.filter(
            store_id=store_id,
            timestamp__gte=last_hour,
            event_type='ZONE_EXIT'
        ).annotate(
            dwell_float=Cast('metadata__dwell_time', output_field=FloatField())
        ).values('zone__name').annotate(
            avg_dwell=Avg('dwell_float'),
            total_visits=Count('id')
        )
        
        return list(stats)

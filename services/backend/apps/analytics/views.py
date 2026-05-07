from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import AnalyticsEvent, Store, Camera, Zone
from .serializers import AnalyticsEventSerializer, StoreSerializer, CameraSerializer, ZoneSerializer
from .services import AnalyticsService

from rest_framework.decorators import action

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        stats = AnalyticsService.get_zone_statistics(pk)
        return Response(stats)

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

class AnalyticsEventViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use Service Layer to handle logic and broadcasting
        event = AnalyticsService.process_new_event(serializer.validated_data)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            AnalyticsEventSerializer(event).data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

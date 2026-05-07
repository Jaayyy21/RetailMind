from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreViewSet, CameraViewSet, ZoneViewSet, AnalyticsEventViewSet

router = DefaultRouter()
router.register(r'stores', StoreViewSet)
router.register(r'cameras', CameraViewSet)
router.register(r'zones', ZoneViewSet)
router.register(r'events', AnalyticsEventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

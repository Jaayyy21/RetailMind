from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/analytics/(?P<store_id>\w+)/$', consumers.AnalyticsConsumer.as_asgi()),
]

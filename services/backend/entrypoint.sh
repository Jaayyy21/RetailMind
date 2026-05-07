#!/bin/bash

# Wait for postgres to be ready
echo "Waiting for postgres..."
while ! python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.connect(('db', 5432))" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL started"

python manage.py makemigrations
python manage.py migrate

# Create initial data
python manage.py shell -c "
from apps.analytics.models import Store, Camera, Zone
if not Store.objects.filter(id=1).exists():
    store = Store.objects.create(name='Flagship Store')
    Camera.objects.create(store=store, name='Main Entrance', stream_url='mock')
    # Phase 2: Seed Zones
    Zone.objects.create(id=1, store=store, name='Entrance', zone_type='ENTRANCE', coordinates=[[0, 0], [200, 0], [200, 480], [0, 480]])
    Zone.objects.create(id=2, store=store, name='Main Aisle', zone_type='AISLE', coordinates=[[200, 0], [440, 0], [440, 480], [200, 480]])
    Zone.objects.create(id=3, store=store, name='Checkout', zone_type='CHECKOUT', coordinates=[[440, 0], [640, 0], [640, 480], [440, 480]])
    print('Initial Store, Camera, and Zones created.')
"

exec python manage.py runserver 0.0.0.0:8000

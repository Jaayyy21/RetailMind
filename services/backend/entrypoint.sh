#!/bin/bash
set -e

# Wait for postgres to be ready
echo "📡 Waiting for PostgreSQL to be ready on db:5432..."
until python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.connect(('db', 5432))" 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "✅ PostgreSQL started"

# Ensure migrations are generated for our local apps
echo "🔨 Generating migrations..."
# Run general makemigrations which should pick up all registered apps in INSTALLED_APPS
python manage.py makemigrations --noinput

echo "🚀 Applying migrations..."
python manage.py migrate --noinput

# Create initial data
echo "🌱 Seeding initial data..."
python manage.py shell -c "
from apps.analytics.models import Store, Camera, Zone
try:
    if not Store.objects.filter(id=1).exists():
        store = Store.objects.create(id=1, name='Flagship Store')
        Camera.objects.create(id=1, store=store, name='Main Entrance', stream_url='mock')
        # Seed Zones
        Zone.objects.create(id=1, store=store, name='Entrance', zone_type='ENTRANCE', coordinates=[[0, 0], [200, 0], [200, 480], [0, 480]])
        Zone.objects.create(id=2, store=store, name='Main Aisle', zone_type='AISLE', coordinates=[[200, 0], [440, 0], [440, 480], [200, 480]])
        Zone.objects.create(id=3, store=store, name='Checkout', zone_type='CHECKOUT', coordinates=[[440, 0], [640, 0], [640, 480], [440, 480]])
        print('✅ Initial Store, Camera, and Zones created.')
    else:
        print('⏩ Store already exists, skipping seed.')
except Exception as e:
    print(f'❌ Seeding error: {e}')
"

echo "🏁 Starting Django Development Server..."
exec python manage.py runserver 0.0.0.0:8000

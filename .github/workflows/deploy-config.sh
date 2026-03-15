#!/bin/bash

# Скрипт деплоя на VPS
# Вызывается из GitHub Actions

set -e

SECRET_KEY=$1
DB_PASSWORD=$2
ALLOWED_HOSTS=$3

echo "🚀 Начинаю деплой AutoSale..."

# Создаем директорию приложения
sudo mkdir -p /opt/autosale
cd /opt/autosale

# Копируем файлы из временной директории
sudo cp /tmp/docker-compose.prod.yml ./docker-compose.yml
sudo cp /tmp/Dockerfile ./Dockerfile
sudo cp /tmp/requirements.txt ./requirements.txt
sudo cp -r /tmp/api ./api
sudo cp -r /tmp/config ./config
sudo cp -r /tmp/frontend ./frontend
sudo cp /tmp/manage.py ./manage.py

# Создаем .env файл
sudo tee .env > /dev/null <<EOF
SECRET_KEY=${SECRET_KEY}
DB_PASSWORD=${DB_PASSWORD}
ALLOWED_HOSTS=${ALLOWED_HOSTS:-localhost,127.0.0.1}
DB_NAME=autosale
DB_USER=postgres
DB_HOST=db
DB_PORT=5432
DEBUG=False
MEDIA_URL=/media/
MEDIA_ROOT=/app/media
EOF

# Останавливаем старые контейнеры
echo "📦 Остановка старых контейнеров..."
sudo docker compose down || true

# Собираем и запускаем контейнеры
echo "🔨 Сборка и запуск контейнеров..."
sudo docker compose build --no-cache
sudo docker compose up -d

# Ждем пока БД запустится
echo "⏳ Ожидание запуска БД..."
sleep 10

# Применяем миграции
echo "📋 Применение миграций..."
sudo docker compose exec -T web python manage.py migrate

# Собираем статику
echo "📁 Сборка статики..."
sudo docker compose exec -T web python manage.py collectstatic --noinput

# Создаем суперпользователя если нет
echo "👤 Проверка суперпользователя..."
sudo docker compose exec -T web python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Суперпользователь создан: admin / admin123')
else:
    print('Суперпользователь уже существует')
"

# Очищаем временные файлы
echo "🧹 Очистка..."
sudo rm -rf /tmp/deploy.sh /tmp/docker-compose.prod.yml /tmp/Dockerfile /tmp/requirements.txt /tmp/api /tmp/config /tmp/frontend /tmp/manage.py

echo "✅ Деплой завершен!"
echo ""
echo "📍 Сайт доступен: http://${ALLOWED_HOSTS:-localhost}"
echo "📍 Admin: http://${ALLOWED_HOSTS:-localhost}/admin/"
echo "📍 Логин/пароль админа: admin / admin123"
echo ""
echo "⚠️  Смени пароль админа после первого входа!"

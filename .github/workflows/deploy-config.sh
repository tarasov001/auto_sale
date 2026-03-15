#!/bin/bash

# Скрипт деплоя на VPS
# Вызывается из GitHub Actions

set -e

SECRET_KEY=$1
DB_PASSWORD=$2
ALLOWED_HOSTS=$3

echo "🚀 Начинаю деплой AutoSale..."

# ============================================
# УСТАНОВКА DOCKER (если не установлен)
# ============================================
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker не найден. Устанавливаем..."
    
    # Обновляем пакеты
    apt update
    
    # Устанавливаем зависимости
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Добавляем GPG ключ Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Добавляем репозиторий Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Устанавливаем Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    
    # Устанавливаем Docker Compose Plugin
    apt install -y docker-compose-plugin
    
    # Проверяем установку
    docker --version
    docker compose version
    
    echo "✅ Docker установлен!"
else
    echo "✅ Docker уже установлен"
    docker --version
fi

# ============================================
# НАСТРОЙКА DOCKER
# ============================================
# Убедимся, что Docker запущен
systemctl enable docker
systemctl start docker

echo "🔧 Настройка Docker завершена..."

# ============================================
# ДЕПЛОЙ ПРИЛОЖЕНИЯ
# ============================================

# Создаем директорию приложения
mkdir -p /opt/autosale
cd /opt/autosale

# Копируем файлы из временной директории
cp /tmp/docker-compose.prod.yml ./docker-compose.yml
cp /tmp/Dockerfile ./Dockerfile
cp /tmp/requirements.txt ./requirements.txt
cp /tmp/nginx.conf ./nginx.conf
cp -r /tmp/api ./api
cp -r /tmp/config ./config
cp -r /tmp/frontend ./frontend
cp /tmp/manage.py ./manage.py

# Создаем .env файл
tee .env > /dev/null <<EOF
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
docker compose down || true

# Собираем и запускаем контейнеры
echo "🔨 Сборка и запуск контейнеров..."
docker compose build --no-cache
docker compose up -d

# Ждем пока БД запустится
echo "⏳ Ожидание запуска БД..."
sleep 15

# Применяем миграции
echo "📋 Применение миграций..."
docker compose exec -T web python manage.py migrate

# Собираем статику
echo "📁 Сборка статики..."
docker compose exec -T web python manage.py collectstatic --noinput

# Создаем суперпользователя если нет
echo "👤 Проверка суперпользователя..."
docker compose exec -T web python manage.py shell -c "
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
rm -rf /tmp/deploy.sh /tmp/docker-compose.prod.yml /tmp/Dockerfile /tmp/requirements.txt /tmp/nginx.conf /tmp/api /tmp/config /tmp/frontend /tmp/manage.py

echo "✅ Деплой завершен!"
echo ""
echo "📍 Сайт доступен: http://${ALLOWED_HOSTS:-localhost}"
echo "📍 Admin: http://${ALLOWED_HOSTS:-localhost}/admin/"
echo "📍 Логин/пароль админа: admin / admin123"
echo ""
echo "⚠️  Смени пароль админа после первого входа!"

#!/bin/bash

# Скрипт деплоя на VPS
# Использование: ./deploy.sh

set -e

echo "🚀 Деплой AutoSale на VPS"

# 1. Копируем файлы на сервер
echo "📦 Копирование файлов..."
scp -r . root@YOUR_SERVER_IP:/opt/autosale/

# 2. Подключаемся к серверу и разворачиваем
echo "🔧 Развертывание на сервере..."
ssh root@YOUR_SERVER_IP << 'EOF'
    cd /opt/autosale

    # Копируем production конфиг
    cp .env.prod.example .env
    echo "⚠️ Не забудьте заполнить .env файлик!"

    # Останавливаем старые контейнеры
    docker-compose -f docker-compose.prod.yml down || true

    # Собираем и запускаем
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d

    # Применяем миграции
    docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate

    # Собираем статику
    docker-compose -f docker-compose.prod.yml run --rm web python manage.py collectstatic --noinput

    echo "✅ Деплой завершен!"
EOF

echo "📝 Не забудьте:"
echo "   1. Заполнить .env на сервере"
echo "   2. Настроить SSL через certbot"
echo "   3. Настроить домен на ваш IP"

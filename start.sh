#!/bin/bash

# Скрипт быстрого старта для локальной разработки

set -e

echo "🚀 Запуск AutoSale локально"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop."
    exit 1
fi

# Запуск через Docker Compose
echo "📦 Запуск контейнеров..."
docker-compose up --build -d

echo "⏳ Ожидание запуска БД..."
sleep 5

echo "🔧 Применение миграций..."
docker-compose exec -T web python manage.py migrate

echo "✅ Готово!"
echo ""
echo "📍 Сайт доступен: http://localhost:8000"
echo "📍 API: http://localhost:8000/api/"
echo "📍 Admin: http://localhost:8000/admin/"
echo ""
echo "Для остановки: docker-compose down"

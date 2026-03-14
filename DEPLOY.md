# Инструкция по деплою на VPS

## Требования
- VPS с Ubuntu 20.04+ (рекомендуется DigitalOcean или Hetzner)
- Домен, направленный на IP сервера
- Docker и Docker Compose

## 1. Подготовка сервера

```bash
# Подключение к серверу
ssh root@your-server-ip

# Обновление системы
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y
```

## 2. Загрузка проекта

```bash
# Создание директории
mkdir -p /opt/autosale
cd /opt/autosale

# Загрузка файлов (на локальной машине)
# scp -r . root@your-server-ip:/opt/autosale/
```

## 3. Настройка окружения

```bash
# Копирование примера
cp .env.prod.example .env

# Редактирование (заполните своими значениями)
nano .env
```

**Важные параметры:**
- `SECRET_KEY` — сгенерируйте: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DB_PASSWORD` — надёжный пароль для БД
- `ALLOWED_HOSTS` — ваш домен

## 4. Запуск проекта

```bash
# Запуск контейнеров
docker-compose -f docker-compose.prod.yml up -d

# Применение миграций
docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate

# Сборка статики
docker-compose -f docker-compose.prod.yml run --rm web python manage.py collectstatic --noinput

# Создание суперпользователя
docker-compose -f docker-compose.prod.yml run --rm web python manage.py createsuperuser
```

## 5. Настройка SSL (рекомендуется)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение сертификата
certbot --nginx -d your-domain.com

# Автоматическое обновление
certbot renew --dry-run
```

## 6. Мониторинг

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Перезапуск
docker-compose -f docker-compose.prod.yml restart
```

## Обновление проекта

```bash
cd /opt/autosale

# Обновление файлов (git или scp)
git pull

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Миграции
docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate
```

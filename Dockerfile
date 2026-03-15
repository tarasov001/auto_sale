FROM python:3.12-slim

WORKDIR /app

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    gnupg \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь фронтенд
COPY frontend/ ./frontend/

# Собираем фронтенд
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Копируем остальной код
WORKDIR /app
COPY . .

# Создаём staticfiles и копируем React сборку
RUN mkdir -p /app/staticfiles
RUN cp -r /app/frontend/build/* /app/staticfiles/

# Сборка Django статики (admin, DRF)
RUN python manage.py collectstatic --noinput

# Создаём media директорию
RUN mkdir -p /app/media

# Копируем nginx конфиг и убираем дефолтный сайт
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Открываем порты
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Запускаем nginx + gunicorn через supervisord
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

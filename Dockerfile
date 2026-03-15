FROM python:3.12-slim

WORKDIR /app

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    gnupg \
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

EXPOSE 8000

# Healthcheck для проверки работоспособности
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import socket; s = socket.socket(); s.connect(('localhost', 8000)); s.close()" || exit 1

CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 config.wsgi:application"]

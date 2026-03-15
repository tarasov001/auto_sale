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

# Копируем React сборку в staticfiles
RUN cp -r /app/frontend/build/* /app/staticfiles/

# Сборка Django статики (admin, DRF)
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "config.wsgi:application"]

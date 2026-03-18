# AutoSale - История разработки и решения проблем

## 📋 Описание проекта

Платформа для бесплатной продажи автомобилей.

**Стек:**
- Backend: Django + Django REST Framework
- Frontend: React + Bootstrap
- Database: PostgreSQL
- Deployment: Docker + GitHub Actions + VPS

---

## 🚀 Автоматический деплой

При каждом push в ветку `main`:
1. GitHub Actions собирает Docker образ
2. Копирует файлы на VPS
3. Применяет миграции
4. Запускает контейнеры

**Workflow:** `.github/workflows/deploy.yml`

---

## 🔧 Решённые проблемы

### 1. CORS и доступ с любых устройств

**Проблема:** Авторизация и API работали только с одного устройства.

**Решение:**
- `ALLOWED_HOSTS = '*'` — разрешили все хосты
- `CORS_ALLOW_ALL_ORIGINS = True` — включили CORS
- `CSRF_TRUSTED_ORIGINS` — добавили IP сервера
- `API_URL = '/api'` — относительный путь вместо localhost
- `withCredentials: true` — для CORS запросов
- Добавили CORS headers в nginx.conf

**Файлы:**
- `config/settings.py` — CORS и CSRF настройки
- `frontend/src/api.js` — относительный API_URL
- `nginx.conf` — CORS headers и проксирование /api

---

### 2. Nginx не проксировал запросы на Django

**Проблема:** 500 ошибка, nginx показывал дефолтную страницу.

**Решение:**
- Убрали `:ro` из volumes в docker-compose.prod.yml
- Добавили `index index.html` в nginx.conf
- Настроили `try_files $uri $uri/ /index.html`
- Добавили location для `/static/`
- Убрали дефолтный сайт nginx (`rm -f /etc/nginx/sites-enabled/default`)

**Файлы:**
- `nginx.conf` — правильная конфигурация
- `docker-compose.prod.yml` — volumes без :ro

---

### 3. React сборка не копировалась в staticfiles

**Проблема:** Пустая папка staticfiles, нет JS/CSS файлов.

**Решение:**
- Копируем весь `frontend/` перед сборкой
- `npm install` → `npm run build`
- Копируем `frontend/build/*` в `/app/staticfiles/`
- Добавили `mkdir -p /app/staticfiles` перед копированием

**Файлы:**
- `Dockerfile` — правильный порядок копирования

---

### 4. Docker образ не собирался

**Проблема:** `apt-get install supervisor` не работал без update.

**Решение:**
- Добавили `apt-get update` перед установкой пакетов

**Файлы:**
- `Dockerfile` — `RUN apt-get update && apt-get install -y supervisor`

---

### 5. Nginx показывал дефолтную страницу

**Проблема:** Конфликт с дефолтным сайтом nginx.

**Решение:**
- `RUN rm -f /etc/nginx/sites-enabled/default` в Dockerfile

**Файлы:**
- `Dockerfile` — удаление дефолтного сайта

---

### 6. Порт 80 занят старым контейнером

**Проблема:** При деплое ошибка "Bind for 0.0.0.0:80 failed: port is already allocated"

**Решение:**
- `docker compose down --remove-orphans` — удаляет старые контейнеры
- Обновлён docker-compose.prod.yml — убрали отдельный nginx сервис

**Файлы:**
- `docker-compose.prod.yml` — только web + db (nginx внутри web)

---

### 7. Фото не загружались

**Проблема:** Ошибка 500 при загрузке фото, car_id = 'undefined'.

**Решение:**
- Добавили `id` в `CarCreateSerializer`
- Изменили форму на `FormData` с `multipart/form-data`
- Добавили `parser_classes = [MultiPartParser, FormParser]` в CarViewSet
- Обновление с фото через FormData

**Файлы:**
- `api/serializers.py` — id в serializer, update метод
- `api/views.py` — parser_classes
- `frontend/src/pages/AddCar.js` — FormData
- `frontend/src/pages/EditCar.js` — FormData для обновления

---

### 8. Галерея фото на странице автомобиля

**Проблема:** Нет возможности листать фото.

**Решение:**
- Кнопки ‹ и › для листания
- Миниатюры под основным фото
- Счётчик (1 / 5)
- Циклическая прокрутка

**Файлы:**
- `frontend/src/pages/CarDetail.js` — галерея с листанием

---

## 📁 Структура проекта

```
autosale/
├── .github/workflows/
│   ├── deploy.yml          # GitHub Actions workflow
│   └── deploy-config.sh    # Скрипт деплоя на сервере
├── config/
│   ├── settings.py         # Настройки Django (CORS, CSRF)
│   ├── urls.py
│   └── wsgi.py
├── api/
│   ├── models.py           # Car, CarImage
│   ├── serializers.py      # CarSerializer, CarCreateSerializer
│   ├── views.py            # CarViewSet, CarImageViewSet
│   ├── urls.py
│   └── admin.py
├── frontend/src/
│   ├── api.js              # API клиент (относительный URL)
│   ├── App.js
│   └── pages/
│       ├── Home.js         # Главная + фильтры
│       ├── CarDetail.js    # Страница авто + галерея
│       ├── AddCar.js       # Добавление авто + фото
│       ├── EditCar.js      # Редактирование
│       ├── Cabinet.js      # Личный кабинет
│       ├── Login.js        # Вход
│       └── Register.js     # Регистрация
├── Dockerfile              # Полный образ с nginx + gunicorn
├── supervisord.conf        # Запуск nginx + gunicorn
├── nginx.conf              # Конфигурация nginx (CORS headers)
├── docker-compose.prod.yml # Production (web + db)
├── docker-compose.yml      # Local development
└── requirements.txt
```

---

## 🔑 Ключевые настройки

### config/settings.py
```python
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    'http://157.22.175.247',
    'http://localhost',
    'http://127.0.0.1',
]
```

### frontend/src/api.js
```javascript
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

### nginx.conf
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    
    # CORS headers
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

---

## 🎯 Деплой на новый сервер

1. **На GitHub:** Добавь secrets (SSH_PRIVATE_KEY, VPS_HOST, VPS_USER, SECRET_KEY, DB_PASSWORD, ALLOWED_HOSTS)

2. **Запуш в main:**
   ```bash
   git push origin main
   ```

3. **GitHub Actions:** Автоматически задеплоит

4. **Сайт доступен:** http://YOUR_SERVER_IP/

---

## 📝 Команды для диагностики

```bash
# Подключение к серверу
ssh root@YOUR_SERVER_IP
cd /opt/autosale

# Логи
docker compose logs web --tail=100
docker compose exec web cat /var/log/nginx.log
docker compose exec web cat /var/log/gunicorn.log

# Проверка API
docker compose exec web curl http://127.0.0.1:8000/api/cars/
docker compose exec web curl http://localhost/api/cars/

# Перезапуск
docker compose restart web

# Полная пересборка
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## ✅ Чек-лист перед деплоем

- [ ] Все secrets добавлены в GitHub
- [ ] ALLOWED_HOSTS='*' в settings.py
- [ ] CORS включён
- [ ] API_URL относительный ('/api')
- [ ] nginx.conf с CORS headers
- [ ] supervisord.conf с ALLOWED_HOSTS в environment

---

**Дата:** 15 марта 2026
**Версия:** 1.0.0
**Статус:** ✅ Работает!

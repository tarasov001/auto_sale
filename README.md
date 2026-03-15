# AutoSale

Платформа для бесплатной продажи автомобилей.

## Стек технологий

- **Backend:** Django + Django REST Framework
- **Frontend:** React + Bootstrap
- **Database:** PostgreSQL
- **Deployment:** Docker + VPS + GitHub Actions

## Быстрый старт (локальная разработка)

### 1. Запуск через Docker Compose

```bash
docker-compose up --build
```

Сервер будет доступен по адресу: http://localhost:8000

### 2. API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/token/` | Получить JWT токен |
| POST | `/api/users/` | Регистрация пользователя |
| GET | `/api/cars/` | Список всех автомобилей |
| GET | `/api/cars/{id}/` | Детали автомобиля |
| POST | `/api/cars/` | Создать объявление (требуется авторизация) |
| GET | `/api/cars/my/` | Мои объявления (требуется авторизация) |
| PUT/PATCH | `/api/cars/{id}/` | Редактировать объявление |
| DELETE | `/api/cars/{id}/` | Удалить объявление |

### 3. Параметры фильтрации

При запросе `/api/cars/` можно использовать параметры:
- `brand` — марка автомобиля
- `model` — модель
- `min_price`, `max_price` — диапазон цен
- `min_year`, `max_year` — диапазон годов

Пример: `/api/cars/?brand=BMW&max_price=50000&min_year=2018`

## Структура проекта

```
autosale/
├── .github/workflows/    # GitHub Actions для деплоя
├── config/               # Настройки Django
├── api/                  # API приложение
│   ├── models.py         # Модели данных
│   ├── serializers.py
│   ├── views.py          # API views
│   └── urls.py           # Маршруты API
├── frontend/             # React приложение
├── docker-compose.yml    # Local development
├── docker-compose.prod.yml  # Production
├── Dockerfile
├── nginx.conf            # Nginx конфигурация
└── requirements.txt
```

---

## 🚀 Деплой на VPS (автоматический)

### Настройка GitHub Secrets

1. Перейди в репозиторий на GitHub: **Settings → Secrets and variables → Actions**

2. Добавь следующие секреты:

| Секрет | Описание | Пример |
|--------|----------|--------|
| `SSH_PRIVATE_KEY` | SSH ключ для доступа к серверу | Содержимое `~/.ssh/github_actions` |
| `VPS_HOST` | IP адрес сервера | `123.45.67.89` |
| `VPS_USER` | Пользователь сервера | `root` |
| `SECRET_KEY` | Секретный ключ Django | `django-insecure-...` |
| `DB_PASSWORD` | Пароль для БД | `secure_password_123` |
| `ALLOWED_HOSTS` | Разрешённые хосты | `*` или IP сервера |

**Подробная инструкция:** см. [GITHUB_SECRETS.md](GITHUB_SECRETS.md)

### Автоматический деплой

После настройки секретов, при каждом push в ветку `main`:

```
Push → GitHub Actions → Деплой на VPS → Сайт обновлён!
```

### Ручной деплой (если нужно)

```bash
# Подключись к серверу
ssh root@YOUR_SERVER_IP

# Перейди в директорию проекта
cd /opt/autosale

# Перезапусти контейнеры
sudo docker compose down
sudo docker compose up -d

# Посмотри логи
sudo docker compose logs -f
```

---

## Дальнейшие шаги

1. Настройка SSL (HTTPS) через Certbot
2. Добавление уведомлений о деплое в Telegram
3. Мониторинг и логирование

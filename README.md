# AutoSale

Платформа для бесплатной продажи автомобилей.

## Стек технологий

- **Backend:** Django + Django REST Framework
- **Frontend:** React + Bootstrap
- **Database:** PostgreSQL
- **Deployment:** Docker + VPS

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
| POST | `/api/car-images/` | Загрузить фото (требуется авторизация) |

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
├── config/          # Настройки Django
├── api/             # API приложение
│   ├── models.py    # Модели данных
│   ├── serializers.py
│   ├── views.py     # API views
│   └── urls.py      # Маршруты API
├── frontend/        # React приложение (будет создано)
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## Дальнейшие шаги

1. Создание React фронтенда
2. Настройка деплоя на VPS
3. Добавление дополнительных функций

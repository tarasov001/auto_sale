# Настройка GitHub Secrets для деплоя

## В репозитории на GitHub перейди в:
**Settings → Secrets and variables → Actions → New repository secret**

## Добавь следующие секреты:

### 1. SSH_PRIVATE_KEY
Приватный SSH ключ для доступа к серверу.

**Как создать:**
```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Копируем публичный ключ на сервер
ssh-copy-id -i ~/.ssh/github_actions.pub root@YOUR_SERVER_IP

# Копируем приватный ключ для GitHub
cat ~/.ssh/github_actions | pbcopy  # Mac
# или
cat ~/.ssh/github_actions  # Linux/Windows
```

Вставь содержимое приватного ключа в секрет.

---

### 2. VPS_HOST
IP адрес твоего сервера (например: `123.45.67.89`)

---

### 3. VPS_USER
Пользователь для подключения (обычно `root` или `ubuntu`)

---

### 4. SECRET_KEY
Секретный ключ Django. Сгенерируй новый:

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### 5. DB_PASSWORD
Пароль для базы данных. Придумай надёжный пароль (минимум 16 символов).

---

### 6. ALLOWED_HOSTS
Список разрешённых хостов. Для начала:
```
*
```

Или конкретно IP сервера:
```
YOUR_SERVER_IP
```

---

## После настройки секретов:

1. Запуш изменения в main:
```bash
git add .
git commit -m "Add GitHub Actions for auto-deploy"
git push origin main
```

2. Перейди на GitHub в Actions → "Deploy to VPS" → посмотри лог деплоя

3. После успешного деплоя сайт будет доступен по http://YOUR_SERVER_IP/

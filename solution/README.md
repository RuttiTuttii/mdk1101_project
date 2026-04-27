# ShoeStore — Решение задания MDK1101

## Структура проекта

```
solution/
├── backend/          # Python FastAPI backend
├── web/              # Web-клиент (React + Vite + shadcn/ui)
├── desktop/          # Desktop-клиент (Tauri + React + shadcn/ui)
└── shared/           # Общие UI компоненты (legacy)
```

## Технологии

### Frontend (web & desktop)
- **React 19** с TypeScript
- **Vite** — сборка и dev-сервер
- **Tailwind CSS v4** — стилизация
- **shadcn/ui** — UI компоненты (Button, Card, Input, Select, Badge, Switch, Table, Dialog, Tabs, Tooltip, DropdownMenu, Avatar, etc.)
- **Lucide React** — иконки
- **Radix UI** — примитивы для компонентов

### Desktop
- **Tauri 2** — оболочка для desktop-приложения
- Кастомный title bar с кнопками управления окном
- Тёмная/светлая тема

### Backend
- **FastAPI** — REST API
- **JWT** — авторизация
- **In-memory store** — хранение данных

## Запуск

### Backend

```bash
cd solution/backend
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy alembic pydantic python-jose[cryptography] passlib[bcrypt] pandas openpyxl
python run.py
```

API будет доступно на `http://127.0.0.1:8000`.

### Web

```bash
cd solution/web
npm install
npm run dev
```

Vite поднимется на `http://localhost:5173` (или другом порту).

### Desktop (Tauri)

```bash
cd solution/desktop
npm install
npm run tauri dev
```

Для сборки desktop-приложения требуется установленный Rust и Tauri CLI.

## Функциональность

### Каталог
- ✅ Карточки товаров с изображениями, ценами, скидками
- ✅ Поиск по описанию
- ✅ Фильтрация по производителю
- ✅ Фильтр по максимальной цене
- ✅ Переключатели "только со скидкой" и "только в наличии"
- ✅ Сортировка (по названию, поставщику, цене)
- ✅ Режимы отображения: сетка и список
- ✅ Статистика каталога (товаров, со скидкой, в наличии, брендов)

### Авторизация
- ✅ JWT вход по логину/паролю
- ✅ Регистрация новых пользователей
- ✅ Сохранение сессии в localStorage
- ✅ Роли: admin, manager, client

### Заказы
- ✅ Создание заказа из каталога
- ✅ Просмотр истории заказов
- ✅ Автоматический заказ после входа (если был отложен)

### Карточка товара
- ✅ Полная информация о товаре
- ✅ Изображение с placeholder при ошибке загрузки
- ✅ Цены до и после скидки
- ✅ Кнопка заказа

### UI/UX
- ✅ Адаптивный дизайн (мобильные, планшет, десктоп)
- ✅ Тёмная и светлая тема
- ✅ Анимации при загрузке карточек
- ✅ Skeleton-загрузчики
- ✅ Всплывающие подсказки (Tooltip)
- ✅ Выпадающее меню пользователя
- ✅ Toast-уведомления

## Дизайн

- **Цветовая схема**: Emerald/Teal акценты на белом/чёрном фоне
- **Шрифт**: Inter
- **Скругления**: xl (0.75rem)
- **Тени**: мягкие, многослойные
- **Градиенты**: использованы для hero-секции и фонов карточек

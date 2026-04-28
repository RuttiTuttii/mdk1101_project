<p align="center">
<svg width="128" height="128" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="20" y="20" width="160" height="160" fill="#7FFF00" stroke="black" stroke-width="8"/>
<path d="M60 140H140V120H150V100H130V110H90V80H60V140Z" fill="black"/>
<rect x="70" y="140" width="10" height="10" fill="black"/><rect x="90" y="140" width="10" height="10" fill="black"/><rect x="110" y="140" width="10" height="10" fill="black"/><rect x="130" y="140" width="10" height="10" fill="black"/>
<rect x="70" y="130" width="60" height="5" fill="#00FA9A"/>
<rect x="80" y="90" width="20" height="4" fill="#7FFF00"/><rect x="80" y="100" width="20" height="4" fill="#7FFF00"/>
</svg>
</p>

# shoestore - решение mdk1101

это полнофункциональный стек, включающий бэкенд на fastapi, веб-интерфейс на react и десктопное приложение на базе tauri. проект структурирован, типизирован и разделен на модули.

## структура проекта

проект организован по логическим блокам:

- **solution/backend** - серверная часть на fastapi. отвечает за работу с базой данных (sqlite), авторизацию и выдачу данных.
- **solution/web** - веб-приложение на react 19. реализует каталог, фильтрацию и личный кабинет пользователя.
- **solution/desktop** - десктопная версия приложения, построенная на tauri с использованием общей фронтенд-логики.
- **solution/shared** - общее ядро фронтенда: страницы, компоненты и api, используемые как в вебе, так и в десктопе.
- **solution/database** - sql-схемы, скрипты инициализации и erd-диаграммы базы данных.
- **scratch** - вспомогательные скрипты для анализа и рефакторинга.

## как запустить

### 1. бэкенд

перейдите в папку backend, создайте виртуальное окружение и выполните запуск:

```bash
cd solution/backend
python -m venv .venv

# windows
.venv\\Scripts\\activate
# linux/mac
source .venv/bin/activate

pip install -r requirements.txt
python run.py
```

api будет доступно по адресу `http://127.0.0.1:8000`.

### 2. веб

требуется установленный node.js актуальной версии:

```bash
cd solution/web
npm install
npm run dev
```

### 3. десктоп

при наличии установленного rust можно запустить tauri:

```bash
cd solution/desktop
npm install
npm run tauri dev
```

## технологии

### бэкенд

- **python 3.11+**
- **fastapi** - создание быстрых и типизированных api.
- **sqlalchemy** - работа с базой данных через orm.
- **python-jose** - обработка jwt-токенов.
- **sqlite** - файловая база данных.

### фронтенд (веб и десктоп)

- **react 19** + **typescript** - строгая типизация.
- **vite** - инструмент сборки и разработки.
- **tailwind css** - утилитарная система стилей.
- **shadcn/ui** - библиотека компонентов.
- **framer motion** - анимации интерфейса.

## функциональность

- **каталог товаров**: поиск и фильтрация по бренду, цене и наличию.
- **корзина**: при попытке оформления заказа без авторизации выбранные товары сохраняются и доступны после входа.
- **авторизация**: регистрация и вход с хранением сессии в localstorage.
- **роли пользователей**: клиенты, менеджеры и администраторы; администраторы управляют статусами заказов.
- **архитектура фронтенда**: разделение на слои (api, types, lib, components, pages).
- **интерфейс**: поддержка светлой и темной темы, skeleton-загрузки, плавные анимации.

## стиль

код сопровождается комментариями на русском языке в нижнем регистре. пояснения даются простым и понятным языком, с акцентом на читаемость и поддержку.

## тестовые аккаунты

| роль | фио | логин | пароль |
| :--- | :--- | :--- | :--- |
| админ | никифорова весения николаевна | [94d5ous@gmail.com](mailto:94d5ous@gmail.com) | uzWC67 |
| админ | сазонов руслан германович | [uth4iz@mail.com](mailto:uth4iz@mail.com) | 2L6KZG |
| админ | одинцов серафим артёмович | [yzls62@outlook.com](mailto:yzls62@outlook.com) | JIFRCZ |
| менеджер | степанов михаил артёмович | [1diph5e@tutanota.com](mailto:1diph5e@tutanota.com) | 8ntwUp |
| менеджер | ворсин петр евгеньевич | [tjde7c@yahoo.com](mailto:tjde7c@yahoo.com) | YOyhfr |
| менеджер | старикова елена павловна | [wpmrc3do@tutanota.com](mailto:wpmrc3do@tutanota.com) | RSbvHv |
| клиент | михайлюк анна вячеславовна | [5d4zbu@tutanota.com](mailto:5d4zbu@tutanota.com) | rwVDh9 |
| клиент | ситдикова елена анатольевна | [ptec8ym@yahoo.com](mailto:ptec8ym@yahoo.com) | LdNyos |
| клиент | ворсин петр евгеньевич | [1qz4kw@mail.com](mailto:1qz4kw@mail.com) | gynQMT |
| клиент | старикова елена павловна | [4np6se@mail.com](mailto:4np6se@mail.com) | AtnDjr |

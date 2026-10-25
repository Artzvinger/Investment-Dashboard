# Investment Dashboard (SpecFlow)

Веб-приложение для учёта инвестиционного портфеля акций Московской биржи (MOEX): портфель, живые котировки, прибыль/убыток и детали по каждой позиции.

🔗 Репозиторий: https://github.com/Artzvinger/Investment-Dashboard

---

## Возможности

- 📈 Портфель акций с живыми котировками MOEX.
- 🔎 Поиск по тикеру/названию, фильтры (прибыльные/убыточные), сортировка и пагинация.
- 💰 Общая прибыль/убыток портфеля в рублях и процентах.
- 📊 Детали по каждой акции в модальном окне: цена покупки, текущая цена, вложено, стоимость позиции, доля в портфеле, дневное изменение, дата покупки.
- ➕ Добавление акции по тикеру с автоподстановкой названия и цены с MOEX.
- 🗑 Удаление акции со стилизованным подтверждением.
- 🔄 Батч-запрос котировок + серверный кэш (10 с) и фоновое обновление цен в БД (30 с).
- 🌙 Тёмная тема и адаптивная вёрстка.

## Стек

| Слой | Технологии |
|---|---|
| Клиент | React 19, TypeScript, Vite 8, React Router 8, TanStack Query 5, axios, react-hook-form, zod |
| Сервер | Node.js 22, Express 5, Prisma 7, TypeScript, tsx |
| База данных | PostgreSQL 16 |
| Инфраструктура | Docker, Docker Compose |

## Структура проекта

```
.
├── client/                       # React SPA
│   ├── src/
│   │   ├── app/                  # точка входа, провайдеры, layout
│   │   ├── entities/             # stock, macro
│   │   ├── pages/                # Portfolio, Stocks, Bonds
│   │   ├── shared/               # api, ui, lib, hooks
│   │   ├── widgets/              # AssetList, Sidebar
│   │   └── styles/
│   └── Dockerfile
├── server/                       # Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── api/                  # routes, services, dto, middleware
│   │   ├── config/
│   │   ├── jobs/                 # refresh-quotes.job.ts
│   │   ├── lib/
│   │   └── utils/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Быстрый старт (Docker)

**Требования:** Docker Desktop с Docker Compose v2.

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Artzvinger/Investment-Dashboard.git
cd Investment-Dashboard
```

### 2. Создать `.env`

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

При необходимости поменяй `POSTGRES_PASSWORD` и соответствующий `DATABASE_URL`.

### 3. Поднять контейнеры

```bash
docker compose up -d --build
```

### 4. Проверить

- Приложение: http://localhost:5173
- API health: http://localhost:3000/api/health

### 5. Создать dev-пользователя

Приложение пока без авторизации и использует `DEV_USER_ID = 1`. На чистой БД нужно создать пользователя с `id = 1`, иначе добавление акции вернёт «Пользователь не найден».

```bash
docker compose exec postgres psql -U postgres -d specflow
```

В открывшемся `psql`:

```sql
INSERT INTO "User" (id, email, name, "createdAt", "updatedAt")
VALUES (1, 'dev@example.com', 'Dev', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
\q
```

### 6. Остановить

```bash
docker compose down
```

> При первом старте сервер сам применяет миграции (`prisma migrate deploy`) — таблицы создаются автоматически.

---

## Переменные окружения

| Переменная | Назначение | Пример |
|---|---|---|
| `POSTGRES_USER` | пользователь PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | пароль PostgreSQL | `change_me` |
| `POSTGRES_DB` | имя базы | `specflow` |
| `SERVER_PORT` | порт API на хосте | `3000` |
| `CLIENT_PORT` | порт клиента на хосте | `5173` |
| `DATABASE_URL` | строка подключения Prisma | `postgresql://postgres:change_me@postgres:5432/specflow` |
| `CORS_ORIGIN` | разрешённый origin | `http://localhost:5173` |
| `VITE_API_URL` | URL API (зарезервировано) | `http://localhost:3000` |

> Внутри Docker host `postgres` — это имя сервиса из `docker-compose.yml`. Для запуска без Docker используй `localhost`.

---

## Локальная разработка (без Docker)

Понадобятся Node.js 22+ и PostgreSQL (можно поднять только БД через Docker).

### 1. PostgreSQL

```bash
docker run --name specflow-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=change_me \
  -e POSTGRES_DB=specflow \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Сервер

```bash
cd server
npm install
```

Создай `server/.env` (или задай переменные окружения):

```env
DATABASE_URL=postgresql://postgres:change_me@localhost:5432/specflow
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

```bash
npm run db:generate
npm run db:deploy
npm run dev
```

### 3. Клиент

```bash
cd client
npm install
npm run dev
```

> ⚠️ `client/vite.config.ts` проксирует `/api` на `http://server:3000` — это имя сервиса Docker. Для локального запуска без Docker замени target на `http://localhost:3000`.

---

## База данных и миграции

```bash
cd server

npm run db:generate      # сгенерировать Prisma Client
npm run db:deploy        # применить миграции (CI / prod / Docker)
npm run db:migrate       # создать новую миграцию (dev)
npm run db:clear-stocks  # очистить таблицу Stock
```

Схема: `server/prisma/schema.prisma`.

Особенности модели:

- `Stock.purchasePrice`, `Stock.currentPrice` и `Stock.profit` — `Decimal(18, 4)`.
- `Stock.profitPercent` — процент прибыли, обновляется фоновым джобом.
- Уникальный индекс `(ticker, userId)`: повторное добавление тикера **увеличивает позицию** и пересчитывает средневзвешенную цену покупки.
- API отдаёт числа через DTO (`server/src/api/dto/stock.dto.ts`).

---

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/health` | health-check |
| GET | `/api/stocks` | список акций с поиском/фильтрами/пагинацией |
| POST | `/api/stocks` | добавить акцию (при повторе тикера — слияние позиции) |
| GET | `/api/stocks/:id` | одна акция |
| PATCH | `/api/stocks/:id` | обновить акцию/цены |
| DELETE | `/api/stocks/:id` | удалить акцию |
| GET | `/api/moex/stocks/:ticker` | котировка одной акции |
| GET | `/api/moex/quotes?tickers=SBER,GAZP` | батч котировок |

Параметры `GET /api/stocks`:

| Параметр | Значения | По умолчанию |
|---|---|---|
| `search` | строка (тикер/название) | — |
| `filter` | `all` \| `profitable` \| `losing` | `all` |
| `sort` | `date` \| `ticker` \| `price` \| `profit` | `date` |
| `order` | `asc` \| `desc` | `desc` |
| `page` | ≥ 1 | `1` |
| `limit` | 1–50 | `10` |

Ответ:

```json
{
  "items": [ ... ],
  "total": 4,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "summary": {
    "invested": 5491.3,
    "value": 5504.79,
    "profit": 13.49,
    "profitPercent": 0.25
  }
}
```

Пример:

```bash
curl "http://localhost:3000/api/moex/quotes?tickers=SBER,GAZP"
```

---

## Скрипты

### client

| Скрипт | Описание |
|---|---|
| `npm run dev` | Vite dev-сервер |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |
| `npm run preview` | предпросмотр production-сборки |

### server

| Скрипт | Описание |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `prisma generate && tsc` |
| `npm run start` | `node dist/server.js` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:clear-stocks` | очистка таблицы `Stock` |

---

## Особенности и ограничения

- **Авторизации пока нет.** Клиент использует `DEV_USER_ID = 1` (`client/src/shared/session.ts`); в таблице `User` должен существовать пользователь с `id = 1`. Все акции возвращаются без фильтра по пользователю.
- **Фоновое обновление цен.** `server/src/jobs/refresh-quotes.job.ts` каждые 30 секунд пишет `currentPrice`, `changePercent`, `lastUpdate` в БД.
- **Котировки MOEX.** Публичный ISS API (`iss.moex.com`), таймаут 8 секунд, серверный кэш 10 секунд.
- **Деньги** хранятся как `Decimal(18, 4)`; API отдаёт числа.
- **Уникальность** `(ticker, userId)`: повторный тикер объединяется с существующей позицией.
- **Windows + Docker.** `tsx watch` и Vite HMR могут не видеть изменения на bind-mount: для серверных правок — `docker compose restart server`, для клиента — обновить страницу (F5).
- **Авто-миграции в контейнере** выполняются при старте (`db:deploy` в `server/Dockerfile`); после изменения Dockerfile нужен `docker compose up -d --build`.
- **Тестов пока нет.**

---

## Траблшутинг

| Проблема | Решение |
|---|---|
| «Пользователь не найден» при добавлении акции | Создать пользователя с `id = 1` (см. шаг 5) |
| `Can't reach database server` | Проверить, что `postgres` здоров: `docker compose ps`, `docker compose logs postgres` |
| Порт занят | Изменить `SERVER_PORT` / `CLIENT_PORT` в `.env` |
| Prisma Client устарел | `cd server && npm run db:generate` |
| Изменения на сервере не применяются | `docker compose restart server` (Windows bind-mount) |
| Клиент не видит изменения | Обновить страницу (F5) |
| Пустая таблица после `down` | Удалить volume: `docker compose down -v` (осторожно: данные удалятся) |

---

## Лицензия

Учебный проект. Серверная часть — ISC.

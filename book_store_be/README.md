# Book Store Backend (NestJS)

REST API for the book store frontend (`../book_store`). Ported from the original
Express implementation; every route, guard and JSON response shape is unchanged so
the Nuxt frontend works without modification.

## Stack

- NestJS 11 + TypeScript
- MongoDB via `@nestjs/mongoose`
- Redis (book list / detail cache)
- JWT auth (`token: Bearer <jwt>` header) + Google OAuth (passport)
- Cloudinary uploads, VNPay & MoMo payments, Gemini chatbot

## Getting started

```bash
cp .env.example .env      # fill in secrets
docker compose up -d      # local Redis
npm install
npm run start:dev         # http://localhost:5000
```

Other scripts: `npm run build`, `npm run start:prod`, `npm run typecheck`.

## Project layout

```
src/
  main.ts                 bootstrap: /api prefix, CORS, cookie-parser, error filter
  app.module.ts           Config, Mongoose, JWT, Redis, Cloudinary + feature modules
  common/
    guards/               JwtAuthGuard (verifyToken), AdminGuard (verifyTokenAndAdmin)
    decorators/           @CurrentUser()
    filters/              AllExceptionsFilter: keeps `{ msg }` error bodies
  config/                 RedisService, Cloudinary provider
  constants/              book subjects, order statuses, exchange rate
  modules/
    auth/                 register, login, refresh, password reset, Google OAuth
    users/                admin user list/delete, Cloudinary upload
    books/                CRUD + Redis cache, search, home feed
    carts/  favorites/  reviews/  contacts/  vouchers/
    orders/               checkout (VNPay / MoMo), gateway callbacks, admin stats
      payments/           VnpayService, MomoService
    chatbot/              Gemini-powered suggestions and reviews
```

Each module follows `*.module.ts` / `*.controller.ts` / `*.service.ts` / `schemas/` / `dto/`.

## Route map

| Prefix          | Notes                                                   |
| --------------- | ------------------------------------------------------- |
| `/api/auth`     | `/google` and `/google/callback` use passport-google    |
| `/api/users`    | `POST /upload-images?type=avatar\|book\|ebook_file`     |
| `/api/books`    | static routes (`/home`, `/search`) declared before `/:id` |
| `/api/carts`    | all routes require a token                              |
| `/api/reviews`  | admin replies under `/:reviewId/reply[/:replyId]`       |
| `/api/order`    | `/vnpay_return`, `/momo_return` redirect to the frontend |
| `/api/favorite` | toggle + list                                           |
| `/api/chatbot`  | `/suggestions`, `/review/generate`                      |
| `/api/contact`  | user + admin routes                                     |
| `/api/voucher`  | `GET /all?activeOnly=true` for storefront               |

## Environment variables

See `.env.example`. New optional variables compared to the Express version:
`REDIS_URL`, `FRONTEND_URL`, `BACKEND_URL`, `VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET`
(all default to the previous hardcoded localhost / sandbox values).

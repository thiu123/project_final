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
    chatbot/              Gemini advisor: tool calling over the catalogue
```

Each module follows `*.module.ts` / `*.controller.ts` / `*.service.ts` / `schemas/` / `dto/`.

## Route map

| Prefix          | Notes                                                   |
| --------------- | ------------------------------------------------------- |
| `/api/auth`     | `/google` and `/google/callback` use passport-google    |
| `/api/users`    | `POST /upload-images?type=avatar\|book\|ebook_file`     |
| `/api/books`    | see **Catalogue API** below; static routes precede `/:id` |
| `/api/carts`    | all routes require a token                              |
| `/api/reviews`  | admin replies under `/:reviewId/reply[/:replyId]`       |
| `/api/order`    | `/vnpay_return`, `/momo_return` redirect to the frontend |
| `/api/favorite` | toggle + list                                           |
| `/api/chatbot`  | see **Chatbot** below; all routes require a token        |
| `/api/contact`  | user + admin routes                                     |
| `/api/voucher`  | `GET /all?activeOnly=true` for storefront               |

## Catalogue API

Pagination, filtering, sorting and the category list are all resolved in
MongoDB. The client sends a query and renders exactly what comes back.

### `GET /api/books`

| Param | Default | Notes |
| --- | --- | --- |
| `page` | `1` | |
| `limit` | `12` | max `100` |
| `subject` | — | category, subcategory or slug; a category also matches its subcategories |
| `search` | — | case-insensitive substring on title and authors |
| `sort` | `newest` | `newest` `oldest` `title_asc` `title_desc` `price_asc` `price_desc` `rating` `bestselling` |
| `minPrice` / `maxPrice` | — | inclusive bounds |
| `inStock` | — | `true` keeps only books with stock left |

Rows are the full book document, descriptions included.

```jsonc
{
  "items": [ /* … */ ],
  "meta": { "page": 1, "limit": 12, "total": 568,
            "totalPages": 48, "hasPrev": false, "hasNext": true }
}
```

Invalid values return `400` with the failing constraint.

### Other routes

- `GET /api/books/categories` — curated taxonomy joined with live counts and a
  cover per category. A category's count rolls up its subcategories, matching
  what `?subject=<category>` returns.
- `GET /api/books/home` — one `$facet` aggregation returning `latest` (10
  newest), `bestSellers`, `groups` (one carousel per subject in
  `src/constants/home-sections.ts`) and `categories`. Only `groups` carries
  descriptions; the other two strips render covers alone.
- `GET /api/books/search?title=&limit=` — capped typeahead suggestions. Use
  `GET /api/books?search=` when the full paginated result set is needed.

### Subject normalization

Subjects are stored lower-cased and stripped of punctuation, so
`"Biology & Life Sciences"` lives in the database as `biology life sciences`.
`subject.util.ts` bridges the taxonomy label, the URL slug
(`biology-life-sciences`) and the stored value, and books written through the
API are normalized on save so the filter keeps matching.

### Caching

All list, category and home responses are cached in Redis for 30 minutes under
the `books:` prefix and dropped wholesale whenever a book is created, updated
or deleted. Individual books are cached separately as `book:<id>`.

## Chatbot

The advisor answers with Gemini function calling rather than a hand-written
pipeline. Gemini is given two tools — `search_books` and `list_categories` —
both backed by `BooksService`, so the chatbot inherits the same indexed subject
expansion, price/stock filters and Redis cache as the storefront, and can only
ever name books the store actually sells.

| Route | Notes |
| --- | --- |
| `POST /chat` | `{ message }` → `{ reply, books }`. Remembers the thread per user. |
| `DELETE /history` | Starts a fresh conversation. |
| `POST /suggestions` | `{ userPreferences }` → `{ reply, suggestions }`, stateless. |
| `POST /review/generate` | `{ bookQuery }` → a cached review for one book. |

**Cost per message.** A turn costs two Gemini calls when the catalogue has to be
searched and one when the model can answer from the conversation so far
("which of those is cheapest?"). Books shown earlier are stored with the
history, so a follow-up answered from context still returns linkable rows.
Reviews cost one call and are cached in Redis for an hour per book *and
language*.

**Model fallback.** `GEMINI_MODEL` is a comma-separated list tried in order.
The free tier caps requests *per model per day* (20/day for gemini-3.6-flash at
the time of writing), so a single model runs dry fast; each has its own budget,
and falling through multiplies the daily allowance for free. A model that
returns 429 is skipped for 15 minutes rather than being re-asked every request.

**Limits.** Each user gets 15 messages per minute (`RateLimitService`, a fixed
window in Redis). Process-wide, calls are serialized with a minimum gap of
`GEMINI_MIN_GAP_MS`, because Gemini's rate limit applies to the API key rather
than the caller; past 8 queued callers a request fails fast instead of hanging.
Google's 503 "high demand" is retried once, and a retired model ID is logged as
a config problem rather than a transient error.

## Environment variables

See `.env.example`. New optional variables compared to the Express version:
`REDIS_URL`, `FRONTEND_URL`, `BACKEND_URL`, `VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET`
(all default to the previous hardcoded localhost / sandbox values).

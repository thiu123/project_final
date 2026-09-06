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
    orders/               checkout (VNPay / MoMo / COD), gateway callbacks, admin stats
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
| `/api/order`    | see **Checkout** below                                   |
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
or deleted. Individual books are cached separately as `book:<id>`, and checkout
invalidates both when it moves stock. A Redis outage degrades to uncached reads
rather than taking the API down with it.

## Checkout

Three payment methods, all creating the same `Order`:

| Route | Flow |
| --- | --- |
| `POST /checkout` | VNPay. Returns `{ paymentUrl }`; the browser leaves the site. |
| `POST /checkout_momo` | MoMo, same shape. |
| `POST /checkout_cod` | Cash on delivery. Requires `shipping`; returns the order itself — no gateway, no redirect. |

`/vnpay_return` and `/momo_return` receive the gateway redirect and forward
the customer to `/order/status/<orderId>` on the frontend.

**When inventory is taken.** Prepaid orders reserve stock, consume the voucher
and clear the cart when the gateway confirms payment. A COD order does all of
that the moment it is placed, because nobody pays until delivery — so it sits
at `Pending` with stock already committed. `Order.inventoryCommitted` records
which happened, and cancellation restores only what was actually taken.

**Delivery details.** COD requires `shipping: { fullName, phone, address, note? }`.
The account stores no address or phone, and the recipient is often not the
buyer, so it is captured per order. The phone is validated as a Vietnamese
mobile (`0912345678` or `+84912345678`) because the courier calls it; names and
addresses are trimmed and whitespace-collapsed on the way in. Prepaid orders
still have no address — see the note below.

**COD rejects ebooks.** There is nothing for a courier to hand over, and ebook
access requires a paid status that a COD order does not reach until delivery.

## Order status

One `status` enum carries two things: whether the money arrived, and how far
the parcel got. Who owns the money half depends on the payment method, so
`order-transitions.ts` holds two tables and `PUT /admin/:id/status` refuses
anything not in them.

| | Admin may move it |
| --- | --- |
| VNPay / MoMo | `Pending → Cancelled`, `Paid → Confirmed \| Cancelled`, `Confirmed → In Delivery \| Cancelled`, `In Delivery → Delivered` |
| COD | `Pending → Confirmed \| Cancelled`, `Confirmed → In Delivery \| Cancelled`, `In Delivery → Delivered \| Failed`, `Delivered → Paid` |

**Only COD can be marked Paid by hand.** For a prepaid order the gateway
callback writes `Pending`, `Paid` and `Failed`; an admin typing `Paid` would be
recording money the bank never sent, and because that path never commits
inventory the stock, voucher and cart would all stay untouched while the order
claimed to be settled. For COD nothing will ever report the cash, so the admin
is the only source — and `Paid` sits *after* `Delivered`, because no one
collects at a door the courier has not reached.

Moving to `Confirmed` records `confirmedByAdmin`/`confirmedAt`; moving to
`Cancelled` restores inventory. Both used to be bypassable by writing the
status directly, which lost stock on every admin cancellation.

**Revenue** counts a prepaid order from `Paid` onwards, but a COD order only at
`Paid` — a delivered COD order that has not been settled is money nobody has.

**Known gap.** VNPay and MoMo orders ship physical books with no address at
all. The `shipping` field is on `Order`, not on the COD path, so extending the
requirement to them is a validation change plus a checkout form, not a schema
migration.

**Admin flow.** A COD order is confirmable straight from `Pending`; prepaid
orders must be `Paid` first. From there both follow
`Confirmed → In Delivery → Delivered`, and for COD the money arrives at the
last step.

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

## Reference fields must be `SchemaTypes.ObjectId`

Declare every `ref` field as `@Prop({ type: SchemaTypes.ObjectId, ref: '...' })`.
Do **not** use `Types.ObjectId` there — it is the constructor for *making* ids,
and `@nestjs/mongoose` does not recognise it as a schema type. It treats it as
an ordinary class, builds an empty definition from it, and the field silently
becomes `Mixed`. `Mixed` does no casting, so ids from a JWT or request body get
stored as raw strings, and `"abc…"` never matches `ObjectId("abc…")` in a
query. That is invisible until someone filters by the field: an affected user's
orders simply disappear from their order history.

Two scripts guard this:

```bash
node scripts/verify-objectid-refs.js            # read-only; exits non-zero if any string ids remain
node scripts/migrate-objectid-refs.js --dry-run # show what would change
node scripts/migrate-objectid-refs.js           # convert, after writing a JSON backup
```

Run the migration once per database immediately after deploying a schema fix —
until it runs, documents holding string ids are invisible to the newly-casting
queries.

## Environment variables

See `.env.example`. New optional variables compared to the Express version:
`REDIS_URL`, `FRONTEND_URL`, `BACKEND_URL`, `VNPAY_TMN_CODE`, `VNPAY_SECURE_SECRET`
(all default to the previous hardcoded localhost / sandbox values).

# CLAUDE.md — Flivio Codebase Guide

> This file provides essential context for AI assistants (Claude and others) working in this repository. Read it fully before making any changes.

---

## Project Overview

**Flivio** (package name: `food-profit-flow`) is a SaaS restaurant intelligence platform for cost and profit optimisation. It helps restaurant owners visualise costs, track margins, analyse delivery platform profitability, monitor supplier risks, simulate pricing scenarios, and receive data-driven recommendations.

Key differentiators:
- Ingredient-level recipe costing with VAT support (UK-focused)
- Delivery platform profitability (Uber Eats, Deliveroo, Just Eat)
- Franchise network support — franchisors view all locations, franchisees see their own data + network price intelligence
- Period comparison (weekly, quarterly, half-yearly)
- What-If / Promotions simulator with slider-based scenario modelling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 7, TypeScript 5.6 |
| Styling | Tailwind CSS 3.4, shadcn/ui (New York style), Radix UI |
| Client routing | wouter 3.3 |
| Server state | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod validation |
| Charts | Recharts 2 |
| Backend | Express.js 5, Node.js 20 |
| Database | PostgreSQL via `pg` library |
| ORM | Drizzle ORM 0.39 + Drizzle Kit |
| Auth | Session-based (express-session + bcryptjs) |
| Build | Vite (client) + esbuild (server) via custom `script/build.ts` |
| Deployment | Railway.app (Nixpacks) |

---

## Directory Structure

```
Flivio/
├── client/
│   └── src/
│       ├── App.tsx               # Root router and app shell
│       ├── main.tsx              # React entry point
│       ├── index.css             # Global styles + Tailwind directives
│       ├── pages/                # One file per route (25 pages)
│       ├── components/
│       │   ├── app-sidebar.tsx   # Main navigation sidebar
│       │   ├── breadcrumb-nav.tsx
│       │   ├── theme-toggle.tsx  # Dark/light mode toggle
│       │   └── ui/               # shadcn/ui component library (40+ files)
│       ├── hooks/
│       │   ├── use-mobile.tsx    # Responsive breakpoint detection
│       │   └── use-toast.ts      # Toast notification hook
│       └── lib/
│           ├── queryClient.ts    # TanStack React Query client
│           ├── theme-provider.tsx
│           └── utils.ts          # cn() and other helpers
├── server/
│   ├── index.ts                  # Express entry point, sessions, migrations
│   ├── routes.ts                 # ALL API route handlers
│   ├── storage.ts                # IStorage interface + DatabaseStorage class
│   ├── auth.ts                   # Register/login/logout endpoints + middleware
│   ├── db.ts                     # Drizzle DB connection
│   ├── seed.ts                   # Demo data seeding
│   ├── static.ts                 # Static file serving in production
│   └── vite.ts                   # Vite dev server integration
├── shared/
│   └── schema.ts                 # Drizzle table definitions, Zod schemas, TS types
├── migrations/                   # Drizzle-generated SQL migration files
├── script/
│   └── build.ts                  # Custom build script (Vite + esbuild)
├── attached_assets/              # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── components.json               # shadcn/ui configuration
├── railway.json                  # Railway deployment config
├── nixpacks.toml                 # Nixpacks build phases
└── .env.example                  # Environment variable template
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend on port 5000)
npm run dev

# TypeScript type checking (no emit)
npm run check

# Push schema changes directly to the database (dev only)
npm run db:push

# Generate a new migration file from schema changes
npx drizzle-kit generate

# Production build (client via Vite, server via esbuild → dist/)
npm run build

# Run production server
npm run start
```

**Development server is always on `http://localhost:5000`** — Express serves both the API and the Vite dev middleware from the same port.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Long random string for session signing |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |
| `PORT` | No | Port to listen on (default: `5000`; Railway sets this automatically) |

Generate a session secret: `openssl rand -hex 32`

---

## Database

### ORM and Migrations

Drizzle ORM is the only way to query the database. **Never write raw SQL in application code** — use `db.select().from(table).where(...)` etc.

- Schema is defined in `shared/schema.ts` — this is the single source of truth
- Migrations live in `migrations/` and are **auto-run on server startup** via `drizzle-orm/node-postgres/migrator`
- To add a column or table: edit `shared/schema.ts`, then run `npx drizzle-kit generate` to produce a migration, then `npm run db:push` in dev

### Tables

| Table | Purpose |
|---|---|
| `restaurants` | Restaurant profiles; each has a `tenantType` and optional `franchiseGroupId` |
| `users` | Auth users; `id` is UUID (varchar), `role` is `individual` \| `franchisee` \| `franchisor` \| `admin` |
| `user_restaurant_access` | Multi-restaurant access control (owner/manager/viewer) |
| `monthly_data` | Financial data per restaurant per month/year |
| `weekly_data` | Financial data per restaurant per ISO week/year |
| `cost_categories` | Global cost category definitions (seeded from `DEFAULT_COST_CATEGORIES`) |
| `restaurant_cost_items` | Per-restaurant cost configuration (enable/disable/override cost categories) |
| `ingredients` | Ingredients with price, unit, VAT rate |
| `suppliers` | Supplier profiles linked to a restaurant |
| `supplier_ingredients` | Links suppliers to ingredients with price + preferred flag |
| `menu_items` | Menu dishes with selling price and VAT configuration |
| `menu_item_ingredients` | Recipe: ingredients + quantities for each menu item |
| `promotions` | Discount promotions with profitability target |
| `franchise_groups` | Franchise brand entities (owned by a user) |
| `franchise_memberships` | Links restaurants to franchise groups with role |
| `franchise_approved_suppliers` | Franchisor-set approved/required suppliers |
| `supplier_price_reports` | Prices franchisees actually paid — powers network price intelligence |

### Storage Layer

All database access goes through `server/storage.ts`. The `IStorage` interface lists every method; `DatabaseStorage` implements it with Drizzle queries.

**Always add new database operations to `IStorage` and `DatabaseStorage` — never query `db` directly from `routes.ts`.**

---

## API Conventions

All API routes are registered in `server/routes.ts` via `registerRoutes()`.

### URL Patterns

```
GET    /api/health                                    # Health check (no auth)
POST   /api/auth/register                             # Register
POST   /api/auth/login                                # Login
POST   /api/auth/logout                               # Logout
GET    /api/auth/user                                 # Current user

GET    /api/restaurants                               # All restaurants
GET    /api/restaurants/current                       # First restaurant
POST   /api/restaurants                               # Create restaurant

GET    /api/monthly-data/:restaurantId
POST   /api/monthly-data

GET    /api/weekly-data/:restaurantId
POST   /api/weekly-data

GET    /api/comparisons/quarterly?restaurantId=&quarter=&year=
GET    /api/comparisons/half-yearly?restaurantId=&half=&year=
GET    /api/comparisons/weekly?restaurantId=&weekNumber=&year=

GET    /api/cost-categories
POST   /api/cost-categories

GET    /api/restaurant-cost-items/:restaurantId
POST   /api/restaurant-cost-items
PUT    /api/restaurant-cost-items/:id
POST   /api/restaurant-cost-items/bulk/:restaurantId  # Replaces all cost items

GET    /api/suppliers/:restaurantId
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id

GET    /api/ingredients/:restaurantId
POST   /api/ingredients
PUT    /api/ingredients/:id
DELETE /api/ingredients/:id

GET    /api/supplier-ingredients/:supplierId
GET    /api/ingredient-suppliers/:ingredientId
POST   /api/supplier-ingredients
DELETE /api/supplier-ingredients/:id

GET    /api/menu-items/:restaurantId
POST   /api/menu-items
PUT    /api/menu-items/:id
DELETE /api/menu-items/:id

GET    /api/menu-item-ingredients/:menuItemId
POST   /api/menu-item-ingredients/bulk/:menuItemId    # Replaces all recipe items

GET    /api/promotions/:restaurantId
POST   /api/promotions
PUT    /api/promotions/:id
DELETE /api/promotions/:id

POST   /api/import/ingredients                        # Bulk CSV import
POST   /api/import/suppliers
POST   /api/import/menu-items

GET    /api/franchise-groups/:id
GET    /api/franchise-groups/owner/:ownerId
POST   /api/franchise-groups
PUT    /api/franchise-groups/:id

GET    /api/franchise-memberships/:franchiseGroupId
GET    /api/franchise-memberships/restaurant/:restaurantId
POST   /api/franchise-memberships
DELETE /api/franchise-memberships/:id

GET    /api/franchise-approved-suppliers/:franchiseGroupId
POST   /api/franchise-approved-suppliers
PUT    /api/franchise-approved-suppliers/:id
DELETE /api/franchise-approved-suppliers/:id

POST   /api/supplier-price-reports
GET    /api/supplier-price-reports/group/:franchiseGroupId
GET    /api/supplier-price-reports/restaurant/:restaurantId

GET    /api/franchise-analytics/:franchiseGroupId
GET    /api/supplier-intelligence/:restaurantId/:franchiseGroupId
```

### Route Handler Pattern

Every route handler follows this pattern — always validate input with the Zod insert schema, always catch errors:

```typescript
app.post("/api/things", async (req, res) => {
  try {
    const parsed = insertThingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
    }
    const result = await storage.createThing(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create thing" });
  }
});
```

---

## Frontend Architecture

### Routing

`client/src/App.tsx` defines two zones:

- **Public zone** (`/`, `/login`, `/register`): Full-page layouts, no sidebar
- **App zone** (`/app/*`): `AppLayout` wraps all pages with `AppSidebar` + `ThemeToggle`

`wouter` is used for routing — it is **not** React Router. Use `useLocation()` and `<Link>` from `wouter`.

### Data Fetching

Always use **TanStack React Query** for all server data. The query client is in `lib/queryClient.ts`.

```typescript
// Reading data
const { data, isLoading } = useQuery({
  queryKey: ["/api/restaurants"],
  queryFn: () => fetch("/api/restaurants").then(r => r.json()),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => fetch("/api/things", { method: "POST", body: JSON.stringify(data) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/things"] }),
});
```

After any mutation that changes data, invalidate the relevant query keys.

### Import Aliases

The TypeScript path aliases are:

| Alias | Resolves to |
|---|---|
| `@/` | `client/src/` |
| `@shared/` | `shared/` |
| `@assets/` | `attached_assets/` |

Use these in all imports. Never use relative `../../` paths to cross directory boundaries.

### Adding a New Page

1. Create `client/src/pages/my-page.tsx`
2. Import and add a `<Route path="/app/my-page" component={MyPage} />` in `App.tsx`
3. Add the navigation link to `client/src/components/app-sidebar.tsx`

### UI Components

All UI primitives come from `@/components/ui/` (shadcn/ui). **Do not install new component libraries without discussion.** Add new shadcn components with:

```bash
npx shadcn@latest add <component-name>
```

Use `cn()` from `@/lib/utils` to merge Tailwind classes conditionally.

---

## Authentication

Auth is **session-based** — no JWT tokens.

- Sessions are stored in memory (development) or PostgreSQL via `connect-pg-simple` (production)
- Session cookie is `httpOnly`, `secure` in production, 7-day max age
- `req.session.userId` holds the authenticated user's UUID

Two middleware helpers in `server/auth.ts`:
- `requireAuth` — 401s if not authenticated
- `optionalAuth` — adds `req.user` if authenticated, continues either way

Passwords are hashed with **bcrypt (10 rounds)** before storage.

---

## Tenant and Franchise Model

- Each `Restaurant` has a `tenantType`: `trial`, `demo`, or `paid`
- Paid restaurants have a `subscriptionTier`: `starter`, `professional`, or `enterprise`
- `franchiseGroupId` on a restaurant links it to a franchise brand
- `FranchiseMembership` records which restaurants are in a franchise group, with role `franchisor` or `franchisee`
- Franchisors see full network analytics; franchisees see their own data + anonymised network price intelligence

---

## Build and Deployment

### Production Build

```bash
npm run build
```

`script/build.ts` runs two steps:
1. **Vite** bundles the React client → `dist/public/`
2. **esbuild** bundles the Express server → `dist/index.cjs` (CommonJS)
3. The `migrations/` folder is copied into `dist/migrations/`

### Production Start

```bash
npm run start
# → NODE_ENV=production node dist/index.cjs
```

The server:
- Runs migrations automatically on startup (non-fatal if already applied)
- Serves the compiled React app as static files via `server/static.ts`
- Listens on `process.env.PORT || 5000`, binding to `0.0.0.0`

### Railway Deployment

The app is deployed to [Railway.app](https://railway.app) using Nixpacks:

- `railway.json` — builder, start command, health check at `/api/health`, restart policy
- `nixpacks.toml` — Node 20, `npm ci`, `npm run build`, `npm run start`
- `Procfile` — `web: npm run start` (fallback)

**The HTTP server starts before async setup** (migrations, seeding) so Railway's health check at `/api/health` responds immediately.

---

## Code Conventions

### TypeScript

- **Strict mode is on** — no `any` without a comment explaining why
- Use types exported from `shared/schema.ts` (e.g., `Restaurant`, `MenuItem`, `InsertSupplier`) throughout both client and server
- Server types use `Insert*` for creation, table-inferred types for reads
- Path alias imports required: `import { ... } from "@shared/schema"`

### Schema Changes

1. Edit `shared/schema.ts` — this is the **single source of truth**
2. Add corresponding `insertXxxSchema` and type exports at the bottom of the file
3. Run `npx drizzle-kit generate` to produce a migration SQL file
4. Run `npm run db:push` to apply it to your local database
5. Update `IStorage` interface and `DatabaseStorage` implementation in `server/storage.ts`
6. Add/update API routes in `server/routes.ts`

### Naming Conventions

| Pattern | Convention |
|---|---|
| Files | `kebab-case.tsx` / `kebab-case.ts` |
| React components | `PascalCase` |
| Functions & variables | `camelCase` |
| Database columns | `snake_case` (via Drizzle column name argument) |
| TypeScript properties | `camelCase` (Drizzle auto-maps) |
| API routes | `/api/kebab-case/:id` |
| Query keys | Match the API URL string: `["/api/restaurants"]` |

### Error Handling

- API routes always return `{ message: string }` on errors with an appropriate HTTP status code
- Validation failures return `400` with `{ message, errors }` where `errors` is the Zod error array
- Not found returns `404`, auth failures `401`/`403`, server errors `500`
- Never let uncaught errors crash the process — every async route has a `try/catch`

### Styling

- Use Tailwind utility classes only — no inline styles, no separate CSS files (except `index.css` for globals)
- Use `cn()` from `@/lib/utils` for conditional class merging
- Dark mode uses the `dark:` Tailwind variant — the `ThemeProvider` applies the `dark` class to the root
- Sidebar width is controlled via CSS variables: `--sidebar-width: 16rem`, `--sidebar-width-icon: 3rem`

---

## No Test Framework

There are currently **no automated tests** in this project. There is no Jest, Vitest, or other test runner configured. The `tsc` type check (`npm run check`) is the only automated quality gate.

When adding tests in future, Vitest is the recommended choice (it integrates with Vite's config).

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `shared/schema.ts` | All DB tables, Zod schemas, TypeScript types — start here for data model |
| `server/routes.ts` | Every API endpoint |
| `server/storage.ts` | All DB queries — the only place Drizzle is called |
| `server/auth.ts` | Auth endpoints and middleware |
| `server/index.ts` | Server startup, sessions, middleware ordering |
| `client/src/App.tsx` | Client routing and layout structure |
| `client/src/components/app-sidebar.tsx` | Navigation menu |
| `client/src/lib/queryClient.ts` | React Query client configuration |
| `vite.config.ts` | Vite config including path aliases |
| `tsconfig.json` | TypeScript config including path aliases |
| `drizzle.config.ts` | Drizzle ORM config |
| `railway.json` | Production deployment config |

---

## Common Tasks

### Add a new API resource

1. Add table to `shared/schema.ts` with insert schema and types
2. Run `npx drizzle-kit generate` + `npm run db:push`
3. Add CRUD methods to `IStorage` and `DatabaseStorage` in `server/storage.ts`
4. Add route handlers in `server/routes.ts`
5. Add React Query hooks in the relevant page component(s)

### Add a new page

1. Create `client/src/pages/my-feature.tsx`
2. Add `<Route path="/app/my-feature" component={MyFeature} />` in `client/src/App.tsx`
3. Add nav entry in `client/src/components/app-sidebar.tsx`

### Add a new shadcn/ui component

```bash
npx shadcn@latest add <component>
```

Files land in `client/src/components/ui/`.

### Update the database schema

Edit `shared/schema.ts`, then:
```bash
npx drizzle-kit generate   # create migration file
npm run db:push            # apply to local DB
```

Update `IStorage` + `DatabaseStorage` in `server/storage.ts` to reflect new fields.

### Deploy to Railway

Push to `master` or trigger a Railway deployment. Railway runs:
```
npm ci → npm run build → npm run start
```

The `/api/health` endpoint must return `200` within 30 seconds for the deployment to succeed.

# CLAUDE.md — Flivio Codebase Guide

This file provides AI assistants with everything needed to understand, develop, and maintain the Flivio codebase effectively.

---

## Project Overview

**Flivio** is a full-stack TypeScript SaaS platform for restaurant cost and profit intelligence. It helps restaurant owners visualize costs, track margins, analyze delivery platform profitability, monitor supplier risks, simulate scenarios, and receive data-driven recommendations.

**Key identifiers:**
- Primary language: TypeScript (strict mode)
- Architecture: Monorepo — React frontend + Express backend in one repo
- Database: PostgreSQL via Drizzle ORM
- Auth: Session-based (cookie)
- Deployment: Railway (primary)

---

## Repository Structure

```
Flivio/
├── client/src/              # React 18 frontend (Vite)
│   ├── pages/               # 25 feature pages
│   ├── components/          # Reusable components
│   │   └── ui/              # 45+ shadcn/ui primitives
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, query client, theme
│   ├── App.tsx              # Wouter router
│   └── main.tsx             # App entry point
├── server/                  # Express.js backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # All API route handlers
│   ├── auth.ts              # Auth routes (register/login/logout)
│   ├── storage.ts           # DB interface (IStorage + DrizzleStorage)
│   ├── db.ts                # Drizzle DB connection
│   ├── seed.ts              # Database seeding logic
│   └── vite.ts              # Vite dev middleware integration
├── shared/
│   └── schema.ts            # Drizzle schema + Zod types (single source of truth)
├── migrations/              # SQL migration files (Drizzle Kit generated)
├── script/
│   └── build.ts             # esbuild + Vite production build script
├── dist/                    # Build output (not committed)
│   ├── public/              # Vite-built frontend
│   └── index.cjs            # esbuild-bundled server
├── drizzle.config.ts        # Drizzle ORM config
├── vite.config.ts           # Vite build config
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── components.json          # shadcn/ui config
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type safety |
| Vite | 7.3.0 | Dev server + build tool |
| Wouter | 3.3.5 | Client-side routing |
| TanStack React Query | 5.60.5 | Server state, caching |
| shadcn/ui + Radix UI | latest | Accessible UI components |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Recharts | 2.15.2 | Data visualization |
| React Hook Form + Zod | 7.55.0 + 3.x | Form handling + validation |
| Framer Motion | 11.13.1 | Animations |
| next-themes | 0.4.6 | Dark/light mode |
| PapaParse | 5.5.3 | CSV parsing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 5.0.1 | HTTP server |
| Drizzle ORM | 0.39.3 | Type-safe DB queries |
| Drizzle Kit | 0.31.8 | Migrations + schema push |
| PostgreSQL | — | Database |
| express-session | — | Session management |
| bcryptjs | — | Password hashing |
| Zod + drizzle-zod | — | Runtime validation |
| tsx | 4.20.5 | TypeScript execution (dev) |
| esbuild | — | Server bundling (prod) |

---

## Development Workflow

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or remote)

### Setup
```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and SESSION_SECRET
npm run db:push               # push schema to database
npm run dev                   # start dev server (http://localhost:5000)
```

### Available Scripts
```bash
npm run dev        # Start dev server with hot reload (tsx + Vite middleware)
npm run build      # Production build (Vite + esbuild → dist/)
npm run start      # Run production build (node dist/index.cjs)
npm run check      # TypeScript type check (tsc --noEmit)
npm run db:push    # Push Drizzle schema changes to database (no migration file)
```

### No Test Suite
There is currently **no automated test framework** (no Jest, Vitest, etc.). When adding tests in the future, prefer Vitest (compatible with Vite setup).

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname
SESSION_SECRET=a-long-random-secret-string

# Optional
NODE_ENV=development|production   # defaults to development
PORT=5000                         # server port (default: 5000)
```

In production with SSL (e.g., Supabase, Railway PostgreSQL), `DATABASE_URL` should include `?sslmode=require`.

---

## Database

### Schema Location
All table definitions and Zod insert/select types live in **`shared/schema.ts`**. This is the single source of truth — both frontend and backend import from here.

### Tables (13 total)
| Table | Purpose |
|---|---|
| `users` | Authentication credentials + role |
| `restaurants` | Restaurant profiles + subscription info |
| `monthly_data` | Monthly revenue + cost metrics |
| `weekly_data` | Weekly financial metrics |
| `cost_categories` | 12 default cost categories |
| `restaurant_cost_items` | Per-restaurant cost item overrides |
| `ingredients` | Ingredient catalog with pricing + VAT |
| `suppliers` | Supplier contacts + categories |
| `supplier_ingredients` | Supplier↔ingredient pricing junction |
| `menu_items` | Dishes with pricing + VAT |
| `menu_item_ingredients` | Recipe composition (dish↔ingredient) |
| `promotions` | Discount promotions with targets |
| `franchise_groups` | Multi-location brand groups |
| `franchise_memberships` | Restaurant↔franchise group |
| `franchise_approved_suppliers` | Pre-approved franchise suppliers |
| `supplier_price_reports` | Crowd-sourced price intelligence |
| `user_restaurant_access` | Multi-restaurant access control |

### Making Schema Changes
1. Edit `shared/schema.ts`
2. Run `npm run db:push` (development — pushes without migration file)
3. For production migrations, use `npx drizzle-kit generate` then `npx drizzle-kit migrate`

### Storage Interface
`server/storage.ts` defines `IStorage` — an interface with all database operations. `DrizzleStorage` implements it. All route handlers call `storage.*` methods, never raw Drizzle queries directly in routes.

---

## API Conventions

### Base URL
All API routes are prefixed with `/api`.

### Auth Endpoints
```
POST /api/auth/register    # { username, password }
POST /api/auth/login       # { username, password }
POST /api/auth/logout
GET  /api/auth/user        # returns current session user
```

### Resource Endpoints (REST)
```
GET    /api/restaurants
POST   /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

GET    /api/monthly-data
POST   /api/monthly-data
...similar pattern for all resources
```

**Other routes:**
- `GET /api/health` — Health check (returns 200 `{ ok: true }`)
- `POST /api/data-import` — CSV bulk upload

### Request/Response Format
- All request bodies: JSON (`Content-Type: application/json`)
- All responses: JSON
- Validation: Zod schemas from `shared/schema.ts` at API boundary
- Errors: `{ message: string }` with appropriate HTTP status codes (400, 401, 404, 500)

### Authentication
Session-based. After login, the server sets a `connect.sid` cookie. Protected routes check `req.session.userId`. No JWT.

---

## Frontend Conventions

### Routing
Uses **Wouter** (not React Router). Route definitions are in `client/src/App.tsx`.

```tsx
import { Switch, Route } from "wouter";
<Route path="/dashboard" component={Dashboard} />
```

### Data Fetching
Use **TanStack React Query** for all server state. The query client is configured in `client/src/lib/queryClient.ts`.

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["/api/restaurants"],
  queryFn: () => fetch("/api/restaurants").then(r => r.json()),
});
```

Mutations use `useMutation` with `queryClient.invalidateQueries` on success.

### Component Library
UI components come from **shadcn/ui** located in `client/src/components/ui/`. These are copied source files (not installed from npm), so they can be freely customized. Add new shadcn components with:

```bash
npx shadcn@latest add <component-name>
```

### Styling
- Tailwind CSS utility classes only (no plain CSS files except `index.css` for global variables)
- Dark mode via `class` strategy — wrap components with `dark:` variants
- CSS custom properties defined in `client/src/index.css` (HSL color variables)
- Tailwind config: `tailwind.config.ts`

### Forms
Use **React Hook Form** + **Zod** resolver for all forms:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMenuItemSchema } from "@shared/schema";

const form = useForm({
  resolver: zodResolver(insertMenuItemSchema),
});
```

### Import Aliases
Configured in both `tsconfig.json` and `vite.config.ts`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

---

## Key Architectural Patterns

### Type Flow
```
shared/schema.ts (Drizzle table + drizzle-zod)
  → export insert/select TypeScript types
  → server/storage.ts uses them for DB operations
  → server/routes.ts validates request bodies against them
  → client pages import types for form schemas
```

### Adding a New Feature (full-stack example)
1. **Schema:** Add table to `shared/schema.ts`, run `npm run db:push`
2. **Storage:** Add method to `IStorage` interface + `DrizzleStorage` implementation in `server/storage.ts`
3. **Route:** Add Express route handler in `server/routes.ts`
4. **Page:** Create `client/src/pages/my-feature.tsx`
5. **Router:** Add `<Route>` in `client/src/App.tsx`
6. **Sidebar:** Add nav entry in `client/src/components/app-sidebar.tsx`

### Server Architecture
- `server/index.ts` — bootstraps Express, runs migrations, registers routes, starts server
- `server/routes.ts` — registers all `/api/*` handlers (calls `storage.*`)
- `server/auth.ts` — registers `/api/auth/*` handlers
- `server/storage.ts` — all DB logic isolated here (IStorage pattern)
- Auto-runs pending migrations on server start in production

---

## Pages Reference

| Page | Route | Purpose |
|---|---|---|
| `landing.tsx` | `/` | Marketing landing |
| `login.tsx` | `/login` | Auth |
| `register.tsx` | `/register` | Auth |
| `dashboard.tsx` | `/dashboard` | Main overview + drilldown |
| `quick-assessment.tsx` | `/quick-assessment` | Onboarding wizard |
| `cost-analysis.tsx` | `/cost-analysis` | Cost driver trends |
| `cost-classification.tsx` | `/cost-classification` | Direct/indirect/overhead |
| `expense-intelligence.tsx` | `/expense-intelligence` | Variance analysis |
| `performance-comparison.tsx` | `/performance-comparison` | Period comparisons |
| `menu-costing.tsx` | `/menu-costing` | Ingredient-level costing |
| `menu-engineering.tsx` | `/menu-engineering` | Profitability by item |
| `breakeven.tsx` | `/breakeven` | Break-even analysis |
| `supplier-risk.tsx` | `/supplier-risk` | Supplier dependency |
| `supplier-intelligence.tsx` | `/supplier-intelligence` | Price tracking |
| `delivery-platforms.tsx` | `/delivery-platforms` | Commission analysis |
| `promotions.tsx` | `/promotions` | Discount modeling |
| `simulator.tsx` | `/simulator` | What-if scenario modeling |
| `recommendations.tsx` | `/recommendations` | AI-driven insights |
| `process-flow.tsx` | `/process-flow` | Visual process mapping |
| `data-import.tsx` | `/data-import` | Bulk CSV upload |
| `drill-down.tsx` | `/drill-down` | Interactive data exploration |
| `add-data.tsx` | `/add-data` | Manual data entry |
| `franchise-hub.tsx` | `/franchise-hub` | Multi-location management |
| `admin.tsx` | `/admin` | System administration |

---

## Build & Deployment

### Production Build
```bash
npm run build
# Produces:
#   dist/public/        ← Vite-built frontend (static)
#   dist/index.cjs      ← esbuild-bundled server (CommonJS)
#   dist/migrations/    ← copied migration SQL files
```

### Railway Deployment
- `Procfile`: `web: npm start`
- `railway.json`: configured restart policy
- PostgreSQL service added in Railway dashboard
- Environment variables set in Railway dashboard
- Auto-migrates on startup via `server/index.ts`

### Health Check
`GET /api/health` returns `{ ok: true, timestamp: "..." }` — used by Railway for liveness checks.

---

## Code Conventions

### TypeScript
- Strict mode is on — no `any` unless absolutely unavoidable
- Prefer `type` over `interface` for object shapes from Drizzle
- Use `zod` for all runtime validation at API boundaries
- Avoid `as` type assertions; use proper narrowing

### Naming
- Files: `kebab-case.tsx` (pages), `kebab-case.ts` (server)
- Components: `PascalCase`
- Hooks: `useHookName`
- DB tables: `snake_case` (Drizzle convention)
- API routes: `kebab-case` (`/api/menu-items`)

### Commits
- Use descriptive commit messages: `feat:`, `fix:`, `refactor:`, `chore:`
- Keep commits focused and atomic

### Do Not
- Do not bypass Zod validation — always validate at API boundary
- Do not write raw SQL — use Drizzle ORM methods through the storage layer
- Do not store secrets in code — use environment variables
- Do not commit the `dist/` folder
- Do not add `any` types — use proper Drizzle/Zod-inferred types

---

## Common Tasks

### Add a new shadcn component
```bash
npx shadcn@latest add <component>
# Component appears in client/src/components/ui/
```

### Add a new database table
1. Define table in `shared/schema.ts` using Drizzle syntax
2. Export insert/select types with `drizzle-zod`
3. Run `npm run db:push`
4. Add storage methods to `IStorage` + `DrizzleStorage`

### Add a new API endpoint
In `server/routes.ts`:
```ts
app.get("/api/my-resource", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
  const data = await storage.getMyResource(req.session.userId);
  res.json(data);
});
```

### Debug database connection issues
- Check `DATABASE_URL` format and SSL mode
- For Supabase/Railway: append `?sslmode=require` to `DATABASE_URL`
- Server auto-runs migrations on startup — check server logs for migration errors

### Type check the whole project
```bash
npm run check    # runs tsc --noEmit
```

---

## Important Files Quick Reference

| File | What to look at |
|---|---|
| `shared/schema.ts` | All DB tables and TypeScript types |
| `server/routes.ts` | All API endpoint handlers |
| `server/storage.ts` | All DB query logic |
| `server/index.ts` | Server bootstrap, middleware setup |
| `client/src/App.tsx` | All frontend routes |
| `client/src/components/app-sidebar.tsx` | Navigation menu |
| `client/src/lib/queryClient.ts` | React Query configuration |
| `drizzle.config.ts` | DB config for Drizzle Kit |
| `script/build.ts` | Production build logic |

# Restaurant-IQ - Restaurant Intelligence Platform

A SaaS restaurant intelligence platform for cost and profit optimisation. Helps restaurant owners visualise costs, track margins, analyse delivery platform profitability, monitor supplier risks, simulate scenarios, and receive data-driven recommendations.

## Key Features

- **Dashboard** - Overview metrics, revenue/cost trends, weekly profit with clickable drill-down into any cost category
- **Menu & Recipe Costing** - Ingredient-level costing, profit per serve, VAT breakdown (ex-VAT price, output VAT, input VAT, net VAT payable)
- **Delivery Platform Analysis** - Uber Eats, Deliveroo, Just Eat commission breakdown and profitability per channel
- **Expense Intelligence** - Cost driver analysis, actual vs target variance, month-over-month trends, and inflation alerts
- **Drillable Reports** - Click any metric or chart segment to drill down into detailed trends, weekly estimates, and source data
- **Supplier Risk Assessment** - Dependency tracking, risk flags, and price inflation alerts
- **Cost Classification** - Direct, indirect, and overhead cost breakdown
- **What-If Simulator** - Slider-based scenario modelling for pricing and cost changes
- **Promotions Simulator** - Discount impact analysis and scenario comparison
- **CSV Data Import** - Bulk import ingredients, suppliers, and menu items
- **VAT Support** - Configurable input/output VAT rates per item with net/gross display
- **Mobile Responsive** - Fully responsive layout with collapsible sidebar
- **Dark Mode** - Full dark/light theme support

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (client-side)
- **State Management**: TanStack React Query
- **CSV Parsing**: PapaParse

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kfrem/Restaurant-IQ.git
   cd Restaurant-IQ
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`.

## Project Structure

```
client/src/
  pages/           - All page components (dashboard, menu-costing, etc.)
  components/      - Shared UI components (sidebar, theme toggle)
  hooks/           - Custom React hooks
  lib/             - Utility functions and query client
server/
  routes.ts        - API route definitions
  storage.ts       - Database storage interface
  index.ts         - Server entry point
shared/
  schema.ts        - Database schema and types (Drizzle ORM)
```

## API Overview

- **Restaurants** - CRUD for restaurant profiles
- **Monthly Data** - Financial data entries per month
- **Ingredients** - Ingredient management with VAT and pricing
- **Suppliers** - Supplier profiles and ingredient links
- **Menu Items** - Menu dishes with recipes and VAT configuration
- **Promotions** - Discount promotions with profitability targets
- **Data Import** - Bulk CSV import for ingredients, suppliers, and menu items

## Licence

This project is private and proprietary.

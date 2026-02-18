# Flivio - Restaurant Intelligence Platform

## Overview
A SaaS restaurant intelligence platform for cost & profit optimisation. Helps restaurant owners visualise costs, track margins, analyse delivery platform profitability, monitor supplier risks, simulate scenarios, and receive data-driven recommendations. Features VAT support (input/output rates per item), drillable reports, and expense intelligence analysis.

## Recent Changes
- 2026-02-18: Rebranded from RestaurantIQ to Flivio throughout (sidebar, footer, meta tags, landing page)
- 2026-02-18: Built SaaS landing page at `/` with hero, features, pricing, how-it-works sections
- 2026-02-18: Restructured routing: public landing at `/`, app at `/app/*`
- 2026-02-18: Added Delivery Platform Costs page (`/app/delivery-platforms`) with commission analysis, profitability comparison
- 2026-02-18: Added Expense Intelligence page (`/app/expense-intelligence`) with cost driver analysis, variance tracking, inflation alerts
- 2026-02-18: Added Drill-Down page (`/app/drill-down`) for deep-dive into any cost category with trends, weekly estimates, source data
- 2026-02-18: Made dashboard metric cards and cost pie chart clickable for drill-down navigation
- 2026-02-18: Added VAT support: `vatRate`/`vatIncluded` on ingredients, `outputVatRate`/`vatIncluded` on menu items
- 2026-02-18: VAT breakdown display on menu costing page (ex-VAT price, output VAT, input VAT, net VAT payable)
- 2026-02-18: Fixed mobile sidebar (defaultOpen=false), improved responsive layout
- 2026-02-18: Added Menu & Recipe Costing, Supplier Risk Assessment, Cost Classification, Promotions pages (prior)
- 2026-02-18: Initial MVP build with Dashboard, Process Flow, Cost Analysis, What-If Simulator, Recommendations, Data Entry (prior)

## Architecture
- **Frontend**: React + Vite with Tailwind CSS, shadcn/ui components, Recharts for data visualization
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter for client-side routing (public routes at `/`, app routes at `/app/*`)
- **State**: TanStack React Query for server state management
- **CSV Parsing**: PapaParse for client-side CSV import

## Route Structure
### Public Routes
- `/` - Landing page (SaaS marketing page with hero, features, pricing)

### App Routes (under `/app`)
1. **Dashboard** (`/app`) - Overview metrics, revenue/cost trends, weekly profit, clickable drill-down
2. **Quick Assessment** (`/app/quick-assessment`) - Mobile-first 4-step wizard
3. **Menu & Recipes** (`/app/menu-costing`) - Ingredient costing, profit per serve, VAT breakdown
4. **Supplier Risk** (`/app/supplier-risk`) - Dependency tracking, risk flags, price inflation alerts
5. **Cost Classification** (`/app/cost-classification`) - Direct/Indirect/Overhead breakdown
6. **Delivery Platforms** (`/app/delivery-platforms`) - Uber Eats/Deliveroo/Just Eat commission analysis
7. **Promotions** (`/app/promotions`) - Discount impact simulator, scenario comparison
8. **Expense Intelligence** (`/app/expense-intelligence`) - Cost drivers, variance analysis, inflation alerts
9. **Process Flow** (`/app/process-flow`) - Visual flowchart of restaurant value chain
10. **Cost Analysis** (`/app/cost-analysis`) - Detailed breakdowns, radar charts, trend lines
11. **What-If Simulator** (`/app/simulator`) - Slider-based scenario modelling
12. **Recommendations** (`/app/recommendations`) - AI-generated suggestions
13. **Drill-Down** (`/app/drill-down?category=X&label=Y`) - Deep dive into any cost category
14. **Add Data** (`/app/add-data`) - Forms for restaurant profile and monthly financial data
15. **Import Data** (`/app/data-import`) - CSV upload with column mapping

## Data Model
- `restaurants` - Restaurant profile (name, type, location, capacity)
- `monthly_data` - Monthly financials (revenue breakdown, cost categories, performance metrics)
- `cost_categories` - Standard cost category templates with classification (direct/indirect/overhead)
- `restaurant_cost_items` - Per-restaurant cost item configuration
- `suppliers` - Supplier profiles (name, contact, category, active status)
- `ingredients` - Ingredient items with pricing, classification, VAT rate, VAT included flag
- `supplier_ingredients` - Links suppliers to ingredients with pricing
- `menu_items` - Menu dishes with selling prices, categories, output VAT rate, VAT included flag
- `menu_item_ingredients` - Recipe ingredients per menu item
- `promotions` - Discount promotions with target profit and menu item links

## API Endpoints
### Restaurants & Monthly Data
- `GET /api/restaurants/current` - Get first restaurant
- `POST /api/restaurants` - Create restaurant
- `GET /api/monthly-data` - Get all monthly data
- `POST /api/monthly-data` - Add monthly data entry

### Cost Management
- `GET /api/cost-categories` - Get all cost category templates
- `GET /api/restaurant-cost-items/:restaurantId` - Get cost items for restaurant
- `POST /api/restaurant-cost-items/bulk/:restaurantId` - Bulk save cost items

### Suppliers & Ingredients
- `GET /api/suppliers/:restaurantId` - Get suppliers
- `POST /api/suppliers` - Create supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/ingredients/:restaurantId` - Get ingredients
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `GET /api/supplier-ingredients/:supplierId` - Get supplier-ingredient links
- `POST /api/supplier-ingredients` - Link ingredient to supplier

### Menu Items & Recipes
- `GET /api/menu-items/:restaurantId` - Get menu items
- `POST /api/menu-items` - Create menu item
- `DELETE /api/menu-items/:id` - Delete menu item
- `GET /api/menu-item-ingredients/:menuItemId` - Get recipe ingredients
- `POST /api/menu-item-ingredients/bulk/:menuItemId` - Save recipe

### Promotions
- `GET /api/promotions/:restaurantId` - Get promotions
- `POST /api/promotions` - Create promotion
- `DELETE /api/promotions/:id` - Delete promotion

### Data Import
- `POST /api/import/ingredients` - Bulk import ingredients from CSV
- `POST /api/import/suppliers` - Bulk import suppliers from CSV
- `POST /api/import/menu-items` - Bulk import menu items from CSV

## User Preferences
- Uses £ (GBP) currency formatting
- Orange primary color theme (hsl 24, 95%, 53%)
- Dark mode support via class-based toggle
- Brand name: Flivio

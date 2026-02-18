-- Restaurant-IQ Trial Environment SQL
-- This creates an EMPTY database for trial users to test the application
-- NO DEMO DATA - Users will enter their own data

-- ============================================
-- TABLE CREATION (Schema Only)
-- ============================================

CREATE TABLE "cost_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text NOT NULL,
	"default_percentage" real NOT NULL,
	"icon" text NOT NULL,
	"process_stage" text NOT NULL,
	"classification" text DEFAULT 'direct' NOT NULL,
	"is_default" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"current_price" real NOT NULL,
	"previous_price" real,
	"category" text NOT NULL,
	"classification" text DEFAULT 'direct' NOT NULL,
	"vat_rate" real DEFAULT 20,
	"vat_included" boolean DEFAULT true
);

CREATE TABLE "menu_item_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL
);

CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"selling_price" real NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"output_vat_rate" real DEFAULT 20,
	"vat_included" boolean DEFAULT true
);

CREATE TABLE "monthly_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"month" text NOT NULL,
	"year" integer NOT NULL,
	"revenue" real NOT NULL,
	"food_cost" real NOT NULL,
	"labour_cost" real NOT NULL,
	"energy_cost" real NOT NULL,
	"rent_cost" real NOT NULL,
	"marketing_cost" real NOT NULL,
	"supplies_cost" real NOT NULL,
	"technology_cost" real NOT NULL,
	"waste_cost" real NOT NULL,
	"delivery_revenue" real NOT NULL,
	"dine_in_revenue" real NOT NULL,
	"takeaway_revenue" real NOT NULL,
	"total_covers" integer NOT NULL,
	"avg_ticket_size" real NOT NULL,
	"repeat_customer_rate" real NOT NULL
);

CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"discount_percent" real NOT NULL,
	"menu_item_id" integer,
	"target_profit" real,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "restaurant_cost_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"cost_category_id" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"custom_label" text,
	"custom_percentage" real
);

CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"avg_monthly_covers" integer NOT NULL
);

CREATE TABLE "supplier_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_price" real NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"lead_time_days" integer
);

CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_info" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- ============================================
-- DEFAULT COST CATEGORIES (Essential for app to work)
-- ============================================

INSERT INTO "cost_categories" ("name", "key", "description", "default_percentage", "icon", "process_stage", "classification", "is_default", "sort_order") VALUES
('Food & Ingredients', 'food', 'Primary ingredients and food supplies', 30, 'UtensilsCrossed', 'Sourcing', 'direct', true, 1),
('Labour', 'labour', 'Staff wages, benefits, and training', 28, 'Users', 'Preparation', 'direct', true, 2),
('Energy & Utilities', 'energy', 'Electricity, gas, water, and waste management', 7, 'Zap', 'Preparation', 'indirect', true, 3),
('Rent & Property', 'rent', 'Rent, property taxes, and maintenance', 8, 'Building2', 'Service', 'fixed', true, 4),
('Marketing', 'marketing', 'Advertising, promotions, and loyalty programs', 3, 'TrendingUp', 'Service', 'indirect', true, 5),
('Supplies & Packaging', 'supplies', 'Disposables, packaging, and cleaning supplies', 2.5, 'Package', 'Service', 'indirect', true, 6),
('Technology', 'technology', 'POS systems, software, and IT services', 1, 'Laptop', 'Service', 'indirect', true, 7),
('Waste & Spoilage', 'waste', 'Food waste, spoilage, and inventory loss', 4, 'Trash2', 'Review', 'direct', true, 8),
('Equipment', 'equipment', 'Kitchen equipment, furniture, and maintenance', 2, 'Wrench', 'Preparation', 'fixed', true, 9),
('Insurance', 'insurance', 'Business insurance, liability, and coverage', 1.5, 'Shield', 'Service', 'fixed', true, 10),
('Licenses & Permits', 'licenses', 'Business licenses, health permits, and certifications', 0.5, 'FileText', 'Service', 'fixed', true, 11),
('Miscellaneous', 'misc', 'Other operational expenses', 1.5, 'MoreHorizontal', 'Review', 'indirect', true, 12);

-- ============================================
-- TRIAL ENVIRONMENT READY
-- ============================================
-- Database is now ready for trial users
-- They will create their own restaurant and add data

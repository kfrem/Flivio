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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "menu_item_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"menu_item_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" real NOT NULL,
	"unit" text NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"discount_percent" real NOT NULL,
	"menu_item_id" integer,
	"target_profit" real,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_cost_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"cost_category_id" integer NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"custom_label" text,
	"custom_percentage" real
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"seating_capacity" integer NOT NULL,
	"avg_monthly_covers" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_price" real NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"lead_time_days" integer
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"contact_info" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

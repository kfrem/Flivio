-- Migration: Franchise system + weekly data + user roles
-- Run after 0000_bouncy_emma_frost.sql

-- Add role to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'individual' NOT NULL;

-- Add franchise_group_id to restaurants (nullable — independent restaurants have NULL)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "franchise_group_id" integer;

-- Tenant/subscription columns (may already exist; safe to run with IF NOT EXISTS)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "tenant_type" text DEFAULT 'trial' NOT NULL;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "subscription_tier" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'active';
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "trial_expires_at" timestamp;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weekly_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"week_number" integer NOT NULL,
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
CREATE TABLE IF NOT EXISTS "franchise_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" varchar NOT NULL,
	"approved_supplier_policy" text DEFAULT 'recommended' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "franchise_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"franchise_group_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"role" text DEFAULT 'franchisee' NOT NULL,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "franchise_approved_suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"franchise_group_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"contact_info" text,
	"ingredient_name" text,
	"contracted_price" real,
	"unit" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_price_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"franchise_group_id" integer NOT NULL,
	"ingredient_name" text NOT NULL,
	"supplier_name" text NOT NULL,
	"unit_price" real NOT NULL,
	"unit" text NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"reported_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_restaurant_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"restaurant_id" integer NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"granted_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
-- Useful indexes for performance
CREATE INDEX IF NOT EXISTS "weekly_data_restaurant_idx" ON "weekly_data" ("restaurant_id", "year", "week_number");
CREATE INDEX IF NOT EXISTS "franchise_memberships_group_idx" ON "franchise_memberships" ("franchise_group_id");
CREATE INDEX IF NOT EXISTS "franchise_memberships_restaurant_idx" ON "franchise_memberships" ("restaurant_id");
CREATE INDEX IF NOT EXISTS "supplier_price_reports_group_idx" ON "supplier_price_reports" ("franchise_group_id", "ingredient_name");
CREATE INDEX IF NOT EXISTS "supplier_price_reports_restaurant_idx" ON "supplier_price_reports" ("restaurant_id");

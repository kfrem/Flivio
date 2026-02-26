import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  seatingCapacity: integer("seating_capacity").notNull(),
  avgMonthlyCovers: integer("avg_monthly_covers").notNull(),
  tenantType: text("tenant_type").notNull().default("trial"), // 'demo', 'trial', or 'paid'
  subscriptionTier: text("subscription_tier"), // 'starter', 'professional', 'enterprise'
  subscriptionStatus: text("subscription_status").default("active"), // 'active', 'cancelled', 'expired'
  trialExpiresAt: timestamp("trial_expires_at"),
  franchiseGroupId: integer("franchise_group_id"), // null = independent restaurant
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const monthlyData = pgTable("monthly_data", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  revenue: real("revenue").notNull(),
  foodCost: real("food_cost").notNull(),
  labourCost: real("labour_cost").notNull(),
  energyCost: real("energy_cost").notNull(),
  rentCost: real("rent_cost").notNull(),
  marketingCost: real("marketing_cost").notNull(),
  suppliesCost: real("supplies_cost").notNull(),
  technologyCost: real("technology_cost").notNull(),
  wasteCost: real("waste_cost").notNull(),
  deliveryRevenue: real("delivery_revenue").notNull(),
  dineInRevenue: real("dine_in_revenue").notNull(),
  takeawayRevenue: real("takeaway_revenue").notNull(),
  totalCovers: integer("total_covers").notNull(),
  avgTicketSize: real("avg_ticket_size").notNull(),
  repeatCustomerRate: real("repeat_customer_rate").notNull(),
});

export const costCategories = pgTable("cost_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  description: text("description").notNull(),
  defaultPercentage: real("default_percentage").notNull(),
  icon: text("icon").notNull(),
  processStage: text("process_stage").notNull(),
  classification: text("classification").notNull().default("direct"),
  isDefault: boolean("is_default").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const restaurantCostItems = pgTable("restaurant_cost_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  costCategoryId: integer("cost_category_id").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  customLabel: text("custom_label"),
  customPercentage: real("custom_percentage"),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  contactInfo: text("contact_info"),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  currentPrice: real("current_price").notNull(),
  previousPrice: real("previous_price"),
  category: text("category").notNull(),
  classification: text("classification").notNull().default("direct"),
  vatRate: real("vat_rate").default(20),
  vatIncluded: boolean("vat_included").default(true),
});

export const supplierIngredients = pgTable("supplier_ingredients", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  ingredientId: integer("ingredient_id").notNull(),
  unitPrice: real("unit_price").notNull(),
  isPreferred: boolean("is_preferred").notNull().default(false),
  leadTimeDays: integer("lead_time_days"),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  sellingPrice: real("selling_price").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  outputVatRate: real("output_vat_rate").default(20),
  vatIncluded: boolean("vat_included").default(true),
});

export const menuItemIngredients = pgTable("menu_item_ingredients", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull(),
  ingredientId: integer("ingredient_id").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  discountPercent: real("discount_percent").notNull(),
  menuItemId: integer("menu_item_id"),
  targetProfit: real("target_profit"),
  isActive: boolean("is_active").notNull().default(true),
});

// Insert schemas
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const insertMonthlyDataSchema = createInsertSchema(monthlyData).omit({ id: true });
export const insertCostCategorySchema = createInsertSchema(costCategories).omit({ id: true });
export const insertRestaurantCostItemSchema = createInsertSchema(restaurantCostItems).omit({ id: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertIngredientSchema = createInsertSchema(ingredients).omit({ id: true });
export const insertSupplierIngredientSchema = createInsertSchema(supplierIngredients).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertMenuItemIngredientSchema = createInsertSchema(menuItemIngredients).omit({ id: true });
export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true });

// Types
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertMonthlyData = z.infer<typeof insertMonthlyDataSchema>;
export type MonthlyData = typeof monthlyData.$inferSelect;
export type CostCategory = typeof costCategories.$inferSelect;
export type InsertCostCategory = z.infer<typeof insertCostCategorySchema>;
export type RestaurantCostItem = typeof restaurantCostItems.$inferSelect;
export type InsertRestaurantCostItem = z.infer<typeof insertRestaurantCostItemSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type SupplierIngredient = typeof supplierIngredients.$inferSelect;
export type InsertSupplierIngredient = z.infer<typeof insertSupplierIngredientSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItemIngredient = typeof menuItemIngredients.$inferSelect;
export type InsertMenuItemIngredient = z.infer<typeof insertMenuItemIngredientSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("individual"), // 'individual' | 'franchisee' | 'franchisor' | 'admin'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Weekly Data ─────────────────────────────────────────────────────────────
export const weeklyData = pgTable("weekly_data", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  weekNumber: integer("week_number").notNull(), // ISO week 1-53
  year: integer("year").notNull(),
  revenue: real("revenue").notNull(),
  foodCost: real("food_cost").notNull(),
  labourCost: real("labour_cost").notNull(),
  energyCost: real("energy_cost").notNull(),
  rentCost: real("rent_cost").notNull(),
  marketingCost: real("marketing_cost").notNull(),
  suppliesCost: real("supplies_cost").notNull(),
  technologyCost: real("technology_cost").notNull(),
  wasteCost: real("waste_cost").notNull(),
  deliveryRevenue: real("delivery_revenue").notNull(),
  dineInRevenue: real("dine_in_revenue").notNull(),
  takeawayRevenue: real("takeaway_revenue").notNull(),
  totalCovers: integer("total_covers").notNull(),
  avgTicketSize: real("avg_ticket_size").notNull(),
  repeatCustomerRate: real("repeat_customer_rate").notNull(),
});

// ── Franchise Groups (the brand entity) ─────────────────────────────────────
export const franchiseGroups = pgTable("franchise_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(), // user who manages this brand
  // 'recommended' = advisory only, 'required' = must use approved suppliers
  approvedSupplierPolicy: text("approved_supplier_policy").notNull().default("recommended"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── Franchise Memberships (restaurants ↔ groups) ─────────────────────────────
export const franchiseMemberships = pgTable("franchise_memberships", {
  id: serial("id").primaryKey(),
  franchiseGroupId: integer("franchise_group_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  role: text("role").notNull().default("franchisee"), // 'franchisor' | 'franchisee'
  joinedAt: timestamp("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

// ── Franchise Approved Suppliers (set by franchisor) ─────────────────────────
export const franchiseApprovedSuppliers = pgTable("franchise_approved_suppliers", {
  id: serial("id").primaryKey(),
  franchiseGroupId: integer("franchise_group_id").notNull(),
  name: text("name").notNull(),               // supplier name
  category: text("category").notNull(),       // produce|protein|dairy|etc.
  contactInfo: text("contact_info"),
  ingredientName: text("ingredient_name"),    // which ingredient they supply
  contractedPrice: real("contracted_price"),  // negotiated rate, optional
  unit: text("unit"),                         // kg|litre|pack|etc.
  isRequired: boolean("is_required").notNull().default(false), // required vs recommended
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── Supplier Price Reports (franchisees submit actual prices paid) ────────────
// This is the intelligence pool that powers price variance analysis
export const supplierPriceReports = pgTable("supplier_price_reports", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  franchiseGroupId: integer("franchise_group_id").notNull(),
  ingredientName: text("ingredient_name").notNull(),
  supplierName: text("supplier_name").notNull(),
  unitPrice: real("unit_price").notNull(),
  unit: text("unit").notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  reportedAt: timestamp("reported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ── Inventory Items (stock tracking per ingredient) ──────────────────────────
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  ingredientId: integer("ingredient_id").notNull(),
  currentStock: real("current_stock").notNull().default(0),
  parLevel: real("par_level").notNull().default(0),
  unit: text("unit").notNull(),
  storageLocation: text("storage_location").notNull().default("dry_store"), // walk_in, dry_store, freezer, bar
  lastCountDate: timestamp("last_count_date"),
  lastOrderDate: timestamp("last_order_date"),
});

// ── Waste Logs (track food waste events) ─────────────────────────────────────
export const wasteLogs = pgTable("waste_logs", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  ingredientId: integer("ingredient_id"),
  itemName: text("item_name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  costPerUnit: real("cost_per_unit").notNull(),
  totalCost: real("total_cost").notNull(),
  reason: text("reason").notNull(), // spoilage, overproduction, plate_waste, expired, dropped, other
  date: timestamp("date").notNull().default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
});

// ── User-Restaurant Access (multi-restaurant access control) ─────────────────
export const userRestaurantAccess = pgTable("user_restaurant_access", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  role: text("role").notNull().default("owner"), // 'owner' | 'manager' | 'viewer'
  grantedAt: timestamp("granted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertWeeklyDataSchema = createInsertSchema(weeklyData).omit({ id: true });
export const insertFranchiseGroupSchema = createInsertSchema(franchiseGroups).omit({ id: true, createdAt: true });
export const insertFranchiseMembershipSchema = createInsertSchema(franchiseMemberships).omit({ id: true, joinedAt: true });
export const insertFranchiseApprovedSupplierSchema = createInsertSchema(franchiseApprovedSuppliers).omit({ id: true, createdAt: true });
export const insertSupplierPriceReportSchema = createInsertSchema(supplierPriceReports).omit({ id: true, reportedAt: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true });
export const insertWasteLogSchema = createInsertSchema(wasteLogs).omit({ id: true, date: true });
export const insertUserRestaurantAccessSchema = createInsertSchema(userRestaurantAccess).omit({ id: true, grantedAt: true });

// Types
export type WeeklyData = typeof weeklyData.$inferSelect;
export type InsertWeeklyData = z.infer<typeof insertWeeklyDataSchema>;
export type FranchiseGroup = typeof franchiseGroups.$inferSelect;
export type InsertFranchiseGroup = z.infer<typeof insertFranchiseGroupSchema>;
export type FranchiseMembership = typeof franchiseMemberships.$inferSelect;
export type InsertFranchiseMembership = z.infer<typeof insertFranchiseMembershipSchema>;
export type FranchiseApprovedSupplier = typeof franchiseApprovedSuppliers.$inferSelect;
export type InsertFranchiseApprovedSupplier = z.infer<typeof insertFranchiseApprovedSupplierSchema>;
export type SupplierPriceReport = typeof supplierPriceReports.$inferSelect;
export type InsertSupplierPriceReport = z.infer<typeof insertSupplierPriceReportSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type WasteLog = typeof wasteLogs.$inferSelect;
export type InsertWasteLog = z.infer<typeof insertWasteLogSchema>;
export type UserRestaurantAccess = typeof userRestaurantAccess.$inferSelect;
export type InsertUserRestaurantAccess = z.infer<typeof insertUserRestaurantAccessSchema>;

export const DEFAULT_COST_CATEGORIES: Omit<InsertCostCategory, "isDefault">[] = [
  { name: "Food & Ingredients", key: "foodCost", description: "Raw ingredients, beverages, and consumables", defaultPercentage: 30, icon: "ShoppingCart", processStage: "procurement", classification: "direct", sortOrder: 1 },
  { name: "Labour", key: "labourCost", description: "Staff wages, benefits, and payroll taxes", defaultPercentage: 28, icon: "Users", processStage: "preparation", classification: "direct", sortOrder: 2 },
  { name: "Energy & Utilities", key: "energyCost", description: "Gas, electric, water, and waste disposal", defaultPercentage: 7, icon: "Zap", processStage: "cooking", classification: "indirect", sortOrder: 3 },
  { name: "Rent & Rates", key: "rentCost", description: "Property lease, business rates, insurance", defaultPercentage: 8, icon: "Building2", processStage: "fixed", classification: "overhead", sortOrder: 4 },
  { name: "Marketing", key: "marketingCost", description: "Advertising, social media, promotions", defaultPercentage: 4, icon: "Megaphone", processStage: "aftersales", classification: "overhead", sortOrder: 5 },
  { name: "Supplies & Equipment", key: "suppliesCost", description: "Cleaning, tableware, disposables, small equipment", defaultPercentage: 3, icon: "Package", processStage: "storage", classification: "indirect", sortOrder: 6 },
  { name: "Technology", key: "technologyCost", description: "POS system, booking software, WiFi", defaultPercentage: 1, icon: "Monitor", processStage: "service", classification: "overhead", sortOrder: 7 },
  { name: "Food Waste", key: "wasteCost", description: "Spoilage, over-production, plate waste", defaultPercentage: 3, icon: "Trash2", processStage: "waste", classification: "indirect", sortOrder: 8 },
  { name: "Packaging & Delivery", key: "deliveryCost", description: "Takeaway containers, delivery platform fees", defaultPercentage: 2, icon: "Truck", processStage: "service", classification: "direct", sortOrder: 9 },
  { name: "Training & Development", key: "trainingCost", description: "Staff training, certification, development", defaultPercentage: 1, icon: "GraduationCap", processStage: "preparation", classification: "overhead", sortOrder: 10 },
  { name: "Maintenance & Repairs", key: "maintenanceCost", description: "Equipment servicing, building maintenance", defaultPercentage: 2, icon: "Wrench", processStage: "fixed", classification: "indirect", sortOrder: 11 },
  { name: "Licenses & Compliance", key: "licenseCost", description: "Alcohol license, food hygiene, permits", defaultPercentage: 1, icon: "Shield", processStage: "fixed", classification: "overhead", sortOrder: 12 },
];

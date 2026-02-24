import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  restaurants, monthlyData, costCategories, restaurantCostItems,
  suppliers, ingredients, supplierIngredients, menuItems, menuItemIngredients, promotions,
  users, weeklyData, franchiseGroups, franchiseMemberships, franchiseApprovedSuppliers,
  supplierPriceReports, userRestaurantAccess,
  type Restaurant, type InsertRestaurant,
  type MonthlyData, type InsertMonthlyData,
  type CostCategory, type InsertCostCategory,
  type RestaurantCostItem, type InsertRestaurantCostItem,
  type Supplier, type InsertSupplier,
  type Ingredient, type InsertIngredient,
  type SupplierIngredient, type InsertSupplierIngredient,
  type MenuItem, type InsertMenuItem,
  type MenuItemIngredient, type InsertMenuItemIngredient,
  type Promotion, type InsertPromotion,
  type User, type InsertUser,
  type WeeklyData, type InsertWeeklyData,
  type FranchiseGroup, type InsertFranchiseGroup,
  type FranchiseMembership, type InsertFranchiseMembership,
  type FranchiseApprovedSupplier, type InsertFranchiseApprovedSupplier,
  type SupplierPriceReport, type InsertSupplierPriceReport,
} from "@shared/schema";

export interface IStorage {
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getFirstRestaurant(): Promise<Restaurant | undefined>;
  createRestaurant(data: InsertRestaurant): Promise<Restaurant>;
  getAllRestaurants(): Promise<Restaurant[]>;

  getMonthlyData(restaurantId: number): Promise<MonthlyData[]>;
  getAllMonthlyData(): Promise<MonthlyData[]>;
  createMonthlyData(data: InsertMonthlyData): Promise<MonthlyData>;

  getMonthlyDataCount(): Promise<number>;
  getRestaurantCount(): Promise<number>;

  getAllCostCategories(): Promise<CostCategory[]>;
  createCostCategory(data: InsertCostCategory): Promise<CostCategory>;
  getCostCategoryCount(): Promise<number>;

  getRestaurantCostItems(restaurantId: number): Promise<RestaurantCostItem[]>;
  createRestaurantCostItem(data: InsertRestaurantCostItem): Promise<RestaurantCostItem>;
  updateRestaurantCostItem(id: number, data: Partial<InsertRestaurantCostItem>): Promise<RestaurantCostItem>;
  deleteRestaurantCostItems(restaurantId: number): Promise<void>;

  getSuppliers(restaurantId: number): Promise<Supplier[]>;
  createSupplier(data: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;

  getIngredients(restaurantId: number): Promise<Ingredient[]>;
  createIngredient(data: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, data: Partial<InsertIngredient>): Promise<Ingredient>;
  deleteIngredient(id: number): Promise<void>;

  getSupplierIngredients(supplierId: number): Promise<SupplierIngredient[]>;
  getSupplierIngredientsByIngredient(ingredientId: number): Promise<SupplierIngredient[]>;
  createSupplierIngredient(data: InsertSupplierIngredient): Promise<SupplierIngredient>;
  deleteSupplierIngredient(id: number): Promise<void>;

  getMenuItems(restaurantId: number): Promise<MenuItem[]>;
  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]>;
  createMenuItemIngredient(data: InsertMenuItemIngredient): Promise<MenuItemIngredient>;
  deleteMenuItemIngredients(menuItemId: number): Promise<void>;

  getPromotions(restaurantId: number): Promise<Promotion[]>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion>;
  deletePromotion(id: number): Promise<void>;

  // User methods
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;

  // Weekly Data
  getWeeklyData(restaurantId: number): Promise<WeeklyData[]>;
  getWeeklyDataByPeriod(restaurantId: number, weekNumber: number, year: number): Promise<WeeklyData | undefined>;
  createWeeklyData(data: InsertWeeklyData): Promise<WeeklyData>;

  // Franchise Groups
  getFranchiseGroup(id: number): Promise<FranchiseGroup | undefined>;
  getFranchiseGroupsByOwner(ownerId: string): Promise<FranchiseGroup[]>;
  createFranchiseGroup(data: InsertFranchiseGroup): Promise<FranchiseGroup>;
  updateFranchiseGroup(id: number, data: Partial<InsertFranchiseGroup>): Promise<FranchiseGroup>;

  // Franchise Memberships
  getFranchiseMemberships(franchiseGroupId: number): Promise<FranchiseMembership[]>;
  getRestaurantFranchiseMembership(restaurantId: number): Promise<FranchiseMembership | undefined>;
  createFranchiseMembership(data: InsertFranchiseMembership): Promise<FranchiseMembership>;
  deleteFranchiseMembership(id: number): Promise<void>;
  updateFranchiseMembership(id: number, data: Partial<InsertFranchiseMembership>): Promise<FranchiseMembership>;

  // Franchise Approved Suppliers
  getFranchiseApprovedSuppliers(franchiseGroupId: number): Promise<FranchiseApprovedSupplier[]>;
  createFranchiseApprovedSupplier(data: InsertFranchiseApprovedSupplier): Promise<FranchiseApprovedSupplier>;
  updateFranchiseApprovedSupplier(id: number, data: Partial<InsertFranchiseApprovedSupplier>): Promise<FranchiseApprovedSupplier>;
  deleteFranchiseApprovedSupplier(id: number): Promise<void>;

  // Supplier Price Reports
  getSupplierPriceReports(franchiseGroupId: number): Promise<SupplierPriceReport[]>;
  getRestaurantSupplierPriceReports(restaurantId: number): Promise<SupplierPriceReport[]>;
  createSupplierPriceReport(data: InsertSupplierPriceReport): Promise<SupplierPriceReport>;

  // Franchise Network Analytics
  getFranchiseNetworkMonthlyData(franchiseGroupId: number): Promise<{ restaurant: Restaurant; monthlyData: MonthlyData[] }[]>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [result] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result;
  }

  async getFirstRestaurant(): Promise<Restaurant | undefined> {
    const [result] = await db.select().from(restaurants).limit(1);
    return result;
  }

  async createRestaurant(data: InsertRestaurant): Promise<Restaurant> {
    const [result] = await db.insert(restaurants).values(data).returning();
    return result;
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return db.select().from(restaurants);
  }

  async getMonthlyData(restaurantId: number): Promise<MonthlyData[]> {
    return db.select().from(monthlyData).where(eq(monthlyData.restaurantId, restaurantId));
  }

  async getAllMonthlyData(): Promise<MonthlyData[]> {
    return db.select().from(monthlyData);
  }

  async createMonthlyData(data: InsertMonthlyData): Promise<MonthlyData> {
    const [result] = await db.insert(monthlyData).values(data).returning();
    return result;
  }

  async getMonthlyDataCount(): Promise<number> {
    const result = await db.select().from(monthlyData);
    return result.length;
  }

  async getRestaurantCount(): Promise<number> {
    const result = await db.select().from(restaurants);
    return result.length;
  }

  async getAllCostCategories(): Promise<CostCategory[]> {
    return db.select().from(costCategories);
  }

  async createCostCategory(data: InsertCostCategory): Promise<CostCategory> {
    const [result] = await db.insert(costCategories).values(data).returning();
    return result;
  }

  async getCostCategoryCount(): Promise<number> {
    const result = await db.select().from(costCategories);
    return result.length;
  }

  async getRestaurantCostItems(restaurantId: number): Promise<RestaurantCostItem[]> {
    return db.select().from(restaurantCostItems).where(eq(restaurantCostItems.restaurantId, restaurantId));
  }

  async createRestaurantCostItem(data: InsertRestaurantCostItem): Promise<RestaurantCostItem> {
    const [result] = await db.insert(restaurantCostItems).values(data).returning();
    return result;
  }

  async updateRestaurantCostItem(id: number, data: Partial<InsertRestaurantCostItem>): Promise<RestaurantCostItem> {
    const [result] = await db.update(restaurantCostItems).set(data).where(eq(restaurantCostItems.id, id)).returning();
    return result;
  }

  async deleteRestaurantCostItems(restaurantId: number): Promise<void> {
    await db.delete(restaurantCostItems).where(eq(restaurantCostItems.restaurantId, restaurantId));
  }

  async getSuppliers(restaurantId: number): Promise<Supplier[]> {
    return db.select().from(suppliers).where(eq(suppliers.restaurantId, restaurantId));
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    const [result] = await db.insert(suppliers).values(data).returning();
    return result;
  }

  async updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier> {
    const [result] = await db.update(suppliers).set(data).where(eq(suppliers.id, id)).returning();
    return result;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(supplierIngredients).where(eq(supplierIngredients.supplierId, id));
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async getIngredients(restaurantId: number): Promise<Ingredient[]> {
    return db.select().from(ingredients).where(eq(ingredients.restaurantId, restaurantId));
  }

  async createIngredient(data: InsertIngredient): Promise<Ingredient> {
    const [result] = await db.insert(ingredients).values(data).returning();
    return result;
  }

  async updateIngredient(id: number, data: Partial<InsertIngredient>): Promise<Ingredient> {
    const [result] = await db.update(ingredients).set(data).where(eq(ingredients.id, id)).returning();
    return result;
  }

  async deleteIngredient(id: number): Promise<void> {
    await db.delete(supplierIngredients).where(eq(supplierIngredients.ingredientId, id));
    await db.delete(menuItemIngredients).where(eq(menuItemIngredients.ingredientId, id));
    await db.delete(ingredients).where(eq(ingredients.id, id));
  }

  async getSupplierIngredients(supplierId: number): Promise<SupplierIngredient[]> {
    return db.select().from(supplierIngredients).where(eq(supplierIngredients.supplierId, supplierId));
  }

  async getSupplierIngredientsByIngredient(ingredientId: number): Promise<SupplierIngredient[]> {
    return db.select().from(supplierIngredients).where(eq(supplierIngredients.ingredientId, ingredientId));
  }

  async createSupplierIngredient(data: InsertSupplierIngredient): Promise<SupplierIngredient> {
    const [result] = await db.insert(supplierIngredients).values(data).returning();
    return result;
  }

  async deleteSupplierIngredient(id: number): Promise<void> {
    await db.delete(supplierIngredients).where(eq(supplierIngredients.id, id));
  }

  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    const [result] = await db.insert(menuItems).values(data).returning();
    return result;
  }

  async updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [result] = await db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
    return result;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItemIngredients).where(eq(menuItemIngredients.menuItemId, id));
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]> {
    return db.select().from(menuItemIngredients).where(eq(menuItemIngredients.menuItemId, menuItemId));
  }

  async createMenuItemIngredient(data: InsertMenuItemIngredient): Promise<MenuItemIngredient> {
    const [result] = await db.insert(menuItemIngredients).values(data).returning();
    return result;
  }

  async deleteMenuItemIngredients(menuItemId: number): Promise<void> {
    await db.delete(menuItemIngredients).where(eq(menuItemIngredients.menuItemId, menuItemId));
  }

  async getPromotions(restaurantId: number): Promise<Promotion[]> {
    return db.select().from(promotions).where(eq(promotions.restaurantId, restaurantId));
  }

  async createPromotion(data: InsertPromotion): Promise<Promotion> {
    const [result] = await db.insert(promotions).values(data).returning();
    return result;
  }

  async updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion> {
    const [result] = await db.update(promotions).set(data).where(eq(promotions.id, id)).returning();
    return result;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  // User methods
  async getUserById(id: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.username, username));
    return result;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(data).returning();
    return result;
  }

  // ── Weekly Data ─────────────────────────────────────────────────────────────
  async getWeeklyData(restaurantId: number): Promise<WeeklyData[]> {
    return db.select().from(weeklyData).where(eq(weeklyData.restaurantId, restaurantId));
  }

  async getWeeklyDataByPeriod(restaurantId: number, weekNumber: number, year: number): Promise<WeeklyData | undefined> {
    const [result] = await db.select().from(weeklyData).where(
      and(
        eq(weeklyData.restaurantId, restaurantId),
        eq(weeklyData.weekNumber, weekNumber),
        eq(weeklyData.year, year)
      )
    );
    return result;
  }

  async createWeeklyData(data: InsertWeeklyData): Promise<WeeklyData> {
    const [result] = await db.insert(weeklyData).values(data).returning();
    return result;
  }

  // ── Franchise Groups ─────────────────────────────────────────────────────────
  async getFranchiseGroup(id: number): Promise<FranchiseGroup | undefined> {
    const [result] = await db.select().from(franchiseGroups).where(eq(franchiseGroups.id, id));
    return result;
  }

  async getFranchiseGroupsByOwner(ownerId: string): Promise<FranchiseGroup[]> {
    return db.select().from(franchiseGroups).where(eq(franchiseGroups.ownerId, ownerId));
  }

  async createFranchiseGroup(data: InsertFranchiseGroup): Promise<FranchiseGroup> {
    const [result] = await db.insert(franchiseGroups).values(data).returning();
    return result;
  }

  async updateFranchiseGroup(id: number, data: Partial<InsertFranchiseGroup>): Promise<FranchiseGroup> {
    const [result] = await db.update(franchiseGroups).set(data).where(eq(franchiseGroups.id, id)).returning();
    return result;
  }

  // ── Franchise Memberships ────────────────────────────────────────────────────
  async getFranchiseMemberships(franchiseGroupId: number): Promise<FranchiseMembership[]> {
    return db.select().from(franchiseMemberships).where(
      and(eq(franchiseMemberships.franchiseGroupId, franchiseGroupId), eq(franchiseMemberships.isActive, true))
    );
  }

  async getRestaurantFranchiseMembership(restaurantId: number): Promise<FranchiseMembership | undefined> {
    const [result] = await db.select().from(franchiseMemberships).where(
      and(eq(franchiseMemberships.restaurantId, restaurantId), eq(franchiseMemberships.isActive, true))
    );
    return result;
  }

  async createFranchiseMembership(data: InsertFranchiseMembership): Promise<FranchiseMembership> {
    const [result] = await db.insert(franchiseMemberships).values(data).returning();
    return result;
  }

  async updateFranchiseMembership(id: number, data: Partial<InsertFranchiseMembership>): Promise<FranchiseMembership> {
    const [result] = await db.update(franchiseMemberships).set(data).where(eq(franchiseMemberships.id, id)).returning();
    return result;
  }

  async deleteFranchiseMembership(id: number): Promise<void> {
    await db.update(franchiseMemberships).set({ isActive: false }).where(eq(franchiseMemberships.id, id));
  }

  // ── Franchise Approved Suppliers ─────────────────────────────────────────────
  async getFranchiseApprovedSuppliers(franchiseGroupId: number): Promise<FranchiseApprovedSupplier[]> {
    return db.select().from(franchiseApprovedSuppliers).where(eq(franchiseApprovedSuppliers.franchiseGroupId, franchiseGroupId));
  }

  async createFranchiseApprovedSupplier(data: InsertFranchiseApprovedSupplier): Promise<FranchiseApprovedSupplier> {
    const [result] = await db.insert(franchiseApprovedSuppliers).values(data).returning();
    return result;
  }

  async updateFranchiseApprovedSupplier(id: number, data: Partial<InsertFranchiseApprovedSupplier>): Promise<FranchiseApprovedSupplier> {
    const [result] = await db.update(franchiseApprovedSuppliers).set(data).where(eq(franchiseApprovedSuppliers.id, id)).returning();
    return result;
  }

  async deleteFranchiseApprovedSupplier(id: number): Promise<void> {
    await db.delete(franchiseApprovedSuppliers).where(eq(franchiseApprovedSuppliers.id, id));
  }

  // ── Supplier Price Reports ───────────────────────────────────────────────────
  async getSupplierPriceReports(franchiseGroupId: number): Promise<SupplierPriceReport[]> {
    return db.select().from(supplierPriceReports).where(eq(supplierPriceReports.franchiseGroupId, franchiseGroupId));
  }

  async getRestaurantSupplierPriceReports(restaurantId: number): Promise<SupplierPriceReport[]> {
    return db.select().from(supplierPriceReports).where(eq(supplierPriceReports.restaurantId, restaurantId));
  }

  async createSupplierPriceReport(data: InsertSupplierPriceReport): Promise<SupplierPriceReport> {
    const [result] = await db.insert(supplierPriceReports).values(data).returning();
    return result;
  }

  // ── Franchise Network Analytics ──────────────────────────────────────────────
  async getFranchiseNetworkMonthlyData(franchiseGroupId: number): Promise<{ restaurant: Restaurant; monthlyData: MonthlyData[] }[]> {
    const memberships = await db.select().from(franchiseMemberships).where(
      and(eq(franchiseMemberships.franchiseGroupId, franchiseGroupId), eq(franchiseMemberships.isActive, true))
    );
    const result = [];
    for (const membership of memberships) {
      const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, membership.restaurantId));
      if (!restaurant) continue;
      const data = await db.select().from(monthlyData).where(eq(monthlyData.restaurantId, membership.restaurantId));
      result.push({ restaurant, monthlyData: data });
    }
    return result;
  }
}

export const storage = new DatabaseStorage();

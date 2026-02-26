import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertRestaurantSchema, insertMonthlyDataSchema, insertCostCategorySchema,
  insertRestaurantCostItemSchema, insertSupplierSchema, insertIngredientSchema,
  insertSupplierIngredientSchema, insertMenuItemSchema, insertMenuItemIngredientSchema,
  insertPromotionSchema, insertWeeklyDataSchema, insertFranchiseGroupSchema,
  insertFranchiseMembershipSchema, insertFranchiseApprovedSupplierSchema, insertSupplierPriceReportSchema,
  insertInventoryItemSchema, insertWasteLogSchema,
  type MonthlyData,
} from "@shared/schema";
import { seedDatabase } from "./seed";

// ─── Comparison helpers ───────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_TO_Q = (month: string) => Math.ceil((MONTH_NAMES.indexOf(month) + 1) / 3);
const MONTH_TO_H = (month: string) => (MONTH_NAMES.indexOf(month) < 6 ? 1 : 2);

function sumData(rows: MonthlyData[]) {
  if (!rows.length) return null;
  const sum = rows.reduce((acc, d) => ({
    revenue: acc.revenue + d.revenue,
    foodCost: acc.foodCost + d.foodCost,
    labourCost: acc.labourCost + d.labourCost,
    energyCost: acc.energyCost + d.energyCost,
    rentCost: acc.rentCost + d.rentCost,
    marketingCost: acc.marketingCost + d.marketingCost,
    suppliesCost: acc.suppliesCost + d.suppliesCost,
    technologyCost: acc.technologyCost + d.technologyCost,
    wasteCost: acc.wasteCost + d.wasteCost,
    deliveryRevenue: acc.deliveryRevenue + d.deliveryRevenue,
    dineInRevenue: acc.dineInRevenue + d.dineInRevenue,
    takeawayRevenue: acc.takeawayRevenue + d.takeawayRevenue,
    totalCovers: acc.totalCovers + d.totalCovers,
  }), { revenue:0, foodCost:0, labourCost:0, energyCost:0, rentCost:0, marketingCost:0, suppliesCost:0, technologyCost:0, wasteCost:0, deliveryRevenue:0, dineInRevenue:0, takeawayRevenue:0, totalCovers:0 });
  const totalCosts = sum.foodCost + sum.labourCost + sum.energyCost + sum.rentCost + sum.marketingCost + sum.suppliesCost + sum.technologyCost + sum.wasteCost;
  return {
    ...sum,
    avgTicketSize: rows.reduce((a, d) => a + d.avgTicketSize, 0) / rows.length,
    repeatCustomerRate: rows.reduce((a, d) => a + d.repeatCustomerRate, 0) / rows.length,
    foodCostPercent: sum.revenue ? (sum.foodCost / sum.revenue) * 100 : 0,
    labourCostPercent: sum.revenue ? (sum.labourCost / sum.revenue) * 100 : 0,
    gpPercent: sum.revenue ? ((sum.revenue - totalCosts) / sum.revenue) * 100 : 0,
    months: rows.length,
  };
}

function pctChange(current: number, previous: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  try {
    await seedDatabase();
  } catch (err) {
    console.error("Seed warning (non-fatal):", err);
  }

  app.get("/api/restaurants/current", async (_req, res) => {
    try {
      const restaurant = await storage.getFirstRestaurant();
      if (!restaurant) {
        return res.status(404).json({ message: "No restaurant found" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.get("/api/restaurants", async (_req, res) => {
    try {
      const restaurants = await storage.getAllRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const parsed = insertRestaurantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const restaurant = await storage.createRestaurant(parsed.data);
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  app.get("/api/monthly-data", async (_req, res) => {
    try {
      const data = await storage.getAllMonthlyData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly data" });
    }
  });

  app.get("/api/monthly-data/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      const data = await storage.getMonthlyData(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly data" });
    }
  });

  app.post("/api/monthly-data", async (req, res) => {
    try {
      const parsed = insertMonthlyDataSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const entry = await storage.createMonthlyData(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create monthly data" });
    }
  });

  app.get("/api/cost-categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCostCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost categories" });
    }
  });

  app.post("/api/cost-categories", async (req, res) => {
    try {
      const parsed = insertCostCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const category = await storage.createCostCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cost category" });
    }
  });

  app.get("/api/restaurant-cost-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      const items = await storage.getRestaurantCostItems(restaurantId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost items" });
    }
  });

  app.post("/api/restaurant-cost-items", async (req, res) => {
    try {
      const parsed = insertRestaurantCostItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const item = await storage.createRestaurantCostItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cost item" });
    }
  });

  app.put("/api/restaurant-cost-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const item = await storage.updateRestaurantCostItem(id, req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cost item" });
    }
  });

  app.post("/api/restaurant-cost-items/bulk/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }
      await storage.deleteRestaurantCostItems(restaurantId);
      const items = req.body.items as any[];
      const created = [];
      for (const item of items) {
        const result = await storage.createRestaurantCostItem({
          ...item,
          restaurantId,
        });
        created.push(result);
      }
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to save cost items" });
    }
  });

  // Suppliers
  app.get("/api/suppliers/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getSuppliers(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const parsed = insertSupplierSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const supplier = await storage.createSupplier(parsed.data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const supplier = await storage.updateSupplier(id, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteSupplier(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Ingredients
  app.get("/api/ingredients/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getIngredients(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  app.post("/api/ingredients", async (req, res) => {
    try {
      const parsed = insertIngredientSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const ingredient = await storage.createIngredient(parsed.data);
      res.status(201).json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ingredient" });
    }
  });

  app.put("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const ingredient = await storage.updateIngredient(id, req.body);
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ingredient" });
    }
  });

  app.delete("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteIngredient(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  });

  // Supplier-Ingredient links
  app.get("/api/supplier-ingredients/:supplierId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      if (isNaN(supplierId)) return res.status(400).json({ message: "Invalid supplier ID" });
      const data = await storage.getSupplierIngredients(supplierId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier ingredients" });
    }
  });

  app.get("/api/ingredient-suppliers/:ingredientId", async (req, res) => {
    try {
      const ingredientId = parseInt(req.params.ingredientId);
      if (isNaN(ingredientId)) return res.status(400).json({ message: "Invalid ingredient ID" });
      const data = await storage.getSupplierIngredientsByIngredient(ingredientId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredient suppliers" });
    }
  });

  app.post("/api/supplier-ingredients", async (req, res) => {
    try {
      const parsed = insertSupplierIngredientSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const link = await storage.createSupplierIngredient(parsed.data);
      res.status(201).json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to link supplier ingredient" });
    }
  });

  app.delete("/api/supplier-ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteSupplierIngredient(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier ingredient" });
    }
  });

  // Menu Items
  app.get("/api/menu-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getMenuItems(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const parsed = insertMenuItemSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const menuItem = await storage.createMenuItem(parsed.data);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const menuItem = await storage.updateMenuItem(id, req.body);
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteMenuItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Menu Item Ingredients (recipe)
  app.get("/api/menu-item-ingredients/:menuItemId", async (req, res) => {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      if (isNaN(menuItemId)) return res.status(400).json({ message: "Invalid menu item ID" });
      const data = await storage.getMenuItemIngredients(menuItemId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe ingredients" });
    }
  });

  app.post("/api/menu-item-ingredients/bulk/:menuItemId", async (req, res) => {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      if (isNaN(menuItemId)) return res.status(400).json({ message: "Invalid menu item ID" });
      await storage.deleteMenuItemIngredients(menuItemId);
      const items = req.body.ingredients as any[];
      const created = [];
      for (const item of items) {
        const result = await storage.createMenuItemIngredient({
          menuItemId,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
        });
        created.push(result);
      }
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ message: "Failed to save recipe ingredients" });
    }
  });

  // Promotions
  app.get("/api/promotions/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getPromotions(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const parsed = insertPromotionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const promo = await storage.createPromotion(parsed.data);
      res.status(201).json(promo);
    } catch (error) {
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.put("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const promo = await storage.updatePromotion(id, req.body);
      res.json(promo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deletePromotion(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete promotion" });
    }
  });

  // Data Import - CSV/Excel
  app.post("/api/import/ingredients", async (req, res) => {
    try {
      const { restaurantId, data } = req.body;
      if (!restaurantId || !Array.isArray(data)) {
        return res.status(400).json({ message: "Missing restaurantId or data array" });
      }
      const created = [];
      for (const row of data) {
        const parsed = insertIngredientSchema.safeParse({
          restaurantId,
          name: row.name,
          unit: row.unit || "kg",
          currentPrice: parseFloat(row.currentPrice || row.price || "0"),
          previousPrice: row.previousPrice ? parseFloat(row.previousPrice) : null,
          category: row.category || "general",
          classification: row.classification || "direct",
        });
        if (parsed.success) {
          const ingredient = await storage.createIngredient(parsed.data);
          created.push(ingredient);
        }
      }
      res.status(201).json({ imported: created.length, items: created });
    } catch (error) {
      res.status(500).json({ message: "Failed to import ingredients" });
    }
  });

  app.post("/api/import/suppliers", async (req, res) => {
    try {
      const { restaurantId, data } = req.body;
      if (!restaurantId || !Array.isArray(data)) {
        return res.status(400).json({ message: "Missing restaurantId or data array" });
      }
      const created = [];
      for (const row of data) {
        const parsed = insertSupplierSchema.safeParse({
          restaurantId,
          name: row.name,
          contactInfo: row.contactInfo || row.contact || null,
          category: row.category || "general",
          isActive: true,
        });
        if (parsed.success) {
          const supplier = await storage.createSupplier(parsed.data);
          created.push(supplier);
        }
      }
      res.status(201).json({ imported: created.length, items: created });
    } catch (error) {
      res.status(500).json({ message: "Failed to import suppliers" });
    }
  });

  app.post("/api/import/menu-items", async (req, res) => {
    try {
      const { restaurantId, data } = req.body;
      if (!restaurantId || !Array.isArray(data)) {
        return res.status(400).json({ message: "Missing restaurantId or data array" });
      }
      const created = [];
      for (const row of data) {
        const parsed = insertMenuItemSchema.safeParse({
          restaurantId,
          name: row.name,
          category: row.category || "main",
          sellingPrice: parseFloat(row.sellingPrice || row.price || "0"),
          description: row.description || null,
          isActive: true,
        });
        if (parsed.success) {
          const menuItem = await storage.createMenuItem(parsed.data);
          created.push(menuItem);
        }
      }
      res.status(201).json({ imported: created.length, items: created });
    } catch (error) {
      res.status(500).json({ message: "Failed to import menu items" });
    }
  });

  // ── Weekly Data ────────────────────────────────────────────────────────────
  app.get("/api/weekly-data/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getWeeklyData(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly data" });
    }
  });

  app.post("/api/weekly-data", async (req, res) => {
    try {
      const parsed = insertWeeklyDataSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const entry = await storage.createWeeklyData(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create weekly data" });
    }
  });

  // ── Period Comparisons ─────────────────────────────────────────────────────
  // Quarterly: aggregates monthly_data → Q1 (Jan-Mar) Q2 (Apr-Jun) Q3 (Jul-Sep) Q4 (Oct-Dec)
  app.get("/api/comparisons/quarterly", async (req, res) => {
    try {
      const restaurantId = parseInt(req.query.restaurantId as string);
      const quarter = parseInt(req.query.quarter as string); // 1-4
      const year = parseInt(req.query.year as string);
      if (isNaN(restaurantId) || isNaN(quarter) || isNaN(year)) {
        return res.status(400).json({ message: "restaurantId, quarter, and year are required" });
      }
      const allData = await storage.getMonthlyData(restaurantId);

      const getQ = (q: number, y: number) => allData.filter(d => d.year === y && MONTH_TO_Q(d.month) === q);

      const prevQ = quarter === 1 ? 4 : quarter - 1;
      const prevYear = quarter === 1 ? year - 1 : year;

      const trend = [1,2,3,4].map(q => {
        const trendYear = q <= quarter ? year : year - 1;
        return { quarter: q, year: trendYear, ...sumData(getQ(q, trendYear)) };
      });

      res.json({
        current: { quarter, year, ...sumData(getQ(quarter, year)) },
        previous: { quarter: prevQ, year: prevYear, ...sumData(getQ(prevQ, prevYear)) },
        samePeriodLastYear: { quarter, year: year - 1, ...sumData(getQ(quarter, year - 1)) },
        trend,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to compute quarterly comparison" });
    }
  });

  // Half-yearly: H1 = Jan-Jun, H2 = Jul-Dec
  app.get("/api/comparisons/half-yearly", async (req, res) => {
    try {
      const restaurantId = parseInt(req.query.restaurantId as string);
      const half = parseInt(req.query.half as string); // 1 or 2
      const year = parseInt(req.query.year as string);
      if (isNaN(restaurantId) || isNaN(half) || isNaN(year)) {
        return res.status(400).json({ message: "restaurantId, half, and year are required" });
      }
      const allData = await storage.getMonthlyData(restaurantId);

      const getH = (h: number, y: number) => allData.filter(d => d.year === y && MONTH_TO_H(d.month) === h);

      const prevH = half === 1 ? 2 : 1;
      const prevYear = half === 1 ? year - 1 : year;

      res.json({
        current: { half, year, ...sumData(getH(half, year)) },
        previous: { half: prevH, year: prevYear, ...sumData(getH(prevH, prevYear)) },
        samePeriodLastYear: { half, year: year - 1, ...sumData(getH(half, year - 1)) },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to compute half-yearly comparison" });
    }
  });

  // Weekly comparison
  app.get("/api/comparisons/weekly", async (req, res) => {
    try {
      const restaurantId = parseInt(req.query.restaurantId as string);
      const weekNumber = parseInt(req.query.weekNumber as string);
      const year = parseInt(req.query.year as string);
      if (isNaN(restaurantId) || isNaN(weekNumber) || isNaN(year)) {
        return res.status(400).json({ message: "restaurantId, weekNumber, and year are required" });
      }
      const all = await storage.getWeeklyData(restaurantId);

      const find = (w: number, y: number) => all.find(d => d.weekNumber === w && d.year === y) || null;
      const prevW = weekNumber === 1 ? 52 : weekNumber - 1;
      const prevWYear = weekNumber === 1 ? year - 1 : year;

      const eightWeekTrend = Array.from({ length: 8 }, (_, i) => {
        let w = weekNumber - (7 - i);
        let y = year;
        if (w <= 0) { w += 52; y -= 1; }
        return find(w, y);
      });

      res.json({
        current: find(weekNumber, year),
        previous: find(prevW, prevWYear),
        samePeriodLastYear: find(weekNumber, year - 1),
        trend: eightWeekTrend,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to compute weekly comparison" });
    }
  });

  // ── Franchise Groups ───────────────────────────────────────────────────────
  app.get("/api/franchise-groups/owner/:ownerId", async (req, res) => {
    try {
      const groups = await storage.getFranchiseGroupsByOwner(req.params.ownerId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise groups" });
    }
  });

  app.get("/api/franchise-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const group = await storage.getFranchiseGroup(id);
      if (!group) return res.status(404).json({ message: "Franchise group not found" });
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise group" });
    }
  });

  app.post("/api/franchise-groups", async (req, res) => {
    try {
      const parsed = insertFranchiseGroupSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const group = await storage.createFranchiseGroup(parsed.data);
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to create franchise group" });
    }
  });

  app.put("/api/franchise-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const group = await storage.updateFranchiseGroup(id, req.body);
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to update franchise group" });
    }
  });

  // ── Franchise Memberships ──────────────────────────────────────────────────
  app.get("/api/franchise-memberships/:franchiseGroupId", async (req, res) => {
    try {
      const franchiseGroupId = parseInt(req.params.franchiseGroupId);
      if (isNaN(franchiseGroupId)) return res.status(400).json({ message: "Invalid ID" });
      const memberships = await storage.getFranchiseMemberships(franchiseGroupId);
      // Enrich with restaurant details
      const enriched = await Promise.all(memberships.map(async m => {
        const restaurant = await storage.getRestaurant(m.restaurantId);
        return { ...m, restaurant };
      }));
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch memberships" });
    }
  });

  app.get("/api/franchise-memberships/restaurant/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid ID" });
      const membership = await storage.getRestaurantFranchiseMembership(restaurantId);
      res.json(membership || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant franchise membership" });
    }
  });

  app.post("/api/franchise-memberships", async (req, res) => {
    try {
      const parsed = insertFranchiseMembershipSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const membership = await storage.createFranchiseMembership(parsed.data);
      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ message: "Failed to create membership" });
    }
  });

  app.delete("/api/franchise-memberships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteFranchiseMembership(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove membership" });
    }
  });

  // ── Franchise Approved Suppliers ───────────────────────────────────────────
  app.get("/api/franchise-approved-suppliers/:franchiseGroupId", async (req, res) => {
    try {
      const franchiseGroupId = parseInt(req.params.franchiseGroupId);
      if (isNaN(franchiseGroupId)) return res.status(400).json({ message: "Invalid ID" });
      const data = await storage.getFranchiseApprovedSuppliers(franchiseGroupId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch approved suppliers" });
    }
  });

  app.post("/api/franchise-approved-suppliers", async (req, res) => {
    try {
      const parsed = insertFranchiseApprovedSupplierSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const supplier = await storage.createFranchiseApprovedSupplier(parsed.data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to create approved supplier" });
    }
  });

  app.put("/api/franchise-approved-suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const supplier = await storage.updateFranchiseApprovedSupplier(id, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update approved supplier" });
    }
  });

  app.delete("/api/franchise-approved-suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteFranchiseApprovedSupplier(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete approved supplier" });
    }
  });

  // ── Supplier Price Reports ─────────────────────────────────────────────────
  // Franchisee submits actual prices they paid
  app.post("/api/supplier-price-reports", async (req, res) => {
    try {
      const parsed = insertSupplierPriceReportSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const report = await storage.createSupplierPriceReport(parsed.data);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit price report" });
    }
  });

  // Franchisor views all reports for the group
  app.get("/api/supplier-price-reports/group/:franchiseGroupId", async (req, res) => {
    try {
      const franchiseGroupId = parseInt(req.params.franchiseGroupId);
      if (isNaN(franchiseGroupId)) return res.status(400).json({ message: "Invalid ID" });
      const reports = await storage.getSupplierPriceReports(franchiseGroupId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price reports" });
    }
  });

  // Franchisee views their own reports
  app.get("/api/supplier-price-reports/restaurant/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid ID" });
      const reports = await storage.getRestaurantSupplierPriceReports(restaurantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant price reports" });
    }
  });

  // ── Franchise Analytics ────────────────────────────────────────────────────
  // Full network overview: all location performance + intelligence
  app.get("/api/franchise-analytics/:franchiseGroupId", async (req, res) => {
    try {
      const franchiseGroupId = parseInt(req.params.franchiseGroupId);
      if (isNaN(franchiseGroupId)) return res.status(400).json({ message: "Invalid ID" });

      const [group, networkData, approvedSuppliers, priceReports] = await Promise.all([
        storage.getFranchiseGroup(franchiseGroupId),
        storage.getFranchiseNetworkMonthlyData(franchiseGroupId),
        storage.getFranchiseApprovedSuppliers(franchiseGroupId),
        storage.getSupplierPriceReports(franchiseGroupId),
      ]);

      if (!group) return res.status(404).json({ message: "Franchise group not found" });

      // Build per-location summaries
      const locations = networkData.map(({ restaurant, monthlyData }) => {
        const summary = sumData(monthlyData);
        return { restaurant, summary, monthlyDataCount: monthlyData.length };
      });

      // Network aggregates
      const networkSummary = sumData(networkData.flatMap(n => n.monthlyData));

      // Supplier price intelligence: group by ingredient, compute variance
      const priceByIngredient: Record<string, { prices: { restaurantId: number; price: number }[]; unit: string }> = {};
      for (const r of priceReports) {
        if (!priceByIngredient[r.ingredientName]) {
          priceByIngredient[r.ingredientName] = { prices: [], unit: r.unit };
        }
        priceByIngredient[r.ingredientName].prices.push({ restaurantId: r.restaurantId, price: r.unitPrice });
      }
      const priceIntelligence = Object.entries(priceByIngredient).map(([ingredient, { prices, unit }]) => {
        const values = prices.map(p => p.price);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const variance = max - min;
        return { ingredient, unit, avg, min, max, variance, dataPoints: prices.length };
      }).sort((a, b) => b.variance - a.variance);

      res.json({
        group,
        networkSummary,
        locations,
        approvedSuppliers,
        priceIntelligence,
        totalLocations: locations.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise analytics" });
    }
  });

  // Franchisee intelligence: my prices vs anonymised network average
  app.get("/api/supplier-intelligence/:restaurantId/:franchiseGroupId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      const franchiseGroupId = parseInt(req.params.franchiseGroupId);
      if (isNaN(restaurantId) || isNaN(franchiseGroupId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }

      const [myReports, allReports, approvedSuppliers] = await Promise.all([
        storage.getRestaurantSupplierPriceReports(restaurantId),
        storage.getSupplierPriceReports(franchiseGroupId),
        storage.getFranchiseApprovedSuppliers(franchiseGroupId),
      ]);

      // For each ingredient I've reported, compute my latest price vs network avg
      const myLatestByIngredient: Record<string, typeof myReports[0]> = {};
      for (const r of myReports.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())) {
        if (!myLatestByIngredient[r.ingredientName]) myLatestByIngredient[r.ingredientName] = r;
      }

      // Network averages (excluding my own)
      const networkByIngredient: Record<string, number[]> = {};
      for (const r of allReports.filter(r => r.restaurantId !== restaurantId)) {
        if (!networkByIngredient[r.ingredientName]) networkByIngredient[r.ingredientName] = [];
        networkByIngredient[r.ingredientName].push(r.unitPrice);
      }

      const intelligence = Object.entries(myLatestByIngredient).map(([ingredient, myReport]) => {
        const networkPrices = networkByIngredient[ingredient] || [];
        const networkAvg = networkPrices.length ? networkPrices.reduce((a, b) => a + b, 0) / networkPrices.length : null;
        const difference = networkAvg !== null ? myReport.unitPrice - networkAvg : null;
        const differencePercent = networkAvg ? (difference! / networkAvg) * 100 : null;
        return {
          ingredient,
          unit: myReport.unit,
          myPrice: myReport.unitPrice,
          mySupplier: myReport.supplierName,
          networkAvg,
          difference,
          differencePercent,
          networkDataPoints: networkPrices.length,
        };
      }).sort((a, b) => (b.differencePercent || 0) - (a.differencePercent || 0));

      res.json({ intelligence, approvedSuppliers, myReports: Object.values(myLatestByIngredient) });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier intelligence" });
    }
  });

  // ── Inventory Items ────────────────────────────────────────────────────────
  app.get("/api/inventory-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getInventoryItems(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.post("/api/inventory-items", async (req, res) => {
    try {
      const parsed = insertInventoryItemSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const item = await storage.createInventoryItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const item = await storage.updateInventoryItem(id, req.body);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteInventoryItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // ── Waste Logs ─────────────────────────────────────────────────────────────
  app.get("/api/waste-logs/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });
      const data = await storage.getWasteLogs(restaurantId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waste logs" });
    }
  });

  app.post("/api/waste-logs", async (req, res) => {
    try {
      const parsed = insertWasteLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      const log = await storage.createWasteLog(parsed.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: "Failed to create waste log" });
    }
  });

  app.delete("/api/waste-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteWasteLog(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete waste log" });
    }
  });

  // ── Waste Analytics (computed on the fly, no extra storage) ────────────────
  app.get("/api/waste-analytics/:restaurantId", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.restaurantId);
      if (isNaN(restaurantId)) return res.status(400).json({ message: "Invalid restaurant ID" });

      const [logs, monthly] = await Promise.all([
        storage.getWasteLogs(restaurantId),
        storage.getMonthlyData(restaurantId),
      ]);

      const totalWasteCost = logs.reduce((sum, l) => sum + l.totalCost, 0);
      const totalPurchases = monthly.reduce((sum, m) => sum + m.foodCost, 0);
      const wastePercentage = totalPurchases > 0 ? (totalWasteCost / totalPurchases) * 100 : 0;

      // By reason
      const byReason: Record<string, { count: number; cost: number }> = {};
      for (const log of logs) {
        if (!byReason[log.reason]) byReason[log.reason] = { count: 0, cost: 0 };
        byReason[log.reason].count++;
        byReason[log.reason].cost += log.totalCost;
      }

      // By month
      const byMonth: Record<string, number> = {};
      for (const log of logs) {
        const d = new Date(log.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth[key] = (byMonth[key] || 0) + log.totalCost;
      }

      // Top wasted items
      const byItem: Record<string, { count: number; cost: number }> = {};
      for (const log of logs) {
        if (!byItem[log.itemName]) byItem[log.itemName] = { count: 0, cost: 0 };
        byItem[log.itemName].count++;
        byItem[log.itemName].cost += log.totalCost;
      }
      const topWastedItems = Object.entries(byItem)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);

      res.json({
        totalWasteCost,
        totalPurchases,
        wastePercentage,
        totalLogs: logs.length,
        byReason: Object.entries(byReason).map(([reason, data]) => ({ reason, ...data })).sort((a, b) => b.cost - a.cost),
        byMonth: Object.entries(byMonth).map(([month, cost]) => ({ month, cost })).sort((a, b) => a.month.localeCompare(b.month)),
        topWastedItems,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to compute waste analytics" });
    }
  });

  return httpServer;
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import type { MonthlyData, Ingredient, Supplier, MenuItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, TrendingUp, TrendingDown,
  Layers, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
};

const COST_LABELS: Record<string, string> = {
  foodCost: "Food & Ingredients",
  labourCost: "Labour",
  energyCost: "Energy & Utilities",
  rentCost: "Rent & Rates",
  marketingCost: "Marketing",
  suppliesCost: "Supplies & Equipment",
  technologyCost: "Technology",
  wasteCost: "Food Waste",
};

export default function DrillDown() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const category = params.get("category") || "foodCost";
  const label = params.get("label") || COST_LABELS[category] || category;

  const { data: monthlyDataAll = [] } = useQuery<MonthlyData[]>({ queryKey: ["/api/monthly-data"] });
  const { data: restaurant } = useQuery<any>({ queryKey: ["/api/restaurants/current"] });
  const restaurantId = restaurant?.id || 1;
  const { data: allIngredients = [] } = useQuery<Ingredient[]>({ queryKey: ["/api/ingredients", restaurantId] });
  const { data: allSuppliers = [] } = useQuery<Supplier[]>({ queryKey: ["/api/suppliers", restaurantId] });
  const { data: allMenuItems = [] } = useQuery<MenuItem[]>({ queryKey: ["/api/menu-items", restaurantId] });

  const latestData = monthlyDataAll.length > 0 ? monthlyDataAll[monthlyDataAll.length - 1] : null;
  const prevData = monthlyDataAll.length > 1 ? monthlyDataAll[monthlyDataAll.length - 2] : null;

  const currentValue = latestData ? (latestData as any)[category] as number || 0 : 0;
  const prevValue = prevData ? (prevData as any)[category] as number || 0 : 0;
  const change = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
  const pctOfRevenue = latestData && latestData.revenue > 0 ? (currentValue / latestData.revenue) * 100 : 0;

  const trendData = monthlyDataAll.map((d) => ({
    month: `${d.month.substring(0, 3)} ${d.year}`,
    value: (d as any)[category] as number || 0,
    pctOfRevenue: d.revenue > 0 ? (((d as any)[category] as number || 0) / d.revenue * 100) : 0,
  }));

  const weeklyBreakdown = useMemo(() => {
    if (!currentValue) return [];
    const weekly = currentValue / 4.345;
    return ["Week 1", "Week 2", "Week 3", "Week 4"].map((name, i) => {
      const factor = [0.92, 1.02, 1.08, 0.98][i];
      return { name, value: Math.round(weekly * factor) };
    });
  }, [currentValue]);

  const relatedData = useMemo(() => {
    if (category === "foodCost") {
      return {
        type: "ingredients" as const,
        items: allIngredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          detail: `£${ing.currentPrice.toFixed(2)}/${ing.unit}`,
          change: ing.previousPrice ? ((ing.currentPrice - ing.previousPrice) / ing.previousPrice) * 100 : 0,
          category: ing.category,
        })),
      };
    }
    if (category === "suppliesCost") {
      return {
        type: "suppliers" as const,
        items: allSuppliers.map((s) => ({
          id: s.id,
          name: s.name,
          detail: s.category,
          change: 0,
          category: s.category,
        })),
      };
    }
    return { type: "entries" as const, items: [] as any[] };
  }, [category, allIngredients, allSuppliers]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-drill-down">
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/app/expense-intelligence">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <Link href="/app">
            <span className="hover:text-foreground cursor-pointer">Dashboard</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/app/expense-intelligence">
            <span className="hover:text-foreground cursor-pointer">Expenses</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{label}</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold" data-testid="text-drill-title">{label}</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed breakdown and trend analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Current Month</span>
            <div className="text-xl font-bold" data-testid="text-current-value">£{currentValue.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">{latestData?.month} {latestData?.year}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Previous Month</span>
            <div className="text-xl font-bold" data-testid="text-prev-value">£{prevValue.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">{prevData?.month} {prevData?.year}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Month-on-Month Change</span>
            <div className={`text-xl font-bold flex items-center gap-1 ${change > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`} data-testid="text-change">
              {change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(change).toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground">{change > 0 ? "increase" : "decrease"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">% of Revenue</span>
            <div className="text-xl font-bold" data-testid="text-pct-revenue">{pctOfRevenue.toFixed(1)}%</div>
            <span className="text-xs text-muted-foreground">of £{latestData?.revenue.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-drill-trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v: number) => [`£${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="hsl(24, 95%, 53%)" strokeWidth={2} name={label} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Weekly Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-drill-weekly">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBreakdown} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                  <Tooltip formatter={(v: number) => [`£${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(24, 95%, 53%)" name={label} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {relatedData.items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Source Data - {relatedData.type === "ingredients" ? "Ingredients" : "Suppliers"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedData.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30" data-testid={`source-item-${item.id}`}>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    {item.change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs ${item.change > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {item.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(item.change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {relatedData.items.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              This cost category shows monthly aggregated data from your financial entries.
              Add more detailed data to see the full breakdown.
            </p>
            <Link href="/app/add-data">
              <Button variant="outline" className="mt-3" data-testid="button-add-data">
                Add Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

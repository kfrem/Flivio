import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { MonthlyData, CostCategory, Ingredient } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight,
  BarChart3, Target, Zap, Layers,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
};

const COST_KEYS: { key: keyof MonthlyData; label: string; target: number; classification: string }[] = [
  { key: "foodCost", label: "Food & Ingredients", target: 32, classification: "direct" },
  { key: "labourCost", label: "Labour", target: 30, classification: "direct" },
  { key: "energyCost", label: "Energy & Utilities", target: 8, classification: "indirect" },
  { key: "rentCost", label: "Rent & Rates", target: 8, classification: "overhead" },
  { key: "marketingCost", label: "Marketing", target: 4, classification: "overhead" },
  { key: "suppliesCost", label: "Supplies", target: 3, classification: "indirect" },
  { key: "technologyCost", label: "Technology", target: 1, classification: "overhead" },
  { key: "wasteCost", label: "Food Waste", target: 3, classification: "indirect" },
];

export default function ExpenseIntelligence() {
  const { data: monthlyDataAll = [] } = useQuery<MonthlyData[]>({ queryKey: ["/api/monthly-data"] });
  const { data: restaurant } = useQuery<any>({ queryKey: ["/api/restaurants/current"] });
  const restaurantId = restaurant?.id || 1;
  const { data: allIngredients = [] } = useQuery<Ingredient[]>({ queryKey: ["/api/ingredients", restaurantId] });

  const latestData = monthlyDataAll.length > 0 ? monthlyDataAll[monthlyDataAll.length - 1] : null;
  const prevData = monthlyDataAll.length > 1 ? monthlyDataAll[monthlyDataAll.length - 2] : null;

  const analysis = useMemo(() => {
    if (!latestData) return null;
    const revenue = latestData.revenue;
    const totalCost = COST_KEYS.reduce((s, c) => s + (latestData[c.key] as number), 0);

    const drivers = COST_KEYS.map((c) => {
      const current = latestData[c.key] as number;
      const prev = prevData ? (prevData[c.key] as number) : current;
      const pctOfRevenue = (current / revenue) * 100;
      const pctOfTotal = (current / totalCost) * 100;
      const change = prev > 0 ? ((current - prev) / prev) * 100 : 0;
      const variance = pctOfRevenue - c.target;
      return {
        ...c,
        current,
        prev,
        pctOfRevenue,
        pctOfTotal,
        change,
        variance,
        status: variance <= 0 ? "good" : variance <= 2 ? "warning" : "critical",
      };
    }).sort((a, b) => b.current - a.current);

    const overBudget = drivers.filter((d) => d.variance > 0);
    const biggestRisers = drivers.filter((d) => d.change > 2).sort((a, b) => b.change - a.change);
    const savings = overBudget.reduce((s, d) => s + (d.current * d.variance / 100), 0);

    const ingredientInflation = allIngredients.filter((ing) => ing.previousPrice && ing.currentPrice > ing.previousPrice);
    const avgInflation = ingredientInflation.length > 0
      ? ingredientInflation.reduce((s, i) => s + ((i.currentPrice - (i.previousPrice || 0)) / (i.previousPrice || 1)) * 100, 0) / ingredientInflation.length
      : 0;

    return { revenue, totalCost, drivers, overBudget, biggestRisers, savings, ingredientInflation, avgInflation };
  }, [latestData, prevData, allIngredients]);

  const trendData = monthlyDataAll.map((d) => {
    const total = COST_KEYS.reduce((s, c) => s + (d[c.key] as number), 0);
    return {
      month: d.month.substring(0, 3),
      costRatio: d.revenue > 0 ? (total / d.revenue * 100) : 0,
      foodRatio: d.revenue > 0 ? ((d.foodCost as number) / d.revenue * 100) : 0,
      labourRatio: d.revenue > 0 ? ((d.labourCost as number) / d.revenue * 100) : 0,
      wasteRatio: d.revenue > 0 ? ((d.wasteCost as number) / d.revenue * 100) : 0,
    };
  });

  const varianceData = analysis?.drivers.map((d) => ({
    name: d.label.length > 10 ? d.label.substring(0, 10) + "..." : d.label,
    actual: parseFloat(d.pctOfRevenue.toFixed(1)),
    target: d.target,
    variance: parseFloat(d.variance.toFixed(1)),
  })) || [];

  if (!analysis) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available. Add monthly financial data first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-expense-intelligence">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Expense Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep analysis of what's driving your costs and where to save</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Total Costs</span>
            <div className="text-xl font-bold" data-testid="text-total-costs">£{analysis.totalCost.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">{(analysis.totalCost / analysis.revenue * 100).toFixed(1)}% of revenue</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Over-Budget Items</span>
            <div className="text-xl font-bold text-red-500" data-testid="text-over-budget">{analysis.overBudget.length}</div>
            <span className="text-xs text-muted-foreground">categories exceeding targets</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Fastest Rising Costs</span>
            <div className="text-xl font-bold" data-testid="text-rising-costs">{analysis.biggestRisers.length}</div>
            <span className="text-xs text-muted-foreground">categories growing &gt;2% MoM</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Ingredient Inflation</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-avg-inflation">{analysis.avgInflation.toFixed(1)}%</div>
            <span className="text-xs text-muted-foreground">{analysis.ingredientInflation.length} items with price increases</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Cost Driver Analysis - Actual vs Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.drivers.map((d) => (
              <Link key={d.key as string} href={`/app/drill-down?category=${d.key as string}&label=${encodeURIComponent(d.label)}`}>
                <div className="flex items-center gap-3 p-3 rounded-md hover-elevate cursor-pointer" data-testid={`driver-${d.key as string}`}>
                  <div className={`w-1.5 h-8 rounded-full ${d.status === "good" ? "bg-emerald-500" : d.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium">{d.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{d.classification}</Badge>
                        {d.change !== 0 && (
                          <div className={`flex items-center gap-0.5 text-xs ${d.change > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {d.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(d.change).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.status === "good" ? "bg-emerald-500" : d.status === "warning" ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(d.pctOfRevenue / (d.target * 1.5) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                        {d.pctOfRevenue.toFixed(1)}% / {d.target}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>£{d.current.toLocaleString()}</span>
                      {d.variance > 0 && (
                        <span className="text-red-500">+{d.variance.toFixed(1)}% over target</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Actual vs Target (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-variance">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="actual" fill="hsl(24, 95%, 53%)" name="Actual %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(142, 71%, 45%)" name="Target %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Cost Ratio Trends (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-cost-trends">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${(v as number).toFixed(1)}%`, ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                    <Line type="monotone" dataKey="costRatio" stroke="hsl(0, 72%, 50%)" strokeWidth={2} name="Total Cost %" dot={false} />
                    <Line type="monotone" dataKey="foodRatio" stroke="hsl(24, 95%, 53%)" strokeWidth={2} name="Food %" dot={false} />
                    <Line type="monotone" dataKey="labourRatio" stroke="hsl(200, 70%, 50%)" strokeWidth={2} name="Labour %" dot={false} />
                    <Line type="monotone" dataKey="wasteRatio" stroke="hsl(32, 88%, 42%)" strokeWidth={2} name="Waste %" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No trend data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {analysis.ingredientInflation.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Ingredient Price Inflation Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.ingredientInflation.sort((a, b) => {
                const aP = ((a.currentPrice - (a.previousPrice || 0)) / (a.previousPrice || 1)) * 100;
                const bP = ((b.currentPrice - (b.previousPrice || 0)) / (b.previousPrice || 1)) * 100;
                return bP - aP;
              }).map((ing) => {
                const pctChange = ((ing.currentPrice - (ing.previousPrice || 0)) / (ing.previousPrice || 1)) * 100;
                return (
                  <div key={ing.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/30" data-testid={`inflation-alert-${ing.id}`}>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{ing.name}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>£{ing.previousPrice?.toFixed(2)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">£{ing.currentPrice.toFixed(2)}</span>
                        <span className="text-red-500">+{pctChange.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

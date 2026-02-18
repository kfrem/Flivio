import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MonthlyData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Truck, TrendingDown, AlertTriangle, ArrowRight,
  PoundSterling, Percent, Calculator,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
};

const PLATFORMS = [
  { name: "Uber Eats", commission: 30, deliveryFee: 2.50, monthlyFee: 0, color: "hsl(142, 60%, 45%)" },
  { name: "Deliveroo", commission: 25, deliveryFee: 2.00, monthlyFee: 49, color: "hsl(200, 70%, 50%)" },
  { name: "Just Eat", commission: 20, deliveryFee: 1.50, monthlyFee: 0, color: "hsl(24, 95%, 53%)" },
  { name: "Own Website", commission: 0, deliveryFee: 0, monthlyFee: 99, color: "hsl(280, 60%, 50%)" },
];

export default function DeliveryPlatforms() {
  const { data: monthlyDataAll = [] } = useQuery<MonthlyData[]>({ queryKey: ["/api/monthly-data"] });
  const latestData = monthlyDataAll.length > 0 ? monthlyDataAll[monthlyDataAll.length - 1] : null;

  const [avgOrderValue, setAvgOrderValue] = useState(25);
  const [monthlyOrders, setMonthlyOrders] = useState(400);
  const [platforms, setPlatforms] = useState(PLATFORMS.map((p) => ({
    ...p,
    orderShare: p.name === "Uber Eats" ? 40 : p.name === "Deliveroo" ? 30 : p.name === "Just Eat" ? 20 : 10,
  })));

  const analysis = useMemo(() => {
    const totalDeliveryRevenue = avgOrderValue * monthlyOrders;
    return platforms.map((p) => {
      const orders = Math.round(monthlyOrders * p.orderShare / 100);
      const revenue = orders * avgOrderValue;
      const commissionCost = revenue * p.commission / 100;
      const deliveryCost = orders * p.deliveryFee;
      const totalCost = commissionCost + deliveryCost + p.monthlyFee;
      const netRevenue = revenue - totalCost;
      const effectiveRate = revenue > 0 ? (totalCost / revenue) * 100 : 0;
      return {
        ...p,
        orders,
        revenue,
        commissionCost,
        deliveryCost,
        totalCost,
        netRevenue,
        effectiveRate,
      };
    });
  }, [platforms, avgOrderValue, monthlyOrders]);

  const totalCosts = analysis.reduce((s, p) => s + p.totalCost, 0);
  const totalRevenue = analysis.reduce((s, p) => s + p.revenue, 0);
  const totalNet = analysis.reduce((s, p) => s + p.netRevenue, 0);
  const blendedRate = totalRevenue > 0 ? (totalCosts / totalRevenue) * 100 : 0;

  const comparisonData = analysis.map((p) => ({
    name: p.name,
    commission: Math.round(p.commissionCost),
    delivery: Math.round(p.deliveryCost),
    monthly: p.monthlyFee,
    net: Math.round(p.netRevenue),
  }));

  const costBreakdown = analysis.map((p) => ({
    name: p.name,
    value: Math.round(p.totalCost),
    fill: p.color,
  })).filter((d) => d.value > 0);

  const trendData = monthlyDataAll.map((d) => {
    const simTotalCost = d.deliveryRevenue * blendedRate / 100;
    return {
      month: d.month.substring(0, 3),
      deliveryRevenue: Math.round(d.deliveryRevenue),
      platformCosts: Math.round(simTotalCost),
      netDelivery: Math.round(d.deliveryRevenue - simTotalCost),
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-delivery-platforms">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Delivery Platform Costs</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyse how third-party delivery platforms impact your margins</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Total Delivery Revenue</span>
            <div className="text-xl font-bold" data-testid="text-total-delivery-revenue">£{totalRevenue.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">{monthlyOrders} orders/month</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Platform Costs</span>
            <div className="text-xl font-bold text-red-500" data-testid="text-platform-costs">£{totalCosts.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">{blendedRate.toFixed(1)}% of revenue</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Net Delivery Income</span>
            <div className={`text-xl font-bold ${totalNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} data-testid="text-net-delivery">£{totalNet.toLocaleString()}</div>
            <span className="text-xs text-muted-foreground">after all fees</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-muted-foreground">Blended Commission</span>
            <div className="text-xl font-bold" data-testid="text-blended-rate">{blendedRate.toFixed(1)}%</div>
            <span className="text-xs text-muted-foreground">effective rate across all platforms</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Avg Order Value (£)</label>
              <Input type="number" value={avgOrderValue} onChange={(e) => setAvgOrderValue(parseFloat(e.target.value) || 0)} data-testid="input-avg-order" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monthly Delivery Orders</label>
              <Input type="number" value={monthlyOrders} onChange={(e) => setMonthlyOrders(parseInt(e.target.value) || 0)} data-testid="input-monthly-orders" />
            </div>
            <div className="border-t pt-3 space-y-3">
              <span className="text-xs font-medium">Order Share by Platform</span>
              {platforms.map((p, i) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs">{p.name}</span>
                    <Badge variant="secondary" className="text-xs">{p.orderShare}%</Badge>
                  </div>
                  <Slider
                    value={[p.orderShare]}
                    max={100}
                    step={5}
                    onValueChange={([v]) => {
                      const updated = [...platforms];
                      updated[i] = { ...updated[i], orderShare: v };
                      setPlatforms(updated);
                    }}
                    data-testid={`slider-share-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Commission: {p.commission}%</span>
                    <span>Delivery fee: £{p.deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Cost Comparison by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-platform-comparison">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                  <Tooltip formatter={(v: number) => [`£${v}`, ""]} contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="commission" fill="hsl(0, 72%, 50%)" name="Commission" stackId="costs" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="delivery" fill="hsl(32, 88%, 42%)" name="Delivery Fees" stackId="costs" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="monthly" fill="hsl(200, 70%, 50%)" name="Monthly Fee" stackId="costs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" fill="hsl(142, 71%, 45%)" name="Net Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Platform Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-md bg-muted/30" data-testid={`platform-detail-${p.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.effectiveRate > 25 ? "destructive" : "secondary"} className="text-xs">
                          {p.effectiveRate.toFixed(1)}% effective rate
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{p.orders} orders</span>
                      <span>Revenue: £{p.revenue.toLocaleString()}</span>
                      <span>Costs: £{p.totalCost.toLocaleString()}</span>
                      <span className={p.netRevenue >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>Net: £{p.netRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Delivery Revenue Trend (with Platform Costs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" data-testid="chart-delivery-trend">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`£${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="deliveryRevenue" fill="hsl(24, 95%, 53%)" name="Delivery Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="platformCosts" fill="hsl(0, 72%, 50%)" name="Platform Costs" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netDelivery" fill="hsl(142, 71%, 45%)" name="Net Delivery" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No monthly data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

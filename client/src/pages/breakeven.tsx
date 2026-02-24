import { useQuery } from "@tanstack/react-query";
import type { MonthlyData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Calculator, TrendingUp, Target, AlertTriangle,
  CheckCircle2, PoundSterling, Users, Calendar,
  ArrowRight, Info,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// UK National Living Wage rates by year
const NLW_RATES = [
  { year: 2023, rate: 10.42, label: "Apr 2023" },
  { year: 2024, rate: 11.44, label: "Apr 2024" },
  { year: 2025, rate: 12.21, label: "Apr 2025" },
  { year: 2026, rate: 13.00, label: "Apr 2026 (projected)" },
];

function formatGBP(value: number) {
  return `£${value.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function BreakevenAnalysis() {
  const { data: monthlyDataList, isLoading } = useQuery<MonthlyData[]>({
    queryKey: ["/api/monthly-data"],
  });

  const latestData = monthlyDataList && monthlyDataList.length > 0
    ? monthlyDataList[monthlyDataList.length - 1] : null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="p-6 space-y-6" data-testid="page-breakeven">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Breakeven Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Know exactly how many covers you need every day to cover your costs</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No financial data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your monthly revenue and cost data in Add Data to unlock your breakeven analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Core calculations ────────────────────────────────────────────────────

  const revenue = latestData.revenue;
  const totalCovers = latestData.totalCovers || 1;
  const avgTicket = latestData.avgTicketSize || (revenue / totalCovers);
  const workingDaysPerMonth = 26; // typical UK restaurant
  const dailyCovers = totalCovers / workingDaysPerMonth;

  // Fixed costs (don't vary with covers)
  const fixedCosts = latestData.rentCost + latestData.technologyCost +
    latestData.marketingCost + (latestData.labourCost * 0.6); // 60% of labour is fixed

  // Variable costs (scale with covers)
  const variableCosts = latestData.foodCost + latestData.wasteCost +
    (latestData.labourCost * 0.4) +
    latestData.suppliesCost;

  const otherCosts = latestData.energyCost;
  const totalCosts = fixedCosts + variableCosts + otherCosts;

  // Variable cost per cover
  const variableCostPerCover = totalCovers > 0 ? variableCosts / totalCovers : 0;
  const contributionMarginPerCover = avgTicket - variableCostPerCover;

  // Breakeven covers per month
  const breakevenMonthlyCovers = contributionMarginPerCover > 0
    ? Math.ceil((fixedCosts + otherCosts) / contributionMarginPerCover) : 0;
  const breakevenDailyCovers = Math.ceil(breakevenMonthlyCovers / workingDaysPerMonth);
  const breakevenWeeklyCovers = Math.ceil(breakevenMonthlyCovers / 4.3);

  // Breakeven revenue
  const breakevenRevenue = breakevenMonthlyCovers * avgTicket;
  const currentVsBreakeven = revenue - breakevenRevenue;
  const safetyMarginPct = revenue > 0 ? (currentVsBreakeven / revenue) * 100 : 0;

  // How many extra covers to increase profit by £1k/month
  const coversFor1kProfit = contributionMarginPerCover > 0
    ? Math.ceil(1000 / contributionMarginPerCover) : 0;

  // NLW impact calculations
  const currentLabour = latestData.labourCost;
  const estimatedFTEStaff = Math.round(currentLabour / (NLW_RATES[2].rate * 160)); // 160hrs/month per FTE
  const nlw2026Impact = estimatedFTEStaff * (NLW_RATES[3].rate - NLW_RATES[2].rate) * 160;
  const nlwAnnualImpact = nlw2026Impact * 12;

  // Chart data — show cost build-up from 0 to current covers
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const covers = Math.round((totalCovers / 6) * i);
    const rev = covers * avgTicket;
    const varCost = covers * variableCostPerCover;
    const totalC = fixedCosts + otherCosts + varCost;
    return {
      covers,
      revenue: Math.round(rev),
      costs: Math.round(totalC),
      profit: Math.round(rev - totalC),
    };
  });

  // Add current point
  chartData.push({
    covers: totalCovers,
    revenue: Math.round(revenue),
    costs: Math.round(totalCosts),
    profit: Math.round(revenue - totalCosts),
  });

  chartData.sort((a, b) => a.covers - b.covers);

  const profitStatus = currentVsBreakeven > 0 ? "above" : "below";

  return (
    <div className="p-6 space-y-6 overflow-auto h-full" data-testid="page-breakeven">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Breakeven Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Based on {latestData.month} {latestData.year} data · {formatGBP(revenue)} revenue · {totalCovers.toLocaleString()} covers
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`border-2 ${profitStatus === "above" ? "border-emerald-500/30" : "border-red-500/30"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Daily Covers Needed</span>
            </div>
            <div className="text-3xl font-bold">{breakevenDailyCovers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              You're currently doing ~{Math.round(dailyCovers)} per day
            </div>
            <Badge variant="outline" className={`text-xs mt-2 ${profitStatus === "above" ? "text-emerald-600 border-emerald-500/30" : "text-red-500 border-red-500/30"}`}>
              {profitStatus === "above" ? `${Math.round(dailyCovers - breakevenDailyCovers)} above target` : `${Math.round(breakevenDailyCovers - dailyCovers)} below target`}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PoundSterling className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Breakeven Revenue</span>
            </div>
            <div className="text-3xl font-bold">{formatGBP(breakevenRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Monthly revenue needed to cover all costs
            </div>
            <div className={`text-xs font-medium mt-2 ${currentVsBreakeven >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {currentVsBreakeven >= 0
                ? `${formatGBP(currentVsBreakeven)} above breakeven`
                : `${formatGBP(Math.abs(currentVsBreakeven))} below breakeven`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Contribution Margin</span>
            </div>
            <div className="text-3xl font-bold">£{contributionMarginPerCover.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Profit per additional cover served
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {coversFor1kProfit} extra covers = £1,000 extra profit
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety margin */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Margin of Safety</span>
              <Badge variant={safetyMarginPct >= 15 ? "default" : safetyMarginPct >= 5 ? "secondary" : "destructive"} className="text-xs">
                {safetyMarginPct >= 15 ? "Healthy" : safetyMarginPct >= 5 ? "Tight" : "Danger Zone"}
              </Badge>
            </div>
            <span className="text-sm font-bold">{safetyMarginPct.toFixed(1)}%</span>
          </div>
          <Progress value={Math.max(0, Math.min(safetyMarginPct, 100))} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Your safety margin is the buffer between your actual revenue and your breakeven point.
            <strong> Healthy restaurants maintain 15–25%.</strong> Below 10% means any disruption (bad week, supplier price rise) wipes out your profit.
          </p>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Revenue vs Cost Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="covers" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}`} label={{ value: "Covers/month", position: "insideBottom", offset: -2, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatGBP(value), name === "revenue" ? "Revenue" : name === "costs" ? "Total Costs" : "Profit"]}
                  labelFormatter={(label) => `${label} covers/month`}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="revenue" />
                <Bar dataKey="costs" fill="hsl(var(--destructive) / 0.6)" radius={[2, 2, 0, 0]} name="costs" />
                <ReferenceLine x={breakevenMonthlyCovers} stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: "BE", fontSize: 10, fill: "hsl(var(--primary))" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Dashed line = your breakeven point ({breakevenMonthlyCovers} covers/month · {breakevenDailyCovers}/day)
          </p>
        </CardContent>
      </Card>

      {/* Fixed vs Variable cost split */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Structure Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fixed Costs (monthly)</span>
                <span className="font-semibold">{formatGBP(fixedCosts + otherCosts)}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-2 space-y-1">
                <div className="flex justify-between"><span>Rent</span><span>{formatGBP(latestData.rentCost)}</span></div>
                <div className="flex justify-between"><span>Energy</span><span>{formatGBP(latestData.energyCost)}</span></div>
                <div className="flex justify-between"><span>Fixed Labour (60%)</span><span>{formatGBP(latestData.labourCost * 0.6)}</span></div>
                <div className="flex justify-between"><span>Technology</span><span>{formatGBP(latestData.technologyCost)}</span></div>
                <div className="flex justify-between"><span>Marketing</span><span>{formatGBP(latestData.marketingCost)}</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Variable Costs (monthly)</span>
                <span className="font-semibold">{formatGBP(variableCosts)}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-2 space-y-1">
                <div className="flex justify-between"><span>Food Cost</span><span>{formatGBP(latestData.foodCost)}</span></div>
                <div className="flex justify-between"><span>Waste</span><span>{formatGBP(latestData.wasteCost)}</span></div>
                <div className="flex justify-between"><span>Supplies</span><span>{formatGBP(latestData.suppliesCost)}</span></div>
                <div className="flex justify-between"><span>Variable Labour (40%)</span><span>{formatGBP(latestData.labourCost * 0.4)}</span></div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 inline mr-1" />
            Fixed costs do not change when you serve more covers — they must be covered before you make any profit.
            Variable costs rise with each additional cover. Your breakeven is determined by how quickly your
            contribution margin (selling price minus variable cost per cover) covers your fixed costs.
          </div>
        </CardContent>
      </Card>

      {/* NLW Tracker */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            National Living Wage Impact Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NLW_RATES.map((nlw) => (
              <div key={nlw.year} className={`p-3 rounded-lg border text-center space-y-1 ${nlw.year === 2025 ? "border-primary bg-primary/5" : "bg-muted/30"}`}>
                <div className="text-xs text-muted-foreground">{nlw.label}</div>
                <div className="text-lg font-bold">£{nlw.rate.toFixed(2)}</div>
                {nlw.year === 2025 && <Badge className="text-xs">Current</Badge>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">Est. FTE staff (from labour cost)</div>
              <div className="text-2xl font-bold">{estimatedFTEStaff}</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">NLW increase (2025→2026)</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                +£{(NLW_RATES[3].rate - NLW_RATES[2].rate).toFixed(2)}/hr
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">Estimated annual labour cost increase</div>
              <div className="text-2xl font-bold text-red-500">
                +{formatGBP(nlwAnnualImpact)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
            <p><strong>What this means for your breakeven:</strong></p>
            <p>
              A {formatGBP(nlwAnnualImpact)} annual increase in labour costs means your breakeven daily cover count
              rises by approximately <strong>{Math.ceil((nlwAnnualImpact / 12) / contributionMarginPerCover / workingDaysPerMonth)} extra covers per day</strong> to maintain the same profit.
            </p>
            <p className="mt-1">
              To offset the NLW rise without more covers, you need to either raise average spend by{" "}
              <strong>£{((nlwAnnualImpact / 12) / (totalCovers || 1)).toFixed(2)} per cover</strong> or reduce variable costs by the same amount.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What-if scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Quick Scenarios — What would change your breakeven?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                scenario: `Raise average spend by £2`,
                newBE: Math.ceil((fixedCosts + otherCosts) / (contributionMarginPerCover + 2)),
                change: Math.ceil((fixedCosts + otherCosts) / (contributionMarginPerCover + 2)) - breakevenMonthlyCovers,
                type: "positive",
              },
              {
                scenario: `Reduce food cost by 3%`,
                newBE: Math.ceil((fixedCosts + otherCosts) / (contributionMarginPerCover + (revenue / totalCovers) * 0.03)),
                change: Math.ceil((fixedCosts + otherCosts) / (contributionMarginPerCover + (revenue / totalCovers) * 0.03)) - breakevenMonthlyCovers,
                type: "positive",
              },
              {
                scenario: `NLW rises to £13/hr (2026)`,
                newBE: Math.ceil((fixedCosts + otherCosts + nlw2026Impact) / contributionMarginPerCover),
                change: Math.ceil((fixedCosts + otherCosts + nlw2026Impact) / contributionMarginPerCover) - breakevenMonthlyCovers,
                type: "negative",
              },
              {
                scenario: `Energy bills rise 15%`,
                newBE: Math.ceil((fixedCosts + latestData.energyCost * 0.15 + otherCosts) / contributionMarginPerCover),
                change: Math.ceil((fixedCosts + latestData.energyCost * 0.15 + otherCosts) / contributionMarginPerCover) - breakevenMonthlyCovers,
                type: "negative",
              },
            ].map((s) => (
              <div key={s.scenario} className={`p-3 rounded-lg border ${s.type === "positive" ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="text-sm font-medium">{s.scenario}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">New breakeven</span>
                  <span className="text-sm font-bold">{Math.ceil(s.newBE / workingDaysPerMonth)}/day ({s.newBE} covers/month)</span>
                </div>
                <div className={`text-xs font-medium mt-1 ${s.type === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {s.change < 0 ? `${Math.abs(s.change)} fewer covers needed/month` : `+${s.change} more covers needed/month`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

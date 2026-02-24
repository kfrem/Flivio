import { useQuery } from "@tanstack/react-query";
import type { MonthlyData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart, Users, Zap, Trash2, TrendingUp, Target,
  Lightbulb, AlertTriangle, CheckCircle2, ArrowRight,
  PoundSterling, Star, Calculator, Truck, BarChart3,
  Building2, Utensils,
} from "lucide-react";

// ─── UK Industry Benchmarks (by category) ────────────────────────────────────
const UK_BENCHMARKS = {
  foodCostPct: { low: 25, target: 30, high: 35, label: "Food Cost %" },
  labourPct: { low: 24, target: 28, high: 32, label: "Labour %" },
  energyPct: { low: 4, target: 6, high: 9, label: "Energy %" },
  rentPct: { low: 5, target: 8, high: 12, label: "Rent & Rates %" },
  wastePct: { low: 1, target: 2.5, high: 4, label: "Food Waste %" },
  gpPct: { low: 55, target: 65, high: 75, label: "Gross Profit %" },
  netPct: { low: 5, target: 10, high: 18, label: "Net Profit %" },
  repeatCustomer: { low: 25, target: 35, high: 50, label: "Repeat Customer Rate" },
  avgTicket: { low: 18, target: 28, high: 45, label: "Avg Ticket Size (£)" },
};

// ─── Recommendation interface ─────────────────────────────────────────────────
interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "food-cost" | "labour" | "energy" | "revenue" | "waste" | "delivery" | "marketing" | "supplier" | "menu" | "nlw";
  impact: "high" | "medium" | "low";
  estimatedSaving: number;
  icon: any;
  actions: string[];
  ukContext?: string;
}

// ─── Recommendation engine ────────────────────────────────────────────────────
function generateRecommendations(data: MonthlyData): Recommendation[] {
  const recs: Recommendation[] = [];
  const totalCost = data.foodCost + data.labourCost + data.energyCost +
    data.rentCost + data.marketingCost + data.suppliesCost +
    data.technologyCost + data.wasteCost;

  const foodPct = (data.foodCost / data.revenue) * 100;
  const labourPct = (data.labourCost / data.revenue) * 100;
  const energyPct = (data.energyCost / data.revenue) * 100;
  const wastePct = (data.wasteCost / data.revenue) * 100;
  const rentPct = (data.rentCost / data.revenue) * 100;
  const gpPct = ((data.revenue - data.foodCost) / data.revenue) * 100;
  const netMarginPct = ((data.revenue - totalCost) / data.revenue) * 100;

  // ─── 1. Food Cost ─────────────────────────────────────────────────────────
  if (foodPct > UK_BENCHMARKS.foodCostPct.high) {
    const savingsAtTarget = data.foodCost - (data.revenue * (UK_BENCHMARKS.foodCostPct.target / 100));
    recs.push({
      id: "food-cost-high",
      title: `Food cost at ${foodPct.toFixed(1)}% — UK target is 28–32%`,
      description: `Your food cost is ${(foodPct - UK_BENCHMARKS.foodCostPct.target).toFixed(1)}pp above the UK benchmark. This is the single biggest lever in restaurant profitability. A 1% reduction in food cost = ${formatGBP(data.revenue * 0.01)} extra profit per month.`,
      category: "food-cost",
      impact: "high",
      estimatedSaving: Math.round(savingsAtTarget),
      icon: ShoppingCart,
      actions: [
        "Identify your 10 highest-cost ingredients and request alternative quotes from 2 suppliers",
        "Review portion sizes with kitchen scales — even 10g over on proteins across 500 covers adds up",
        "Introduce a shared ingredient policy: design new dishes around ingredients already on your menu",
        "Implement daily prep sheets so nothing is over-prepared and wasted",
      ],
      ukContext: `UK food inflation hit restaurant budgets hard in 2023–24. Top performing UK restaurants have returned food cost to 28–30% by dual-sourcing proteins and switching to seasonal menus quarterly.`,
    });
  } else if (foodPct > UK_BENCHMARKS.foodCostPct.target) {
    recs.push({
      id: "food-cost-medium",
      title: `Food cost at ${foodPct.toFixed(1)}% — room to tighten`,
      description: `Just above the 30% target. Small adjustments can close this gap and deliver meaningful profit improvement.`,
      category: "food-cost",
      impact: "medium",
      estimatedSaving: Math.round(data.revenue * ((foodPct - UK_BENCHMARKS.foodCostPct.target) / 100)),
      icon: ShoppingCart,
      actions: [
        "Run a 2-week waste audit — track every ingredient discarded and its cost",
        "Check whether any menu items are underpriced for their ingredient cost",
      ],
      ukContext: `Food cost creep often goes unnoticed. Review costs monthly, not annually.`,
    });
  }

  // ─── 2. Labour / NLW ─────────────────────────────────────────────────────
  if (labourPct > UK_BENCHMARKS.labourPct.high) {
    const savingsAtTarget = data.labourCost - (data.revenue * (UK_BENCHMARKS.labourPct.target / 100));
    recs.push({
      id: "labour-high",
      title: `Labour at ${labourPct.toFixed(1)}% — UK benchmark is 25–30%`,
      description: `Labour is your second biggest cost lever. At ${labourPct.toFixed(1)}%, you're ${(labourPct - UK_BENCHMARKS.labourPct.target).toFixed(1)}pp above target. With the National Living Wage rising to £12.21/hr in 2025 and projected higher in 2026, tackling this now protects you from future shocks.`,
      category: "labour",
      impact: "high",
      estimatedSaving: Math.round(savingsAtTarget),
      icon: Users,
      actions: [
        "Map your busiest hours by day — are you overstaffed in quiet periods?",
        "Cross-train staff so fewer people can cover more roles during quiet periods",
        "Consider a 4-day trading week model if Mondays/Tuesdays are loss-making",
        "Review your use of agency staff — they typically cost 20–30% more per hour",
        "Offer a structured tip-pooling system to reduce base wage pressure",
      ],
      ukContext: `The National Living Wage rose to £11.44 in April 2024 and £12.21 in April 2025. With further rises expected in 2026, every percentage point of labour cost you reduce now is future-proofing your business.`,
    });
  }

  // NLW alert for everyone
  const currentNLW = 12.21; // Apr 2025
  const projectedNLW = 13.00; // Apr 2026
  const estimatedFTE = Math.round(data.labourCost / (currentNLW * 160));
  const nlwMonthlyImpact = estimatedFTE * (projectedNLW - currentNLW) * 160;
  if (nlwMonthlyImpact > 200) {
    recs.push({
      id: "nlw-2026",
      title: `National Living Wage: +£${nlwMonthlyImpact.toFixed(0)}/month from April 2026`,
      description: `Based on your current labour spend, the projected NLW rise from £${currentNLW} to £${projectedNLW}/hr will cost you approximately ${formatGBP(nlwMonthlyImpact)} more per month (${formatGBP(nlwMonthlyImpact * 12)}/year). Plan for this now — don't be caught off-guard in Q2 2026.`,
      category: "nlw",
      impact: nlwMonthlyImpact > 1000 ? "high" : "medium",
      estimatedSaving: 0,
      icon: AlertTriangle,
      actions: [
        `Review your April 2026 pricing now — you need to raise average spend by ${formatGBP(nlwMonthlyImpact / (data.totalCovers || 1))} per cover to absorb the full increase`,
        "Identify which roles are paid at NLW vs above NLW to quantify exact exposure",
        "Consider raising prices by 3–5% in advance of April to build a buffer",
        "Explore automating order-taking (table tablets, QR codes) to reduce cover-per-server ratio",
      ],
      ukContext: `The NLW is set by the Low Pay Commission annually. Hospitality is disproportionately affected — the industry employs the highest share of minimum wage workers in the UK economy.`,
    });
  }

  // ─── 3. Energy ───────────────────────────────────────────────────────────
  if (energyPct > UK_BENCHMARKS.energyPct.high) {
    recs.push({
      id: "energy-high",
      title: `Energy at ${energyPct.toFixed(1)}% — above the 5–8% benchmark`,
      description: `UK restaurant energy costs surged post-2022 and many operators haven't renegotiated. At ${energyPct.toFixed(1)}%, you have meaningful savings available.`,
      category: "energy",
      impact: "medium",
      estimatedSaving: Math.round(data.energyCost * 0.18),
      icon: Zap,
      actions: [
        "Get at least 2 energy broker quotes — Utilityfair and Bionic specialise in UK hospitality",
        "Install a smart energy monitor (£100–300) to identify your biggest consumption periods",
        "Implement equipment shutdown schedules — ovens and combi steamers on standby waste £800–2k/year",
        "Apply for the energy efficiency grant via the UK Business Climate Hub (gov.uk)",
        "Switch to LED lighting throughout — payback typically under 12 months in a commercial kitchen",
      ],
      ukContext: `UK energy prices for small businesses remain elevated post-Ukraine war. The Energy Bill Discount Scheme ended in March 2024 — all restaurants are now on market rates. Switching supplier can save 10–20% for many operators.`,
    });
  }

  // ─── 4. Waste ────────────────────────────────────────────────────────────
  if (wastePct > UK_BENCHMARKS.wastePct.high) {
    recs.push({
      id: "waste-high",
      title: `Food waste at ${wastePct.toFixed(1)}% — UK average is 2–3%`,
      description: `Excess waste costs you ${formatGBP(data.wasteCost)} per month. WRAP research shows UK restaurants waste 75–150g per cover. Cutting waste is effectively free money — you've already paid for these ingredients.`,
      category: "waste",
      impact: "medium",
      estimatedSaving: Math.round(data.wasteCost * 0.35),
      icon: Trash2,
      actions: [
        "Introduce a daily 'use it up' special based on yesterday's over-prep",
        "Train all kitchen staff on FIFO (First In, First Out) storage — this alone reduces waste 10–15%",
        "Track waste by station: where is waste highest — prep, service, or plate returns?",
        "Reduce menu size by 15–20% — fewer dishes = less waste, faster service, lower stress",
        "Partner with Too Good To Go or Winnow to monetise surplus and benchmark your waste",
      ],
      ukContext: `WRAP (UK Waste & Resources Action Programme) found hospitality generates 1 million tonnes of food waste annually. Restaurants that formally track waste reduce it by an average of 27% within 6 months.`,
    });
  }

  // ─── 5. Rent ─────────────────────────────────────────────────────────────
  if (rentPct > UK_BENCHMARKS.rentPct.high) {
    recs.push({
      id: "rent-high",
      title: `Rent at ${rentPct.toFixed(1)}% of revenue — above the 8–10% target`,
      description: `Rent is largely fixed, but there are options. With UK commercial property vacancy rates at multi-year highs post-pandemic, many landlords are willing to renegotiate, especially if you're a good tenant.`,
      category: "supplier",
      impact: "medium",
      estimatedSaving: Math.round(data.rentCost * 0.1),
      icon: Building2,
      actions: [
        "Check your lease break clause date — approach your landlord 6 months before any break or renewal",
        "Get a commercial surveyor to benchmark your rent against comparable properties in your postcode",
        "Negotiate a turnover rent clause — landlord gets a % of revenue instead of fixed rent, reducing your fixed cost base",
        "Consider subletting your space during off-peak hours (daytime café concession, pop-up events)",
        "Ask your local council about Business Rates Relief schemes — many restaurants qualify but don't claim",
      ],
      ukContext: `UK business rates are assessed on rateable value — many restaurants are now over-assessed relative to post-pandemic trading levels. You can appeal your rateable value via the Valuation Office Agency (VOA) for free.`,
    });
  }

  // ─── 6. Delivery platforms ────────────────────────────────────────────────
  if (data.deliveryRevenue > data.revenue * 0.3) {
    const platformFeeEst = data.deliveryRevenue * 0.28;
    recs.push({
      id: "delivery-cost",
      title: `Delivery revenue is ${((data.deliveryRevenue / data.revenue) * 100).toFixed(0)}% of total — check true net profit`,
      description: `With platforms like Deliveroo and Uber Eats charging 25–35% commission, your effective GP on delivery orders may be significantly lower than dine-in. On a £20 dish, you may be netting only £8–10 after platform fees, packaging, and extra labour.`,
      category: "delivery",
      impact: "medium",
      estimatedSaving: Math.round(platformFeeEst * 0.1),
      icon: Truck,
      actions: [
        "Calculate your true net profit per delivery order (selling price minus platform fee, packaging, extra labour)",
        "Remove your lowest-margin items from delivery menus — not all dishes should be available for delivery",
        "Negotiate with platforms — operators doing £10k+/month with them have leverage to reduce commission",
        "Build your own direct ordering channel (deliverect.com or a simple Stripe-integrated site) to avoid fees",
        "Encourage repeat delivery customers to order direct via a loyalty discount (e.g. 10% off direct orders)",
      ],
      ukContext: `Deliveroo charges 25–35%, Just Eat 14–30%, Uber Eats 25–35% depending on contract. Many UK restaurants don't realise they can negotiate. Operators with strong volume regularly achieve sub-25% rates.`,
    });
  } else if (data.deliveryRevenue < data.revenue * 0.15 && data.dineInRevenue > 0) {
    recs.push({
      id: "delivery-grow",
      title: "Delivery channel under-utilised — significant upside available",
      description: `Your delivery revenue is ${((data.deliveryRevenue / data.revenue) * 100).toFixed(0)}% of total. Well-run UK restaurants often achieve 20–35% delivery mix. This is incremental revenue using your existing kitchen capacity.`,
      category: "delivery",
      impact: "high",
      estimatedSaving: Math.round(data.revenue * 0.06),
      icon: TrendingUp,
      actions: [
        "Register on Just Eat, Deliveroo or Uber Eats — compare their coverage maps in your postcode first",
        "Create a delivery-optimised menu: 8–12 items that travel well, with good margins",
        "Set a minimum order of £18–22 to ensure delivery is profitable after fees",
        "Photograph your top 6 delivery dishes professionally — photo quality drives conversion on platforms",
      ],
      ukContext: `UK food delivery market grew 11% in 2024. Even dine-in-focused restaurants can generate £3–8k/month in delivery with the right menu and presentation.`,
    });
  }

  // ─── 7. Average ticket / upselling ───────────────────────────────────────
  if (data.avgTicketSize < UK_BENCHMARKS.avgTicket.target) {
    const targetIncrease = UK_BENCHMARKS.avgTicket.target - data.avgTicketSize;
    recs.push({
      id: "avg-ticket",
      title: `Average spend £${data.avgTicketSize.toFixed(2)} — UK casual dining average is £28–35`,
      description: `Increasing your average spend by just £${targetIncrease.toFixed(0)} per cover would generate ${formatGBP((data.totalCovers || 0) * targetIncrease)} extra revenue per month with zero extra customers.`,
      category: "revenue",
      impact: "medium",
      estimatedSaving: Math.round((data.totalCovers || 0) * targetIncrease * 0.6),
      icon: PoundSterling,
      actions: [
        "Train all front of house staff on one specific upsell per shift (e.g. 'Would you like to add a side of truffle fries?')",
        "Add a premium cocktail or mocktail to the menu at £9–12 — drinks carry 70–80% GP",
        "Introduce a pre-dessert amuse-bouche at a fixed £4–6 supplement",
        "Create a 'house special' board with 3 high-margin dishes that change weekly",
        "Offer a wine pairing suggestion with set menus — this alone can add £8–15 per head",
      ],
      ukContext: `UK restaurant operator Wagamama increased average spend by 12% simply by retaining staff for longer (lower turnover) and investing in structured upselling training. Front of house is your sales team.`,
    });
  }

  // ─── 8. Repeat customers ─────────────────────────────────────────────────
  if (data.repeatCustomerRate < UK_BENCHMARKS.repeatCustomer.target) {
    recs.push({
      id: "retention",
      title: `Repeat customer rate at ${data.repeatCustomerRate.toFixed(0)}% — target is 35–50%`,
      description: `Acquiring a new restaurant customer costs 5–7x more than retaining an existing one. Raising your repeat rate by just 5% can increase revenue by 10–15% without any marketing spend.`,
      category: "marketing",
      impact: "medium",
      estimatedSaving: Math.round(data.revenue * 0.04),
      icon: Target,
      actions: [
        "Implement a simple stamp card or digital loyalty scheme (Stamp Me or Square Loyalty) — free to start",
        "Collect customer email addresses on booking — send a monthly 'what's new' email",
        "Follow up on every Tripadvisor / Google review within 24 hours — even negative ones publicly",
        "Create a 'regulars' programme with a small perk (free coffee, priority booking) for your top 50 customers",
        "Send a personal thank-you card to customers who celebrate a birthday or anniversary with you",
      ],
      ukContext: `According to UKHospitality, restaurants with a structured loyalty programme see 2.4x higher customer return frequency. Most independent restaurants don't have one — this is easy competitive advantage.`,
    });
  }

  // ─── 9. Menu engineering signal ──────────────────────────────────────────
  if (gpPct < UK_BENCHMARKS.gpPct.target) {
    recs.push({
      id: "menu-engineering",
      title: `Gross Profit % at ${gpPct.toFixed(1)}% — target is 65–70% for UK restaurants`,
      description: `Your GP is the key signal of menu pricing health. Below 65% usually means either food costs are too high, prices are too low, or your menu mix is skewed towards low-margin dishes.`,
      category: "menu",
      impact: gpPct < 55 ? "high" : "medium",
      estimatedSaving: Math.round(data.revenue * ((UK_BENCHMARKS.gpPct.target - gpPct) / 100) * 0.5),
      icon: Star,
      actions: [
        "Go to Menu Engineering to see which dishes are Stars, Plough Horses, Puzzles and Dogs",
        "Remove or reprice your lowest-margin dishes first — start with Dogs (low popularity, low margin)",
        "Review whether your side dishes and desserts are pulling their weight — they should carry 70%+ GP",
        "Consider a 5–8% price increase on your top-selling dishes — demand is inelastic on favourites",
      ],
      ukContext: `Menu engineering was developed by Cornell University's hospitality school and is standard practice at all major UK restaurant groups. Independent operators who apply it typically improve GP% by 3–8 points within 2 menu cycles.`,
    });
  }

  // Sort by impact: high → medium → low
  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.impact] - order[b.impact]);
}

function formatGBP(value: number) {
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}

const impactConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High Impact", className: "text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400" },
  medium: { label: "Medium Impact", className: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400" },
  low: { label: "Low Impact", className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400" },
};

const categoryLabels: Record<string, string> = {
  "food-cost": "Food Cost",
  labour: "Labour",
  energy: "Energy",
  revenue: "Revenue Growth",
  waste: "Waste Reduction",
  delivery: "Delivery",
  marketing: "Customer Retention",
  supplier: "Property & Suppliers",
  menu: "Menu Engineering",
  nlw: "National Living Wage",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Recommendations() {
  const { data: monthlyDataList, isLoading } = useQuery<MonthlyData[]>({
    queryKey: ["/api/monthly-data"],
  });

  const latestData = monthlyDataList && monthlyDataList.length > 0
    ? monthlyDataList[monthlyDataList.length - 1] : null;

  const recommendations = latestData ? generateRecommendations(latestData) : [];
  const totalPotential = recommendations.reduce((sum, r) => sum + r.estimatedSaving, 0);
  const highImpactCount = recommendations.filter((r) => r.impact === "high").length;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full" data-testid="page-recommendations">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Smart Recommendations</h1>
        <p className="text-sm text-muted-foreground">
          Data-driven, UK-specific actions drawn from your actual numbers — not generic hospitality advice
        </p>
      </div>

      {recommendations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card data-testid="card-total-savings" className="border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground font-medium">Est. Monthly Profit Opportunity</span>
                <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {formatGBP(totalPotential)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">if all recommendations implemented</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground font-medium">Total Actions Identified</span>
                <div className="text-2xl font-bold mt-1">{recommendations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">across all cost and revenue areas</p>
              </CardContent>
            </Card>
            <Card className="border-red-500/20">
              <CardContent className="p-4 text-center">
                <span className="text-xs text-muted-foreground font-medium">High Impact Items</span>
                <div className="text-2xl font-bold mt-1 text-red-500">{highImpactCount}</div>
                <p className="text-xs text-muted-foreground mt-1">tackle these first</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              const impactCfg = impactConfig[rec.impact];
              return (
                <Card key={rec.id} data-testid={`card-recommendation-${rec.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug">{rec.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {categoryLabels[rec.category]}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${impactCfg.className}`}>
                                {impactCfg.label}
                              </Badge>
                            </div>
                          </div>
                          {rec.estimatedSaving > 0 && (
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {formatGBP(rec.estimatedSaving)}
                              </div>
                              <span className="text-xs text-muted-foreground">est. monthly saving</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>

                        {/* UK Context */}
                        {rec.ukContext && (
                          <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                              <strong>UK Context: </strong>{rec.ukContext}
                            </p>
                          </div>
                        )}

                        {/* Action steps */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action Steps</span>
                          {rec.actions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-md bg-muted/40">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="text-xs text-muted-foreground leading-relaxed">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* UK benchmark summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Your Metrics vs UK Restaurant Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {latestData && [
                  { label: "Food Cost %", actual: (latestData.foodCost / latestData.revenue) * 100, target: 30, unit: "%", lower: true },
                  { label: "Labour %", actual: (latestData.labourCost / latestData.revenue) * 100, target: 28, unit: "%", lower: true },
                  { label: "Energy %", actual: (latestData.energyCost / latestData.revenue) * 100, target: 7, unit: "%", lower: true },
                  { label: "Waste %", actual: (latestData.wasteCost / latestData.revenue) * 100, target: 2.5, unit: "%", lower: true },
                  { label: "Avg Ticket", actual: latestData.avgTicketSize, target: 28, unit: "£", lower: false },
                  { label: "Repeat Customers", actual: latestData.repeatCustomerRate, target: 35, unit: "%", lower: false },
                ].map((metric) => {
                  const isGood = metric.lower ? metric.actual <= metric.target : metric.actual >= metric.target;
                  const diff = metric.actual - metric.target;
                  return (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium">{metric.label}</div>
                        <div className="text-xs text-muted-foreground">UK target: {metric.lower ? "≤" : "≥"}{metric.unit === "£" ? `£${metric.target}` : `${metric.target}${metric.unit}`}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {metric.unit === "£" ? `£${metric.actual.toFixed(0)}` : `${metric.actual.toFixed(1)}${metric.unit}`}
                        </div>
                        <div className={`text-xs ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {isGood ? "On target" : `${Math.abs(diff).toFixed(1)}${metric.unit} off`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-lg font-medium">
              {latestData
                ? "Excellent — all your metrics are within healthy UK benchmarks."
                : "No financial data yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {latestData
                ? "Keep monitoring monthly. Benchmarks shift — staying ahead of them is the goal."
                : "Add your monthly revenue and cost data to receive personalised UK-benchmarked recommendations."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

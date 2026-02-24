import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, PlusCircle, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

function pct(val: number) { return `${val >= 0 ? "+" : ""}${val.toFixed(1)}%`; }
function fmt(val: number) { return `£${val.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`; }

function ChangeChip({ change }: { change: number | null }) {
  if (change === null) return <Badge variant="outline">No prior data</Badge>;
  if (Math.abs(change) < 0.1) return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />Flat</Badge>;
  return change > 0
    ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><TrendingUp className="h-3 w-3 mr-1" />{pct(change)}</Badge>
    : <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><TrendingDown className="h-3 w-3 mr-1" />{pct(change)}</Badge>;
}

function MetricCards({ current, previous, label }: { current: any; previous: any; label: string }) {
  if (!current) return <p className="text-muted-foreground text-sm">No data available for this period. Add monthly data first.</p>;

  const change = (key: string) => previous?.[key] ? ((current[key] - previous[key]) / previous[key]) * 100 : null;

  const metrics = [
    { label: "Revenue", key: "revenue", format: fmt, lowerBetter: false },
    { label: "Gross Profit %", key: "gpPercent", format: (v: number) => `${v.toFixed(1)}%`, lowerBetter: false },
    { label: "Food Cost %", key: "foodCostPercent", format: (v: number) => `${v.toFixed(1)}%`, lowerBetter: true },
    { label: "Labour Cost %", key: "labourCostPercent", format: (v: number) => `${v.toFixed(1)}%`, lowerBetter: true },
    { label: "Total Covers", key: "totalCovers", format: (v: number) => v.toLocaleString(), lowerBetter: false },
    { label: "Avg Ticket", key: "avgTicketSize", format: (v: number) => `£${v.toFixed(2)}`, lowerBetter: false },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
      {metrics.map(m => {
        const c = change(m.key);
        const isGood = c === null ? null : m.lowerBetter ? c < 0 : c > 0;
        return (
          <Card key={m.key} className="p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-xl font-bold mt-1">{current[m.key] != null ? m.format(current[m.key]) : "—"}</p>
            {previous && (
              <p className="text-xs text-muted-foreground mt-1">vs {label}: {previous[m.key] != null ? m.format(previous[m.key]) : "—"}</p>
            )}
            {c !== null && (
              <div className="mt-1">
                <Badge
                  className={isGood
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}
                >
                  {c > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {pct(c)}
                </Badge>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function ComparisonBar({ current, previous, sameLY, labels }: { current: any; previous: any; sameLY: any; labels: [string, string, string] }) {
  if (!current) return null;
  const keys = ["revenue", "foodCost", "labourCost", "energyCost", "rentCost"];
  const keyLabels: Record<string, string> = { revenue: "Revenue", foodCost: "Food Cost", labourCost: "Labour", energyCost: "Energy", rentCost: "Rent" };

  const data = keys.map(k => ({
    name: keyLabels[k],
    [labels[0]]: current?.[k] ?? 0,
    [labels[1]]: previous?.[k] ?? 0,
    [labels[2]]: sameLY?.[k] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => fmt(v)} />
        <Legend />
        <Bar dataKey={labels[0]} fill="#4f46e5" radius={[3, 3, 0, 0]} />
        <Bar dataKey={labels[1]} fill="#a5b4fc" radius={[3, 3, 0, 0]} />
        <Bar dataKey={labels[2]} fill="#e2e8f0" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Quarterly Tab ─────────────────────────────────────────────────────────────
function QuarterlyComparison({ restaurantId }: { restaurantId: number }) {
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [year, setYear] = useState(CURRENT_YEAR);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/comparisons/quarterly", restaurantId, quarter, year],
    queryFn: () => fetch(`/api/comparisons/quarterly?restaurantId=${restaurantId}&quarter=${quarter}&year=${year}`).then(r => r.json()),
  });

  const trendData = data?.trend?.filter(Boolean).map((t: any) => ({
    name: `Q${t.quarter} ${t.year}`,
    Revenue: t.revenue ?? 0,
    "GP %": t.gpPercent ?? 0,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <Label className="text-xs">Quarter</Label>
          <Select value={String(quarter)} onValueChange={v => setQuarter(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4].map(q => <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Q{quarter} {year} vs Previous Quarter</h3>
            <MetricCards current={data?.current} previous={data?.previous} label={`Q${data?.previous?.quarter} ${data?.previous?.year}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">Q{quarter} {year} vs Same Quarter Last Year</h3>
            <MetricCards current={data?.current} previous={data?.samePeriodLastYear} label={`Q${quarter} ${year - 1}`} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">4-Quarter Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ComparisonBar
                current={data?.current}
                previous={data?.previous}
                sameLY={data?.samePeriodLastYear}
                labels={[`Q${quarter} ${year}`, `Q${data?.previous?.quarter} ${data?.previous?.year}`, `Q${quarter} ${year - 1}`]}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Half-Yearly Tab ───────────────────────────────────────────────────────────
function HalfYearlyComparison({ restaurantId }: { restaurantId: number }) {
  const [half, setHalf] = useState(new Date().getMonth() < 6 ? 1 : 2);
  const [year, setYear] = useState(CURRENT_YEAR);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/comparisons/half-yearly", restaurantId, half, year],
    queryFn: () => fetch(`/api/comparisons/half-yearly?restaurantId=${restaurantId}&half=${half}&year=${year}`).then(r => r.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <Label className="text-xs">Half</Label>
          <Select value={String(half)} onValueChange={v => setHalf(Number(v))}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 (Jan–Jun)</SelectItem>
              <SelectItem value="2">H2 (Jul–Dec)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">H{half} {year} vs Previous Half</h3>
            <MetricCards
              current={data?.current}
              previous={data?.previous}
              label={`H${data?.previous?.half} ${data?.previous?.year}`}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">H{half} {year} vs H{half} {year - 1}</h3>
            <MetricCards
              current={data?.current}
              previous={data?.samePeriodLastYear}
              label={`H${half} ${year - 1}`}
            />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ComparisonBar
                current={data?.current}
                previous={data?.previous}
                sameLY={data?.samePeriodLastYear}
                labels={[`H${half} ${year}`, `H${data?.previous?.half} ${data?.previous?.year}`, `H${half} ${year - 1}`]}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Weekly Tab ────────────────────────────────────────────────────────────────
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
}

function WeeklyComparison({ restaurantId }: { restaurantId: number }) {
  const [weekNumber, setWeekNumber] = useState(getCurrentWeek());
  const [year, setYear] = useState(CURRENT_YEAR);
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<any>();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/comparisons/weekly", restaurantId, weekNumber, year],
    queryFn: () => fetch(`/api/comparisons/weekly?restaurantId=${restaurantId}&weekNumber=${weekNumber}&year=${year}`).then(r => r.json()),
  });

  const addMutation = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/weekly-data", { ...body, restaurantId, weekNumber, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparisons/weekly"] });
      setAddOpen(false);
      reset();
      toast({ title: "Weekly data saved" });
    },
    onError: () => toast({ title: "Failed to save weekly data", variant: "destructive" }),
  });

  const trend8 = data?.trend?.filter(Boolean) ?? [];
  const trendChartData = trend8.map((w: any) => ({
    name: `W${w.weekNumber}`,
    Revenue: w.revenue ?? 0,
    "Food Cost": w.foodCost ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <Label className="text-xs">Week Number</Label>
          <Select value={String(weekNumber)} onValueChange={v => setWeekNumber(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">
              {Array.from({ length: 53 }, (_, i) => i + 1).map(w => (
                <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Add Week {weekNumber} Data</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Weekly Data — Week {weekNumber}, {year}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(d => addMutation.mutate(d))} className="space-y-3 mt-2">
              {[
                { key: "revenue", label: "Revenue (£)" },
                { key: "foodCost", label: "Food Cost (£)" },
                { key: "labourCost", label: "Labour Cost (£)" },
                { key: "energyCost", label: "Energy Cost (£)" },
                { key: "rentCost", label: "Rent / Rates (£)" },
                { key: "marketingCost", label: "Marketing (£)" },
                { key: "suppliesCost", label: "Supplies (£)" },
                { key: "technologyCost", label: "Technology (£)" },
                { key: "wasteCost", label: "Food Waste (£)" },
                { key: "deliveryRevenue", label: "Delivery Revenue (£)" },
                { key: "dineInRevenue", label: "Dine-In Revenue (£)" },
                { key: "takeawayRevenue", label: "Takeaway Revenue (£)" },
                { key: "totalCovers", label: "Total Covers" },
                { key: "avgTicketSize", label: "Avg Ticket Size (£)" },
                { key: "repeatCustomerRate", label: "Repeat Customer Rate (%)" },
              ].map(f => (
                <div key={f.key} className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-sm">{f.label}</Label>
                  <Input type="number" step="0.01" placeholder="0" {...register(f.key, { valueAsNumber: true, required: true })} />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Saving…" : "Save Weekly Data"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
        <div className="space-y-6">
          {!data?.current && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No data for Week {weekNumber}, {year}.</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Add Week {weekNumber} Data" to enter figures.</p>
              </CardContent>
            </Card>
          )}
          {data?.current && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3">Week {weekNumber} vs Previous Week</h3>
                <MetricCards current={data.current} previous={data.previous} label={`W${data.previous?.weekNumber ?? ""} ${data.previous?.year ?? ""}`} />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Week {weekNumber} vs Same Week Last Year</h3>
                <MetricCards current={data.current} previous={data.samePeriodLastYear} label={`W${weekNumber} ${year - 1}`} />
              </div>
            </>
          )}
          {trendChartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">8-Week Rolling Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Food Cost" fill="#f97316" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PerformanceComparison() {
  const { data: restaurant } = useQuery<any>({
    queryKey: ["/api/restaurants/current"],
    queryFn: () => fetch("/api/restaurants/current").then(r => r.json()),
  });

  if (!restaurant) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance Comparison</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare your performance across different time periods — weekly, quarterly, and half-yearly.
        </p>
      </div>

      <Tabs defaultValue="quarterly">
        <TabsList>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="halfyearly">Half-Yearly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="quarterly" className="mt-4">
          <QuarterlyComparison restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="halfyearly" className="mt-4">
          <HalfYearlyComparison restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <WeeklyComparison restaurantId={restaurant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WasteLog, Ingredient } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, TrendingDown, AlertTriangle, Percent, PoundSterling,
  BarChart3, ListChecks,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const WASTE_REASONS = [
  { value: "spoilage", label: "Spoilage", color: "#ef4444" },
  { value: "overproduction", label: "Over-production", color: "#f97316" },
  { value: "plate_waste", label: "Plate Waste", color: "#eab308" },
  { value: "expired", label: "Expired", color: "#8b5cf6" },
  { value: "dropped", label: "Dropped / Damaged", color: "#3b82f6" },
  { value: "other", label: "Other", color: "#6b7280" },
];

const REASON_COLORS: Record<string, string> = Object.fromEntries(WASTE_REASONS.map(r => [r.value, r.color]));

export default function WasteLogPage() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [filterReason, setFilterReason] = useState("all");
  const [newLog, setNewLog] = useState({
    ingredientId: "",
    itemName: "",
    quantity: "",
    unit: "kg",
    costPerUnit: "",
    reason: "spoilage",
    notes: "",
  });

  const { data: restaurant } = useQuery<any>({ queryKey: ["/api/restaurants/current"] });
  const restaurantId = restaurant?.id || 1;

  const { data: wasteLogs = [] } = useQuery<WasteLog[]>({
    queryKey: ["/api/waste-logs", restaurantId],
  });
  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients", restaurantId],
  });
  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/waste-analytics", restaurantId],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/waste-logs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waste-logs", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/waste-analytics", restaurantId] });
      setShowAdd(false);
      setNewLog({ ingredientId: "", itemName: "", quantity: "", unit: "kg", costPerUnit: "", reason: "spoilage", notes: "" });
      toast({ title: "Waste logged" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/waste-logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waste-logs", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/waste-analytics", restaurantId] });
      toast({ title: "Waste log removed" });
    },
  });

  const filtered = filterReason === "all"
    ? wasteLogs
    : wasteLogs.filter(l => l.reason === filterReason);

  const sortedLogs = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const reasonPieData = useMemo(() => {
    if (!analytics?.byReason) return [];
    return analytics.byReason.map((r: any) => ({
      name: WASTE_REASONS.find(wr => wr.value === r.reason)?.label || r.reason,
      value: r.cost,
      fill: REASON_COLORS[r.reason] || "#6b7280",
    }));
  }, [analytics]);

  const monthlyBarData = useMemo(() => {
    if (!analytics?.byMonth) return [];
    return analytics.byMonth.map((m: any) => ({
      month: m.month,
      cost: parseFloat(m.cost.toFixed(2)),
    }));
  }, [analytics]);

  const calcTotalCost = () => {
    const qty = parseFloat(newLog.quantity) || 0;
    const cost = parseFloat(newLog.costPerUnit) || 0;
    return (qty * cost).toFixed(2);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-waste-log">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Waste Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Log food waste, track costs, and identify reduction opportunities</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button data-testid="button-log-waste">
              <Plus className="h-4 w-4 mr-2" />
              Log Waste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Waste Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Item (select ingredient or type name)</Label>
                <Select value={newLog.ingredientId} onValueChange={(v) => {
                  const ing = ingredients.find(i => i.id.toString() === v);
                  if (ing) {
                    setNewLog({ ...newLog, ingredientId: v, itemName: ing.name, unit: ing.unit, costPerUnit: ing.currentPrice.toString() });
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name} (£{ing.currentPrice}/{ing.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input className="mt-2" value={newLog.itemName} onChange={(e) => setNewLog({ ...newLog, itemName: e.target.value })} placeholder="Or type item name manually" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" step="0.1" value={newLog.quantity} onChange={(e) => setNewLog({ ...newLog, quantity: e.target.value })} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={newLog.unit} onChange={(e) => setNewLog({ ...newLog, unit: e.target.value })} />
                </div>
                <div>
                  <Label>Cost/Unit (£)</Label>
                  <Input type="number" step="0.01" value={newLog.costPerUnit} onChange={(e) => setNewLog({ ...newLog, costPerUnit: e.target.value })} />
                </div>
              </div>
              <div className="p-3 rounded-md bg-muted/50 text-center">
                <span className="text-xs text-muted-foreground">Total Waste Cost</span>
                <div className="text-lg font-bold text-red-500">£{calcTotalCost()}</div>
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={newLog.reason} onValueChange={(v) => setNewLog({ ...newLog, reason: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WASTE_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={newLog.notes} onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })} placeholder="e.g., left out overnight" />
              </div>
              <Button className="w-full" disabled={!newLog.itemName || !newLog.quantity || !newLog.costPerUnit} onClick={() => {
                const qty = parseFloat(newLog.quantity);
                const cost = parseFloat(newLog.costPerUnit);
                createMutation.mutate({
                  restaurantId,
                  ingredientId: newLog.ingredientId ? parseInt(newLog.ingredientId) : null,
                  itemName: newLog.itemName,
                  quantity: qty,
                  unit: newLog.unit,
                  costPerUnit: cost,
                  totalCost: qty * cost,
                  reason: newLog.reason,
                  notes: newLog.notes || null,
                });
              }}>Log Waste</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <PoundSterling className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-xs text-muted-foreground">Total Waste Cost</div>
            <div className="text-2xl font-bold text-red-500">£{(analytics?.totalWasteCost || 0).toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Waste % of Purchases</div>
            <div className={`text-2xl font-bold ${(analytics?.wastePercentage || 0) > 5 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
              {(analytics?.wastePercentage || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ListChecks className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Total Logs</div>
            <div className="text-2xl font-bold">{analytics?.totalLogs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Target Waste %</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">&lt;3%</div>
          </CardContent>
        </Card>
      </div>

      {/* Warning if waste is high */}
      {(analytics?.wastePercentage || 0) > 5 && (
        <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">High Waste Alert</p>
              <p className="text-xs text-muted-foreground">
                Your waste is {(analytics?.wastePercentage || 0).toFixed(1)}% of purchases. Industry best practice is below 3%.
                Focus on the top wasted items below to reduce costs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Waste by Reason Pie */}
        {reasonPieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Waste by Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" data-testid="chart-waste-reason">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reasonPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {reasonPieData.map((entry: any, idx: number) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `£${value.toFixed(2)}`} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Waste by Month Bar */}
        {monthlyBarData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Monthly Waste Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56" data-testid="chart-waste-monthly">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBarData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                    <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, "Waste Cost"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                    <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Wasted Items */}
      {analytics?.topWastedItems?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Top Wasted Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topWastedItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">#{idx + 1}</span>
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="text-xs">{item.count}x</Badge>
                  </div>
                  <span className="font-medium text-red-500">£{item.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Log Table */}
      <div className="flex items-center gap-3">
        <Label className="text-sm">Filter:</Label>
        <Select value={filterReason} onValueChange={setFilterReason}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            {WASTE_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Waste Log ({sortedLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No waste logged yet. Click "Log Waste" to start tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">Cost</th>
                    <th className="pb-2 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Notes</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log) => {
                    const reasonLabel = WASTE_REASONS.find(r => r.value === log.reason)?.label || log.reason;
                    const reasonColor = REASON_COLORS[log.reason] || "#6b7280";
                    return (
                      <tr key={log.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 text-muted-foreground">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="py-2 font-medium">{log.itemName}</td>
                        <td className="py-2 text-right">{log.quantity} {log.unit}</td>
                        <td className="py-2 text-right text-red-500 font-medium">£{log.totalCost.toFixed(2)}</td>
                        <td className="py-2">
                          <Badge variant="outline" style={{ borderColor: reasonColor, color: reasonColor }} className="text-xs">
                            {reasonLabel}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground text-xs max-w-[150px] truncate">{log.notes || "—"}</td>
                        <td className="py-2 text-right">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                            if (confirm("Delete this waste log entry?")) deleteMutation.mutate(log.id);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

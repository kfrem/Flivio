import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Building2, TrendingUp, TrendingDown, Users, Star, AlertTriangle, CheckCircle2, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fmt = (v: number) => `£${v.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
const pct = (v: number) => `${v.toFixed(1)}%`;

// ── Create Franchise Group Form ───────────────────────────────────────────────
function CreateGroupDialog({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/franchise-groups", data),
    onSuccess: async (res) => {
      const group = await res.json();
      qc.invalidateQueries({ queryKey: ["/api/franchise-groups"] });
      setOpen(false);
      reset();
      toast({ title: `Franchise group "${group.name}" created` });
      onCreated(group.id);
    },
    onError: () => toast({ title: "Failed to create group", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="h-4 w-4 mr-2" />Create Franchise Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Franchise Group</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, ownerId: "current-user", approvedSupplierPolicy: d.approvedSupplierPolicy || "recommended" }))} className="space-y-4 mt-2">
          <div>
            <Label>Brand / Group Name</Label>
            <Input placeholder="e.g. Chicken Shop UK" {...register("name", { required: true })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe the franchise network…" {...register("description")} />
          </div>
          <div>
            <Label>Supplier Policy</Label>
            <Select defaultValue="recommended" onValueChange={() => {}}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended (advisory)</SelectItem>
                <SelectItem value="required">Required (franchisees must comply)</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("approvedSupplierPolicy")} defaultValue="recommended" />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Location to Franchise ─────────────────────────────────────────────────
function AddLocationDialog({ franchiseGroupId }: { franchiseGroupId: number }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/franchise-memberships", { franchiseGroupId, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/franchise-memberships", franchiseGroupId] });
      qc.invalidateQueries({ queryKey: ["/api/franchise-analytics", franchiseGroupId] });
      setOpen(false);
      reset();
      toast({ title: "Location added to franchise network" });
    },
    onError: () => toast({ title: "Failed to add location", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><PlusCircle className="h-4 w-4 mr-2" />Add Location</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Franchise Location</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate({ restaurantId: parseInt(d.restaurantId), role: d.role || "franchisee" }))} className="space-y-4 mt-2">
          <div>
            <Label>Restaurant ID</Label>
            <Input type="number" placeholder="Enter restaurant ID" {...register("restaurantId", { required: true })} />
            <p className="text-xs text-muted-foreground mt-1">Ask the franchisee for their restaurant ID from the platform.</p>
          </div>
          <div>
            <Label>Role</Label>
            <Select defaultValue="franchisee">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="franchisee">Franchisee</SelectItem>
                <SelectItem value="franchisor">Franchisor (admin location)</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("role")} defaultValue="franchisee" />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding…" : "Add to Network"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Approved Supplier ─────────────────────────────────────────────────────
function AddApprovedSupplierDialog({ franchiseGroupId }: { franchiseGroupId: number }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/franchise-approved-suppliers", { franchiseGroupId, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/franchise-analytics", franchiseGroupId] });
      setOpen(false);
      reset();
      toast({ title: "Approved supplier added" });
    },
    onError: () => toast({ title: "Failed to add supplier", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><PlusCircle className="h-4 w-4 mr-2" />Add Approved Supplier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Approved / Recommended Supplier</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, contractedPrice: d.contractedPrice ? parseFloat(d.contractedPrice) : null, isRequired: d.isRequired === "true" }))} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Supplier Name</Label>
              <Input placeholder="e.g. Premier Foods" {...register("name", { required: true })} />
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Select defaultValue="produce">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["produce","protein","dairy","seafood","dry goods","beverages","packaging","other"].map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("category")} defaultValue="produce" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Ingredient / Product</Label>
              <Input placeholder="e.g. Chicken Breast" {...register("ingredientName")} />
            </div>
            <div>
              <Label className="text-sm">Contracted Price (optional)</Label>
              <Input type="number" step="0.01" placeholder="£ per unit" {...register("contractedPrice")} />
            </div>
          </div>
          <div>
            <Label className="text-sm">Unit</Label>
            <Input placeholder="kg / litre / pack" {...register("unit")} />
          </div>
          <div>
            <Label className="text-sm">Contact Info</Label>
            <Input placeholder="Phone / email / website" {...register("contactInfo")} />
          </div>
          <div>
            <Label className="text-sm">Notes for franchisees</Label>
            <Textarea placeholder="Quality standards, ordering process, minimum order qty…" {...register("notes")} />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="isRequired" onCheckedChange={v => {}} />
            <Label htmlFor="isRequired" className="text-sm">Required (not just recommended)</Label>
            <input type="hidden" {...register("isRequired")} defaultValue="false" />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding…" : "Add Approved Supplier"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Network Overview ──────────────────────────────────────────────────────────
function NetworkOverview({ analytics }: { analytics: any }) {
  const { networkSummary, locations, totalLocations } = analytics;

  const chartData = locations
    .filter((l: any) => l.summary)
    .sort((a: any, b: any) => (b.summary?.gpPercent ?? 0) - (a.summary?.gpPercent ?? 0))
    .map((l: any) => ({
      name: l.restaurant.name.length > 14 ? l.restaurant.name.slice(0, 14) + "…" : l.restaurant.name,
      "GP %": parseFloat((l.summary?.gpPercent ?? 0).toFixed(1)),
      "Food %": parseFloat((l.summary?.foodCostPercent ?? 0).toFixed(1)),
    }));

  const networkAvgGP = locations.reduce((a: number, l: any) => a + (l.summary?.gpPercent ?? 0), 0) / (locations.filter((l: any) => l.summary).length || 1);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="h-4 w-4" /><span className="text-xs">Locations</span></div>
          <p className="text-2xl font-bold">{totalLocations}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs">Network Revenue</span></div>
          <p className="text-2xl font-bold">{networkSummary ? fmt(networkSummary.revenue) : "—"}</p>
          <p className="text-xs text-muted-foreground">all time</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><Star className="h-4 w-4" /><span className="text-xs">Avg GP %</span></div>
          <p className="text-2xl font-bold">{pct(networkAvgGP)}</p>
          <p className="text-xs text-muted-foreground">across network</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><ShoppingBag className="h-4 w-4" /><span className="text-xs">Network Food Cost %</span></div>
          <p className="text-2xl font-bold">{networkSummary ? pct(networkSummary.foodCostPercent) : "—"}</p>
        </Card>
      </div>

      {/* Location performance chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location GP% Ranking</CardTitle>
            <CardDescription>All-time gross profit margin by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="GP %" fill="#4f46e5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Location table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Location Performance</CardTitle>
          <AddLocationDialog franchiseGroupId={analytics.group.id} />
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              No locations yet. Add your first franchisee location above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Food %</TableHead>
                  <TableHead>Labour %</TableHead>
                  <TableHead>GP %</TableHead>
                  <TableHead>vs Network</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((l: any) => {
                  const s = l.summary;
                  const gpDelta = s ? s.gpPercent - networkAvgGP : null;
                  return (
                    <TableRow key={l.restaurant.id}>
                      <TableCell className="font-medium">
                        <div>{l.restaurant.name}</div>
                        <div className="text-xs text-muted-foreground">{l.restaurant.location}</div>
                      </TableCell>
                      <TableCell>{s ? fmt(s.revenue) : "—"}</TableCell>
                      <TableCell>
                        {s ? (
                          <span className={s.foodCostPercent > 35 ? "text-red-600 font-medium" : s.foodCostPercent < 28 ? "text-green-600 font-medium" : ""}>
                            {pct(s.foodCostPercent)}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {s ? (
                          <span className={s.labourCostPercent > 32 ? "text-red-600 font-medium" : ""}>
                            {pct(s.labourCostPercent)}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">{s ? pct(s.gpPercent) : "—"}</TableCell>
                      <TableCell>
                        {gpDelta !== null ? (
                          <Badge className={gpDelta >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
                            {gpDelta >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {gpDelta >= 0 ? "+" : ""}{gpDelta.toFixed(1)}pp
                          </Badge>
                        ) : <Badge variant="outline">No data</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Approved Suppliers Tab ────────────────────────────────────────────────────
function ApprovedSuppliersTab({ analytics }: { analytics: any }) {
  const { approvedSuppliers, group } = analytics;
  const { toast } = useToast();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/franchise-approved-suppliers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/franchise-analytics", group.id] });
      toast({ title: "Supplier removed" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            These suppliers are {group.approvedSupplierPolicy === "required" ? <strong>required</strong> : "recommended"} for all franchisee locations.
            {group.approvedSupplierPolicy === "required" && " Franchisees must purchase from these suppliers."}
          </p>
        </div>
        <AddApprovedSupplierDialog franchiseGroupId={group.id} />
      </div>

      {approvedSuppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No approved suppliers yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add suppliers your franchisees should use to benefit from network pricing.</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Contracted Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvedSuppliers.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <div>{s.name}</div>
                  {s.contactInfo && <div className="text-xs text-muted-foreground">{s.contactInfo}</div>}
                </TableCell>
                <TableCell className="capitalize">{s.category}</TableCell>
                <TableCell>{s.ingredientName || "—"}</TableCell>
                <TableCell>
                  {s.contractedPrice ? `£${s.contractedPrice.toFixed(2)} / ${s.unit || "unit"}` : "—"}
                </TableCell>
                <TableCell>
                  {s.isRequired
                    ? <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Required</Badge>
                    : <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><CheckCircle2 className="h-3 w-3 mr-1" />Recommended</Badge>
                  }
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteMutation.mutate(s.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Price Intelligence Tab ────────────────────────────────────────────────────
function PriceIntelligenceTab({ analytics }: { analytics: any }) {
  const { priceIntelligence } = analytics;

  if (priceIntelligence.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No price intelligence data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Franchisees submit their supplier prices via the Supplier Intelligence page.
            Once data is in, you'll see price variance across the network here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Price variance analysis across your network. High-variance ingredients present the best negotiation opportunities.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Network Avg</TableHead>
            <TableHead>Min Price</TableHead>
            <TableHead>Max Price</TableHead>
            <TableHead>Variance</TableHead>
            <TableHead>Data Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priceIntelligence.map((row: any) => (
            <TableRow key={row.ingredient}>
              <TableCell className="font-medium">{row.ingredient}</TableCell>
              <TableCell>{row.unit}</TableCell>
              <TableCell>£{row.avg.toFixed(2)}</TableCell>
              <TableCell className="text-green-600">£{row.min.toFixed(2)}</TableCell>
              <TableCell className="text-red-600">£{row.max.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={row.variance > row.avg * 0.2 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800"}>
                  £{row.variance.toFixed(2)} ({row.avg > 0 ? ((row.variance / row.avg) * 100).toFixed(0) : 0}%)
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.dataPoints} locations</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        Tip: Ingredients with high variance are prime targets for network-wide supplier negotiations.
        Use the minimum price paid as your opening position.
      </p>
    </div>
  );
}

// ── Main Franchise Hub ────────────────────────────────────────────────────────
export default function FranchiseHub() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/franchise-analytics", selectedGroupId],
    queryFn: () => selectedGroupId
      ? fetch(`/api/franchise-analytics/${selectedGroupId}`).then(r => r.json())
      : Promise.resolve(null),
    enabled: !!selectedGroupId,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Franchise Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your franchise network, approved suppliers, and price intelligence across all locations.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div>
            <Label className="text-xs text-muted-foreground">Franchise Group ID</Label>
            <Input
              type="number"
              placeholder="Enter group ID"
              className="w-40"
              onChange={e => setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="mt-4">
            <CreateGroupDialog onCreated={id => setSelectedGroupId(id)} />
          </div>
        </div>
      </div>

      {!selectedGroupId && (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">No franchise group selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create a new franchise group or enter your existing group ID to view your network dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedGroupId && isLoading && (
        <p className="text-muted-foreground text-sm">Loading franchise network…</p>
      )}

      {analytics && !analytics.message && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold">{analytics.group.name}</h2>
              {analytics.group.description && (
                <p className="text-sm text-muted-foreground">{analytics.group.description}</p>
              )}
            </div>
            <Badge variant={analytics.group.approvedSupplierPolicy === "required" ? "destructive" : "secondary"}>
              Suppliers: {analytics.group.approvedSupplierPolicy}
            </Badge>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Network Overview</TabsTrigger>
              <TabsTrigger value="suppliers">Approved Suppliers</TabsTrigger>
              <TabsTrigger value="intelligence">Price Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <NetworkOverview analytics={analytics} />
            </TabsContent>

            <TabsContent value="suppliers" className="mt-4">
              <ApprovedSuppliersTab analytics={analytics} />
            </TabsContent>

            <TabsContent value="intelligence" className="mt-4">
              <PriceIntelligenceTab analytics={analytics} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {analytics?.message && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {analytics.message}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

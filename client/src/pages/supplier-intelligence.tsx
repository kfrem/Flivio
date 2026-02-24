import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, TrendingDown, TrendingUp, CheckCircle2, AlertTriangle, Lightbulb, ShoppingBag, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

function SavingChip({ differencePercent }: { differencePercent: number | null }) {
  if (differencePercent === null) return <Badge variant="outline">No network data</Badge>;
  if (Math.abs(differencePercent) < 2) return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />On par</Badge>;
  if (differencePercent > 0) {
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <TrendingUp className="h-3 w-3 mr-1" />
        {differencePercent.toFixed(1)}% above avg — room to negotiate
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      <TrendingDown className="h-3 w-3 mr-1" />
      {Math.abs(differencePercent).toFixed(1)}% below avg — good deal
    </Badge>
  );
}

// ── Submit Price Report Form ──────────────────────────────────────────────────
function SubmitPriceReportDialog({ restaurantId, franchiseGroupId }: { restaurantId: number; franchiseGroupId: number }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<any>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/supplier-price-reports", {
      restaurantId,
      franchiseGroupId,
      ...data,
      unitPrice: parseFloat(data.unitPrice),
      month: CURRENT_MONTH,
      year: CURRENT_YEAR,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/supplier-intelligence"] });
      setOpen(false);
      reset();
      toast({ title: "Price report submitted — thank you!" });
    },
    onError: () => toast({ title: "Failed to submit price report", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><PlusCircle className="h-4 w-4 mr-2" />Submit Price Report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Supplier Price Report</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Share what you're paying for an ingredient. Your data is anonymised within the network — other franchisees only see averages, not your restaurant name.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 mt-2">
          <div>
            <Label>Ingredient / Product Name</Label>
            <Input placeholder="e.g. Chicken Breast, Whole Milk, Frying Oil" {...register("ingredientName", { required: true })} />
          </div>
          <div>
            <Label>Supplier Name</Label>
            <Input placeholder="e.g. Premier Foods, Bidvest, Local Butcher" {...register("supplierName", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price You Pay</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...register("unitPrice", { required: true })} />
            </div>
            <div>
              <Label>Per Unit</Label>
              <Select defaultValue="kg" onValueChange={v => setValue("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["kg","g","litre","ml","pack","case","each","dozen"].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("unit")} defaultValue="kg" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting…" : "Submit Price Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Price Comparison Table ────────────────────────────────────────────────────
function PriceComparisonTable({ intelligence }: { intelligence: any[] }) {
  if (intelligence.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-8 pb-8 text-center">
          <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No price intelligence yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Submit your first price report above to start seeing how your costs compare to the network.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total potential monthly saving
  const totalPotentialSaving = intelligence.reduce((sum, row) => {
    if (row.differencePercent !== null && row.differencePercent > 0 && row.networkAvg !== null) {
      // Rough estimate: difference × assumed monthly usage (we don't have quantity, so just show price delta)
      return sum + (row.myPrice - row.networkAvg);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      {totalPotentialSaving > 0.5 && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">Negotiation Opportunity Identified</p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  You're paying above the network average on {intelligence.filter(r => (r.differencePercent ?? 0) > 2).length} ingredients.
                  Use the network average prices in the table below as your starting negotiation position with your current suppliers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Your Supplier</TableHead>
            <TableHead>Your Price</TableHead>
            <TableHead>Network Avg</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {intelligence.map((row) => (
            <TableRow key={row.ingredient}>
              <TableCell className="font-medium">{row.ingredient}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{row.mySupplier}</TableCell>
              <TableCell>
                <span className="font-semibold">£{row.myPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground"> /{row.unit}</span>
              </TableCell>
              <TableCell>
                {row.networkAvg !== null ? (
                  <>
                    <span className="font-semibold">£{row.networkAvg.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground"> /{row.unit}</span>
                  </>
                ) : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                <SavingChip differencePercent={row.differencePercent} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {row.networkDataPoints > 0 ? `${row.networkDataPoints} other locations` : "Only you so far"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-xs text-muted-foreground">
        Network averages are based on anonymised price reports from other franchisee locations.
        Your restaurant identity is never revealed — only aggregate averages are shown to other members.
      </p>
    </div>
  );
}

// ── Approved Suppliers Tab ────────────────────────────────────────────────────
function ApprovedSuppliersTab({ approvedSuppliers }: { approvedSuppliers: any[] }) {
  if (approvedSuppliers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-8 pb-8 text-center">
          <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No approved suppliers set by your franchisor yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Your franchisor will add recommended suppliers here when available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Suppliers approved or required by your franchise group. Using these suppliers ensures quality standards and may give you access to network-negotiated pricing.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>For Ingredient</TableHead>
            <TableHead>Contracted Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedSuppliers.map((s: any) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell className="capitalize">{s.category}</TableCell>
              <TableCell>{s.ingredientName || "General"}</TableCell>
              <TableCell>
                {s.contractedPrice ? (
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    £{s.contractedPrice.toFixed(2)} / {s.unit || "unit"}
                  </span>
                ) : "See notes"}
              </TableCell>
              <TableCell>
                {s.isRequired
                  ? <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Required</Badge>
                  : <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><CheckCircle2 className="h-3 w-3 mr-1" />Recommended</Badge>
                }
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{s.contactInfo || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SupplierIntelligence() {
  const [franchiseGroupId, setFranchiseGroupId] = useState<number | null>(null);

  const { data: restaurant } = useQuery<any>({
    queryKey: ["/api/restaurants/current"],
    queryFn: () => fetch("/api/restaurants/current").then(r => r.json()),
  });

  const { data: intelligence, isLoading } = useQuery<any>({
    queryKey: ["/api/supplier-intelligence", restaurant?.id, franchiseGroupId],
    queryFn: () => franchiseGroupId && restaurant?.id
      ? fetch(`/api/supplier-intelligence/${restaurant.id}/${franchiseGroupId}`).then(r => r.json())
      : Promise.resolve(null),
    enabled: !!franchiseGroupId && !!restaurant?.id,
  });

  if (!restaurant) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">
          See how your supplier prices compare to the rest of the network. Use this intelligence to negotiate better deals.
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-xs">Franchise Group ID</Label>
              <Input
                type="number"
                placeholder="Enter your franchise group ID"
                className="w-52"
                onChange={e => setFranchiseGroupId(e.target.value ? parseInt(e.target.value) : null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Your franchisor will provide this ID.</p>
            </div>
            {franchiseGroupId && restaurant?.id && (
              <SubmitPriceReportDialog restaurantId={restaurant.id} franchiseGroupId={franchiseGroupId} />
            )}
          </div>
        </CardContent>
      </Card>

      {!franchiseGroupId && (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">Enter your franchise group ID to begin</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Once connected to your franchise group, you can submit your supplier prices and see how they compare to anonymised network averages — giving you the intelligence to negotiate better deals.
            </p>
          </CardContent>
        </Card>
      )}

      {franchiseGroupId && isLoading && (
        <p className="text-muted-foreground text-sm">Loading intelligence data…</p>
      )}

      {intelligence && !intelligence.message && (
        <Tabs defaultValue="comparison">
          <TabsList>
            <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
            <TabsTrigger value="approved">Approved Suppliers ({intelligence.approvedSuppliers?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-4">
            <PriceComparisonTable intelligence={intelligence.intelligence ?? []} />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <ApprovedSuppliersTab approvedSuppliers={intelligence.approvedSuppliers ?? []} />
          </TabsContent>
        </Tabs>
      )}

      {intelligence?.message && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">
            {intelligence.message}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

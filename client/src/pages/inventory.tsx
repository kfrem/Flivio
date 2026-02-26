import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { InventoryItem, Ingredient } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Package, AlertTriangle, ArrowDown, ArrowUp,
  Warehouse, Thermometer, Snowflake, Wine, Edit2, Check,
} from "lucide-react";

const STORAGE_LOCATIONS = [
  { value: "dry_store", label: "Dry Store", icon: Warehouse },
  { value: "walk_in", label: "Walk-in Fridge", icon: Thermometer },
  { value: "freezer", label: "Freezer", icon: Snowflake },
  { value: "bar", label: "Bar", icon: Wine },
];

export default function Inventory() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [newItem, setNewItem] = useState({
    ingredientId: "",
    currentStock: "",
    parLevel: "",
    unit: "kg",
    storageLocation: "dry_store",
  });

  const { data: restaurant } = useQuery<any>({ queryKey: ["/api/restaurants/current"] });
  const restaurantId = restaurant?.id || 1;

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory-items", restaurantId],
  });
  const { data: ingredients = [] } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients", restaurantId],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inventory-items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items", restaurantId] });
      setShowAdd(false);
      setNewItem({ ingredientId: "", currentStock: "", parLevel: "", unit: "kg", storageLocation: "dry_store" });
      toast({ title: "Inventory item added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/inventory-items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items", restaurantId] });
      setEditId(null);
      toast({ title: "Stock updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-items", restaurantId] });
      toast({ title: "Inventory item removed" });
    },
  });

  const ingredientMap = useMemo(() => {
    const map: Record<number, Ingredient> = {};
    for (const ing of ingredients) map[ing.id] = ing;
    return map;
  }, [ingredients]);

  const trackedIngredientIds = useMemo(() => new Set(inventoryItems.map(i => i.ingredientId)), [inventoryItems]);
  const availableIngredients = ingredients.filter(i => !trackedIngredientIds.has(i.id));

  const filtered = filterLocation === "all"
    ? inventoryItems
    : inventoryItems.filter(i => i.storageLocation === filterLocation);

  const lowStockCount = inventoryItems.filter(i => i.parLevel > 0 && i.currentStock <= i.parLevel).length;
  const outOfStockCount = inventoryItems.filter(i => i.currentStock <= 0).length;
  const totalValue = inventoryItems.reduce((sum, item) => {
    const ing = ingredientMap[item.ingredientId];
    return sum + (ing ? item.currentStock * ing.currentPrice : 0);
  }, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-inventory">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track stock levels, set par levels, and get low stock alerts</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-inventory">
              <Plus className="h-4 w-4 mr-2" />
              Track Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add to Inventory</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ingredient</Label>
                <Select value={newItem.ingredientId} onValueChange={(v) => {
                  const ing = ingredients.find(i => i.id.toString() === v);
                  setNewItem({ ...newItem, ingredientId: v, unit: ing?.unit || "kg" });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                  <SelectContent>
                    {availableIngredients.map((ing) => (
                      <SelectItem key={ing.id} value={ing.id.toString()}>{ing.name} ({ing.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Current Stock</Label>
                  <Input type="number" step="0.1" value={newItem.currentStock} onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <Label>Par Level (reorder at)</Label>
                  <Input type="number" step="0.1" value={newItem.parLevel} onChange={(e) => setNewItem({ ...newItem, parLevel: e.target.value })} placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Storage Location</Label>
                <Select value={newItem.storageLocation} onValueChange={(v) => setNewItem({ ...newItem, storageLocation: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STORAGE_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled={!newItem.ingredientId || !newItem.currentStock} onClick={() => {
                createMutation.mutate({
                  restaurantId,
                  ingredientId: parseInt(newItem.ingredientId),
                  currentStock: parseFloat(newItem.currentStock),
                  parLevel: parseFloat(newItem.parLevel) || 0,
                  unit: newItem.unit,
                  storageLocation: newItem.storageLocation,
                });
              }}>Add to Inventory</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Items Tracked</div>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Stock Value</div>
            <div className="text-2xl font-bold text-primary">£{totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowDown className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-xs text-muted-foreground">Low Stock</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-xs text-muted-foreground">Out of Stock</div>
            <div className="text-2xl font-bold text-red-500">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockCount > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventoryItems
                .filter(i => i.parLevel > 0 && i.currentStock <= i.parLevel)
                .map((item) => {
                  const ing = ingredientMap[item.ingredientId];
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ing?.name || "Unknown"}</span>
                      <span>
                        {item.currentStock <= 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {item.currentStock} {item.unit} (par: {item.parLevel})
                          </Badge>
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm">Filter:</Label>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {STORAGE_LOCATIONS.map((loc) => (
              <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Stock Levels ({filtered.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No inventory items tracked yet. Click "Track Ingredient" to start.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Ingredient</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium text-right">Stock</th>
                    <th className="pb-2 font-medium text-right">Par Level</th>
                    <th className="pb-2 font-medium text-right">Value</th>
                    <th className="pb-2 font-medium text-right">Status</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const ing = ingredientMap[item.ingredientId];
                    const value = ing ? item.currentStock * ing.currentPrice : 0;
                    const isLow = item.parLevel > 0 && item.currentStock <= item.parLevel;
                    const isOut = item.currentStock <= 0;
                    const loc = STORAGE_LOCATIONS.find(l => l.value === item.storageLocation);
                    const isEditing = editId === item.id;

                    return (
                      <tr key={item.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium">{ing?.name || "Unknown"}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">{loc?.label || item.storageLocation}</Badge>
                        </td>
                        <td className="py-2 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                step="0.1"
                                className="w-20 h-7 text-right text-sm"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                              />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                updateMutation.mutate({
                                  id: item.id,
                                  data: { currentStock: parseFloat(editStock), lastCountDate: new Date().toISOString() },
                                });
                              }}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span>{item.currentStock} {item.unit}</span>
                          )}
                        </td>
                        <td className="py-2 text-right">{item.parLevel} {item.unit}</td>
                        <td className="py-2 text-right">£{value.toFixed(2)}</td>
                        <td className="py-2 text-right">
                          {isOut ? (
                            <Badge variant="destructive">Out</Badge>
                          ) : isLow ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Low</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">OK</Badge>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                              setEditId(item.id);
                              setEditStock(item.currentStock.toString());
                            }}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                              if (confirm("Remove this item from inventory tracking?")) deleteMutation.mutate(item.id);
                            }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

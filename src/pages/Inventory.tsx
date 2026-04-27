import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts, useDeleteProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useSearch } from "@/context/SearchContext";
import { useDebounce } from "@/hooks/useDebounce";
import { AvailabilityBadge } from "@/components/products/AvailabilityBadge";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { fetchProductImageAsFile } from "@/services/api";
import { formatDisplayDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const LOW_STOCK_THRESHOLD = 5;

function formatPrice(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value ?? 0);
}

export default function Inventory() {
  const navigate = useNavigate();
  const { keyword } = useSearch();
  const debounced = useDebounce(keyword, 300);
  const { data, isLoading, isError, error } = useProducts(debounced);
  const del = useDeleteProduct();
  const update = useUpdateProduct();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [singleDelete, setSingleDelete] = useState<Product | null>(null);
  const [editingQty, setEditingQty] = useState<Record<number, string>>({});

  const products = data ?? [];
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const lowStockCount = useMemo(
    () => products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD).length,
    [products],
  );

  const persistChange = async (p: Product, patch: Partial<Product>) => {
    try {
      const file = await fetchProductImageAsFile(p.id, p.imageName ?? "image");
      const updated: Partial<Product> = { ...p, ...patch };
      update.mutate(
        { id: p.id, product: updated, imageFile: file },
        {
          onSuccess: () => toast.success("Updated"),
          onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
        },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const handleQtyBlur = (p: Product) => {
    const raw = editingQty[p.id];
    if (raw === undefined) return;
    const next = Math.max(0, Math.floor(Number(raw)));
    setEditingQty((s) => {
      const copy = { ...s };
      delete copy[p.id];
      return copy;
    });
    if (Number.isNaN(next) || next === p.quantity) return;
    persistChange(p, { quantity: next });
  };

  const runBulkDelete = async () => {
    const ids = Array.from(selected);
    setBulkConfirm(false);
    let ok = 0;
    for (const id of ids) {
      try {
        await del.mutateAsync(id);
        ok++;
      } catch {
        /* continue */
      }
    }
    setSelected(new Set());
    toast.success(`Deleted ${ok} of ${ids.length} products`);
  };

  const runBulkAvailability = async (available: boolean) => {
    const targets = products.filter((p) => selected.has(p.id));
    let ok = 0;
    for (const p of targets) {
      try {
        const file = await fetchProductImageAsFile(p.id, p.imageName ?? "image");
        await update.mutateAsync({ id: p.id, product: { ...p, available }, imageFile: file });
        ok++;
      } catch {
        /* continue */
      }
    }
    setSelected(new Set());
    toast.success(`Marked ${ok} as ${available ? "available" : "unavailable"}`);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">
            Admin view: edit stock & availability inline, run bulk actions.
          </p>
        </div>
        {lowStockCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-md bg-warning/15 text-warning-foreground px-3 py-1.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            {lowStockCount} low-stock item{lowStockCount === 1 ? "" : "s"}
          </div>
        )}
      </header>

      {selected.size > 0 && (
        <Card className="p-3 flex flex-wrap items-center gap-2 shadow-[var(--shadow-soft)] border-primary/40">
          <span className="text-sm font-medium px-2">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => runBulkAvailability(true)}>
              Mark available
            </Button>
            <Button size="sm" variant="outline" onClick={() => runBulkAvailability(false)}>
              Mark unavailable
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkConfirm(true)}>
              <Trash2 className="h-4 w-4" /> Delete selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-destructive">
            {error instanceof Error ? error.message : "Failed to load"}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No products to manage.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[42px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[120px]">Quantity</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const low = p.quantity < LOW_STOCK_THRESHOLD;
                  const editingValue = editingQty[p.id] ?? String(p.quantity);
                  return (
                    <TableRow
                      key={p.id}
                      className={cn(low && "bg-warning/5 hover:bg-warning/10")}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(p.id)}
                          onCheckedChange={() => toggleOne(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">#{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {low && <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                          <Input
                            type="number"
                            min={0}
                            value={editingValue}
                            onChange={(e) =>
                              setEditingQty((s) => ({ ...s, [p.id]: e.target.value }))
                            }
                            onBlur={() => handleQtyBlur(p)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            }}
                            className="h-8 w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={p.available}
                            onCheckedChange={(c) => persistChange(p, { available: c })}
                            aria-label="Toggle availability"
                          />
                          <AvailabilityBadge available={p.available} quantity={p.quantity} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPrice(p.price)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDisplayDate(p.releaseDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="View"
                            onClick={() => navigate(`/products/${p.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => navigate(`/products/${p.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete"
                            onClick={() => setSingleDelete(p)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <DeleteProductDialog
        open={!!singleDelete}
        productName={singleDelete?.name ?? ""}
        onCancel={() => setSingleDelete(null)}
        onConfirm={() => {
          if (!singleDelete) return;
          del.mutate(singleDelete.id, {
            onSuccess: () => {
              toast.success(`Deleted "${singleDelete.name}"`);
              setSingleDelete(null);
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
          });
        }}
        loading={del.isPending}
      />

      <DeleteProductDialog
        open={bulkConfirm}
        productName={`${selected.size} products`}
        onCancel={() => setBulkConfirm(false)}
        onConfirm={runBulkDelete}
        loading={del.isPending}
      />
    </section>
  );
}
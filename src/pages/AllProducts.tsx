import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, PackageOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useSearch } from "@/context/SearchContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/products/ProductImage";
import { AvailabilityBadge } from "@/components/products/AvailabilityBadge";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { formatDisplayDate, parseApiDate } from "@/lib/date";
import type { Product } from "@/types/product";

type SortKey =
  | "name-asc"
  | "brand-asc"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc";

function formatPrice(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function AllProducts() {
  const navigate = useNavigate();
  const { keyword } = useSearch();
  const debounced = useDebounce(keyword, 300);
  const { data, isLoading, isError, error } = useProducts(debounced);
  const del = useDeleteProduct();

  const [category, setCategory] = useState<string>("all");
  const [availability, setAvailability] = useState<"all" | "available" | "out">("all");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (availability !== "all") {
      list = list.filter((p) =>
        availability === "available" ? p.available && p.quantity > 0 : !p.available || p.quantity <= 0,
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "brand-asc":
          return a.brand.localeCompare(b.brand);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "date-desc":
        case "date-asc": {
          const da = parseApiDate(a.releaseDate)?.getTime() ?? 0;
          const db = parseApiDate(b.releaseDate)?.getTime() ?? 0;
          return sort === "date-desc" ? db - da : da - db;
        }
      }
    });
    return sorted;
  }, [data, category, availability, sort]);

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    del.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`Deleted "${toDelete.name}"`);
        setToDelete(null);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground text-sm">
            Browse, filter, and manage your full product catalog.
          </p>
        </div>
        <Button onClick={() => navigate("/products/add")} className="shadow-[var(--shadow-elegant)]">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </header>

      <Card className="p-4 flex flex-wrap gap-3 items-center shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Availability</label>
          <Select value={availability} onValueChange={(v) => setAvailability(v as typeof availability)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Sort</label>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A–Z)</SelectItem>
              <SelectItem value="brand-asc">Brand (A–Z)</SelectItem>
              <SelectItem value="price-asc">Price (low → high)</SelectItem>
              <SelectItem value="price-desc">Price (high → low)</SelectItem>
              <SelectItem value="date-desc">Release date (newest)</SelectItem>
              <SelectItem value="date-asc">Release date (oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {data ? `${filtered.length} of ${data.length} products` : null}
        </div>
      </Card>

      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-destructive">
            {error instanceof Error ? error.message : "Failed to load products"}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => navigate("/products/add")} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <ProductImage
                        id={p.id}
                        alt={p.name}
                        className="h-12 w-12 rounded-md border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(p.price)}
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge available={p.available} quantity={p.quantity} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDisplayDate(p.releaseDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="View details"
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
                          onClick={() => setToDelete(p)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <DeleteProductDialog
        open={!!toDelete}
        productName={toDelete?.name ?? ""}
        onCancel={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={del.isPending}
      />
    </section>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-12 text-center space-y-3">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold">No products found</h2>
      <p className="text-sm text-muted-foreground">
        Try a different search or filter, or add your first product.
      </p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" /> Add product
      </Button>
    </div>
  );
}
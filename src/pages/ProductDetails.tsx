import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/products/ProductImage";
import { AvailabilityBadge } from "@/components/products/AvailabilityBadge";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { useDeleteProduct, useProduct } from "@/hooks/useProducts";
import { formatDisplayDate } from "@/lib/date";

function formatPrice(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value ?? 0);
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProduct(id);
  const del = useDeleteProduct();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>
          Back to products
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    del.mutate(data.id, {
      onSuccess: () => {
        toast.success(`Deleted "${data.name}"`);
        navigate("/products");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
    });
  };

  return (
    <section className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
        <ArrowLeft className="h-4 w-4" /> All products
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden shadow-[var(--shadow-card)]">
          <ProductImage
            id={data.id}
            alt={data.name}
            className="aspect-square w-full"
          />
        </Card>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {data.category}
            </Badge>
            <Badge variant="outline">{data.brand}</Badge>
            <AvailabilityBadge available={data.available} quantity={data.quantity} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.name}</h1>
          <p className="text-3xl font-semibold text-primary">{formatPrice(data.price)}</p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="In stock" value={`${data.quantity}`} />
            <Info label="Released" value={formatDisplayDate(data.releaseDate)} />
            <Info label="Image" value={data.imageName || "—"} />
            <Info label="Type" value={data.imageType || "—"} />
          </div>

          <Separator />

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Description
            </h2>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
              {data.desc || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => navigate(`/products/${data.id}/edit`)}>
              <Pencil className="h-4 w-4" /> Edit this product
            </Button>
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" /> Delete product
            </Button>
          </div>
        </div>
      </div>

      <DeleteProductDialog
        open={confirming}
        productName={data.name}
        onCancel={() => setConfirming(false)}
        onConfirm={handleDelete}
        loading={del.isPending}
      />
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
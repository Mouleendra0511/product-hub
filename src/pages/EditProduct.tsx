import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/products/ProductForm";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { fetchProductImageAsFile, getProductImageUrl } from "@/services/api";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProduct(id);
  const update = useUpdateProduct();

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit product</h1>
          <p className="text-muted-foreground text-sm">Update details and save your changes.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      ) : isError || !data ? (
        <p className="text-destructive">Could not load product.</p>
      ) : (
        <ProductForm
          initial={data}
          existingImageUrl={getProductImageUrl(data.id)}
          submitLabel="Save changes"
          submitting={update.isPending}
          requireImage={false}
          onSubmit={async ({ product, imageFile }) => {
            try {
              const file =
                imageFile ?? (await fetchProductImageAsFile(data.id, data.imageName ?? "image"));
              update.mutate(
                { id: data.id, product, imageFile: file },
                {
                  onSuccess: () => {
                    toast.success("Product updated");
                    navigate(`/products/${data.id}`);
                  },
                  onError: (e) =>
                    toast.error(e instanceof Error ? e.message : "Failed to update product"),
                },
              );
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed to update product");
            }
          }}
        />
      )}
    </section>
  );
}
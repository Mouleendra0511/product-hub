import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateProduct } from "@/hooks/useProducts";

export default function AddProduct() {
  const navigate = useNavigate();
  const create = useCreateProduct();

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add product</h1>
          <p className="text-muted-foreground text-sm">Create a new item in your catalog.</p>
        </div>
      </header>

      <ProductForm
        submitLabel="Create product"
        submitting={create.isPending}
        onSubmit={({ product, imageFile }) => {
          if (!imageFile) return;
          create.mutate(
            { product, imageFile },
            {
              onSuccess: (created) => {
                toast.success("Product created");
                navigate(created?.id ? `/products/${created.id}` : "/products");
              },
              onError: (e) =>
                toast.error(e instanceof Error ? e.message : "Failed to create product"),
            },
          );
        }}
      />
    </section>
  );
}
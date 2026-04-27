import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatApiDate, parseApiDate } from "@/lib/date";
import type { Product } from "@/types/product";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: z.string().trim().min(1, "Brand is required").max(80),
  category: z.string().trim().min(1, "Category is required").max(80),
  desc: z.string().trim().max(2000).default(""),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  quantity: z.coerce.number().int().min(0, "Quantity must be ≥ 0"),
  available: z.boolean().default(true),
  releaseDate: z.date({ required_error: "Release date is required" }),
});

export type ProductFormValues = z.infer<typeof schema>;

export interface ProductFormSubmit {
  product: Partial<Product>;
  imageFile: File | null; // null = keep existing
}

interface Props {
  initial?: Product;
  existingImageUrl?: string;
  submitLabel: string;
  submitting?: boolean;
  requireImage?: boolean;
  onSubmit: (data: ProductFormSubmit) => void;
}

export function ProductForm({
  initial,
  existingImageUrl,
  submitLabel,
  submitting,
  requireImage = true,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      brand: initial?.brand ?? "",
      category: initial?.category ?? "",
      desc: initial?.desc ?? "",
      price: initial?.price ?? 0,
      quantity: initial?.quantity ?? 0,
      available: initial?.available ?? true,
      releaseDate: parseApiDate(initial?.releaseDate) ?? new Date(),
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const releaseDate = watch("releaseDate");
  const available = watch("available");

  const submit = (values: ProductFormValues) => {
    if (requireImage && !file && !existingImageUrl) {
      setImageError("An image is required");
      return;
    }
    setImageError(null);
    const product: Partial<Product> = {
      ...(initial?.id ? { id: initial.id } : {}),
      name: values.name,
      brand: values.brand,
      category: values.category,
      desc: values.desc,
      price: values.price,
      quantity: values.quantity,
      available: values.available,
      releaseDate: formatApiDate(values.releaseDate),
    };
    onSubmit({ product, imageFile: file });
  };

  const onPickFile = (f: File | null) => {
    if (f && !f.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }
    setImageError(null);
    setFile(f);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6 md:grid-cols-3">
      <Card className="p-6 md:col-span-2 space-y-5 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-semibold">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message} required>
            <Input {...register("name")} placeholder="e.g. Wireless Earbuds Pro" />
          </Field>
          <Field label="Brand" error={errors.brand?.message} required>
            <Input {...register("brand")} placeholder="e.g. Acme" />
          </Field>
          <Field label="Category" error={errors.category?.message} required>
            <Input {...register("category")} placeholder="e.g. Electronics" />
          </Field>
          <Field label="Release date" error={errors.releaseDate?.message as string | undefined} required>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !releaseDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={releaseDate}
                  onSelect={(d) => d && setValue("releaseDate", d, { shouldValidate: true })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        <Field label="Description" error={errors.desc?.message}>
          <Textarea
            {...register("desc")}
            rows={5}
            placeholder="Describe the product, key features, materials…"
          />
        </Field>

        <h2 className="text-base font-semibold pt-2">Pricing & stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price" error={errors.price?.message} required>
            <Input type="number" step="0.01" min="0" {...register("price")} />
          </Field>
          <Field label="Quantity" error={errors.quantity?.message} required>
            <Input type="number" min="0" step="1" {...register("quantity")} />
          </Field>
          <Field label="Availability">
            <div className="flex h-10 items-center gap-3 rounded-md border bg-background px-3">
              <Switch
                id="available"
                checked={available}
                onCheckedChange={(c) => setValue("available", c)}
              />
              <Label htmlFor="available" className="text-sm font-normal cursor-pointer">
                {available ? "Available" : "Unavailable"}
              </Label>
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4 shadow-[var(--shadow-card)] h-fit">
        <h2 className="text-base font-semibold">Product image</h2>
        <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted grid place-items-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected preview" className="h-full w-full object-cover" />
          ) : existingImageUrl ? (
            <img src={existingImageUrl} alt="Current" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground p-6">
              <ImagePlus className="mx-auto h-8 w-8" />
              <p className="mt-2 text-sm">No image selected</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <span className="inline-flex w-full items-center justify-center gap-2 h-10 px-4 rounded-md border bg-background hover:bg-accent text-sm font-medium cursor-pointer transition-colors">
              <ImagePlus className="h-4 w-4" />
              {existingImageUrl || file ? "Replace image" : "Choose image"}
            </span>
          </label>
          {file && (
            <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Clear">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {imageError && <p className="text-sm text-destructive">{imageError}</p>}
        {existingImageUrl && !file && (
          <p className="text-xs text-muted-foreground">
            Current image will be kept unless you select a new one.
          </p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </Card>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
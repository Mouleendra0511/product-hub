import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/api";
import type { Product } from "@/types/product";

export function useProducts(keyword: string) {
  const trimmed = keyword.trim();
  return useQuery({
    queryKey: trimmed ? ["products", "search", trimmed] : ["products"],
    queryFn: () => (trimmed ? searchProducts(trimmed) : getProducts()),
  });
}

export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: id !== undefined && id !== null && id !== "",
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product, imageFile }: { product: Partial<Product>; imageFile: File }) =>
      createProduct(product, imageFile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      product,
      imageFile,
    }: {
      id: number | string;
      product: Partial<Product>;
      imageFile: File;
    }) => updateProduct(id, product, imageFile),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
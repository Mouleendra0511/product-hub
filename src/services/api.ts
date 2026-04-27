import type { Product } from "@/types/product";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`);
  return handle<Product[]>(res);
}

export async function getProductById(id: number | string): Promise<Product> {
  const res = await fetch(`${BASE}/product/${id}`);
  return handle<Product>(res);
}

export async function searchProducts(keyword: string): Promise<Product[]> {
  const res = await fetch(`${BASE}/products/search?keyword=${encodeURIComponent(keyword)}`);
  return handle<Product[]>(res);
}

function buildFormData(product: Partial<Product>, imageFile: File): FormData {
  const fd = new FormData();
  // Backend expects the JSON product part with content-type application/json
  const productBlob = new Blob([JSON.stringify(product)], { type: "application/json" });
  fd.append("product", productBlob);
  fd.append("imageFile", imageFile);
  return fd;
}

export async function createProduct(product: Partial<Product>, imageFile: File): Promise<Product> {
  const res = await fetch(`${BASE}/product`, {
    method: "POST",
    body: buildFormData(product, imageFile),
  });
  return handle<Product>(res);
}

export async function updateProduct(
  id: number | string,
  product: Partial<Product>,
  imageFile: File,
): Promise<Product> {
  const res = await fetch(`${BASE}/product/${id}`, {
    method: "PUT",
    body: buildFormData(product, imageFile),
  });
  return handle<Product>(res);
}

export async function deleteProduct(id: number | string): Promise<void> {
  const res = await fetch(`${BASE}/product/${id}`, { method: "DELETE" });
  await handle<void>(res);
}

export function getProductImageUrl(id: number | string): string {
  return `${BASE}/product/${id}/image`;
}

/** Fetch the existing image as a File, used when editing without picking a new file */
export async function fetchProductImageAsFile(
  id: number | string,
  fallbackName = "image",
): Promise<File> {
  const res = await fetch(getProductImageUrl(id));
  if (!res.ok) throw new Error("Could not load existing image");
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  const ext = type.split("/")[1] ?? "jpg";
  return new File([blob], `${fallbackName}.${ext}`, { type });
}
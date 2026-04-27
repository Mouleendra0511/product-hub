export interface Product {
  id: number;
  name: string;
  desc: string;
  brand: string;
  price: number;
  category: string;
  releaseDate: string; // dd-MM-yyyy
  available: boolean;
  quantity: number;
  imageName: string;
  imageType: string;
}

export type ProductInput = Omit<Product, "id" | "imageName" | "imageType"> & {
  imageName?: string;
  imageType?: string;
};
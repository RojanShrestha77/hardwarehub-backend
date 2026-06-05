export interface ProductType {
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  category: string;
  brand: string;
  stock: number;
  badge: string | null;
  imageUrl: string | null;
  specs: Record<string, string> | null;
}

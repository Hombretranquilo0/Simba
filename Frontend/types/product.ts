export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId?: number;
  inStock?: boolean;
  image: string;
  description?: string;
  unit?: string;
  translations?: {
    name?: Record<string, string>;
    category?: Record<string, string>;
    description?: Record<string, string>;
  };
}

export interface StoreData {
  name: string;
  tagline: string;
  location: string;
  currency: string;
}

export interface ApiResponse {
  store: StoreData;
  products: Product[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

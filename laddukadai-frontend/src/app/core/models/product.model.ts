export interface Product {
  id: number;
  name: string;
  pricePerKg: number;
  stockKg: number;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
}

export interface ProductRequest {
  name: string;
  pricePerKg: number;
  stockKg: number;
  imageUrl?: string;
  description?: string;
}

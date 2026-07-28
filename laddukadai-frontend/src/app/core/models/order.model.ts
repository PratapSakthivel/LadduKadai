export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
  orderType: 'INSTANT' | 'SUBSCRIPTION';
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
  totalAmount: number;
  deliveryAddress: string;
  deliveryDate?: string;
  deliveryManName?: string;
  notes?: string;
  createdAt?: string;
}

export interface InstantOrderRequest {
  productId: number;
  quantityKg: number;
  deliveryAddress: string;
}

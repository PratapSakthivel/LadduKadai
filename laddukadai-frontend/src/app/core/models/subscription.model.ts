export interface Subscription {
  id: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
  frequencyDays: number;
  nextDeliveryDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  pausedUntil?: string;
  deliveryAddress: string;
  totalAmountPerDelivery: number;
  createdAt?: string;
}

export interface SubscriptionRequest {
  productId: number;
  quantityKg: number;
  frequencyDays: number;
  firstDeliveryDate: string;
  deliveryAddress: string;
}

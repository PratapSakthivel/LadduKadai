export interface Delivery {
  id: number;
  orderId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  quantityKg: number;
  amountToCollect: number;
  status: 'PENDING' | 'DELIVERED' | 'NOT_HOME' | 'REJECTED';
  deliveryManName: string;
  attemptedAt?: string;
  deliveredAt?: string;
  rescheduleDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface EodReport {
  id: number;
  deliveryManName: string;
  reportDate: string;
  totalCash: number;
  totalDeliveries: number;
  totalNotHome: number;
  totalRejected: number;
  isVerified: boolean;
  submittedAt: string;
}

export interface MarkDeliveredRequest {
  cashCollected: number;
  notes?: string;
}

export interface MarkNotHomeRequest {
  rescheduleDate: string;
  notes?: string;
}

export interface MarkRejectedRequest {
  notes: string;
}

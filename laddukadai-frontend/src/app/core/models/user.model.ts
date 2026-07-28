export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: 'OWNER' | 'CUSTOMER' | 'DELIVERY_MAN';
  referralCode: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  referredByCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  referralCode: string;
  referredBy?: string;
  referralCount?: number;
}

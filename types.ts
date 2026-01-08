
export interface User {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  name: string;
  participants: string[];
  memberAvatars?: { [name: string]: string }; // Maps participant name to avatar ID
  createdAt: number;
}

export type PaymentMethod = 'Cash' | 'UPI';

export type SplitType = 'fair' | 'custom';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  paidBy: string; 
  splitBetween: string[];
  perPersonAmount: number;
  splitType?: SplitType;
  customSplits?: { [name: string]: number }; // For custom split amounts per person
  paymentMethod: PaymentMethod;
  proofImageUrl?: string;
  createdAt: number;
}

export interface Balance {
  name: string;
  paid: number;
  owed: number;
  net: number;
}

export interface Settlement {
  id: string;
  tripId: string;
  from: string;
  to: string;
  amount: number;
  isPaid: boolean;
  paidAt?: number;
  proofImageUrl?: string; // Payment proof image
  createdAt: number;
}
export type ProductStatus = 'PR Sent' | 'Ordered' | 'Delivered' | 'Out of Stock' | 'Pending';

export interface ProductItem {
  id: string;
  tripId: string;
  serialNumber: string; // PS - Product Serial
  itemName: string;
  quantity: number;
  link?: string;
  subsystem?: string;
  addedBy: string;
  status: ProductStatus;
  pricePerUnit?: number;
  totalPrice?: number;
  comments?: string;
  deliveryDate?: number; // Timestamp for expected/actual delivery date
  createdAt: number;
  updatedAt?: number;
}
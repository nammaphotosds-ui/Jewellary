// FIX: Removed circular self-import of `JewelryCategory` to resolve declaration conflicts.
export enum JewelryCategory {
  RING = 'Ring',
  NECKLACE = 'Necklace',
  BRACELET = 'Bracelet',
  EARRINGS = 'Earrings',
  OTHER = 'Other',
}

export interface JewelryItem {
  id: string;
  name: string;
  category: string;
  serialNo: string;
  weight: number;
  purity: number;
  price: number;
  imageUrl?: string;
  quantity: number;
  dateAdded: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  joinDate: string;
  pendingBalance: number;
  dob?: string;
}

export interface BillItem {
  itemId: string;
  name: string;
  weight: number;
  price: number;
  imageUrl?: string;
}

export enum BillType {
  ESTIMATE = 'ESTIMATE',
  INVOICE = 'INVOICE',
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  type: BillType;
  items: BillItem[];
  totalAmount: number; // Subtotal of items
  bargainedAmount: number; // Discount
  finalAmount: number; // totalAmount - bargainedAmount
  lessWeight: number;
  netWeight: number;
  extraChargePercentage: number;
  extraChargeAmount: number;
  grandTotal: number; // finalAmount + extraChargeAmount
  amountPaid: number;
  balance: number; // grandTotal - amountPaid
  date: string;
}


export type Page = 'DASHBOARD' | 'INVENTORY' | 'CUSTOMERS' | 'BILLING' | 'PENDING_PAYMENTS' | 'SETTINGS' | 'REVENUE';

export const pageTitles: Record<Page, string> = {
  DASHBOARD: 'Dashboard',
  INVENTORY: 'Inventory',
  CUSTOMERS: 'Customers',
  BILLING: 'Create Bill',
  PENDING_PAYMENTS: 'Pending Payments',
  SETTINGS: 'Settings',
  REVENUE: 'Revenue Details',
};

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  expires_at?: number;
}
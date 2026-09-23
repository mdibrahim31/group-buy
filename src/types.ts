export interface Customer {
  id: string;
  phone: string;
  password?: string;
  fullName: string;
  deliveryAddress: string;
  district: string;
  createdAt?: string;
}

export type User = Customer;

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  wholesalePrice: number;
  groupPrice: number;
  fullBundlePricePerPiece: number; // দাম আরও কম (সম্পূর্ণ বান্ডিল কিনলে প্রতি পিসের দাম)
  retailPrice: number;
  bundleSize: number;
  availableSizes: string[];
}

export interface BundleSlot {
  id: string;
  bundleId: string;
  size: string;
  userId?: string;
  userName?: string;
  userPhoneMasked?: string;
  status: 'available' | 'booked';
  bookedAt?: string;
}

export interface Bundle {
  id: string;
  productId: string;
  batchNumber: number;
  totalSlots: number;
  filledSlots: number;
  status: 'open' | 'completed' | 'ordered' | 'shipped';
  createdAt: string;
  expiresAt: string;
  slots: BundleSlot[];
}

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  bundleId: string;
  batchNumber: number;
  productId: string;
  productTitle: string;
  productImage: string;
  size: string;
  isFullBundle?: boolean;
  totalPieces?: number;
  groupPrice: number;
  advanceAmount: number;
  dueAmount: number;
  deliveryAddress: string;
  contactPhone: string;
  paymentMethod: 'bKash' | 'Nagad' | 'COD';
  status: 'confirmed' | 'ordered_wholesale' | 'in_transit' | 'delivered';
  createdAt: string;
}

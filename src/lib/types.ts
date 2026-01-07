
// lib/types.ts
export interface Manager {
  id: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  permissions?: string[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone: string;
  address?: string; // Added address field
  orderCount: number;
  debt: number;
  orderCounter?: number; // Counter for sequential order numbers
}

export interface Representative {
  id: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  assignedOrders: number;
}

export type OrderStatus =
  | 'pending'
  | 'processed'
  | 'ready'
  | 'shipped'
  | 'arrived_misrata' // Replaces old city specific arrivals
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'paid'
  | 'returned';

export interface Order {
  id: string;
  invoiceNumber: string; // The new sequential invoice number per user
  trackingId: string;
  userId: string;
  customerName: string;
  operationDate: string; // ISO String
  sellingPriceLYD: number;
  remainingAmount: number;
  status: OrderStatus;
  productLinks: string;
  exchangeRate: number; // Exchange rate at the time of order creation (snapshot)
  // Optional detailed fields from form
  purchasePriceUSD?: number;
  downPaymentLYD?: number; // Deposit (Arbun)
  weightKG?: number; // Weight in KG

  // Financial Snapshot Fields (calculated at the time of weight entry/update)
  shippingCostUSD?: number; // Cost of shipping (e.g. 4.5 * weight)
  shippingPriceUSD?: number; // Price of shipping to customer (e.g. 5.0 * weight)
  localShippingPrice?: number; // Local shipping cost (delivery)
  totalAmountLYD?: number; // Total amount in LYD including shipping

  pricePerKilo?: number;
  pricePerKiloCurrency?: 'LYD' | 'USD';
  customerWeightCost?: number;
  customerWeightCostCurrency?: 'LYD' | 'USD';
  companyWeightCost?: number;
  companyWeightCostUSD?: number;
  companyPricePerKilo?: number;
  companyPricePerKiloUSD?: number;
  customerPricePerKilo?: number;
  addedCostUSD?: number;
  addedCostNotes?: string;
  store?: string;
  paymentMethod?: string;
  deliveryDate?: string | null; // ISO String
  itemDescription?: string;
  shippingCostLYD?: number;
  representativeId?: string | null;
  representativeName?: string | null;
  customerAddress?: string;
  customerPhone?: string;
  collectedAmount?: number;
  customerWeightCostUSD?: number;
}


export interface Transaction {
  id: string;
  orderId?: string | null;
  customerId: string;
  customerName: string;
  date: string; // ISO String
  type: 'order' | 'payment';
  status: OrderStatus | 'paid';
  amount: number;
  description: string;
}

export interface SubOrder {
  subOrderId: string;
  trackingId?: string;
  username: string;
  password?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  purchasePriceUSD: number;
  sellingPriceLYD: number;
  downPaymentLYD: number;
  paymentMethod: string;
  shipmentStatus: OrderStatus;
  selectedStore: string;
  manualStoreName: string;
  productLinks: string;
  operationDate?: string; // ISO String
  deliveryDate?: string; // ISO String
  itemDescription: string;
  weightKG: number;
  pricePerKiloUSD: number;
  remainingAmount: number;
  representativeId?: string | null;
  representativeName?: string | null;
  invoiceName?: string; // For providing context in rep dashboard
}

export interface TempOrder {
  id: string;
  invoiceName: string;
  totalAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  subOrders: SubOrder[];
  createdAt: string; // ISO String of when it was created
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  parentInvoiceId?: string | null; // The ID of the main order it's converted to
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string; // ISO string
  unreadCount: number;
  messages: Message[];
}

export interface Notification {
  id: string;
  message: string;
  target: 'all' | 'specific';
  userId: string | null;
  timestamp: string;
  isRead: boolean;
}

export interface AppSettings {
  exchangeRate: number;
  pricePerKiloLYD: number;
  pricePerKiloUSD: number;
}

export interface SystemSettings {
  id: string; // Singleton ID usually
  exchangeRate: number;
  shippingCostUSD: number; // Cost for the company (e.g. 4.5)
  shippingPriceUSD: number; // Price for the customer (e.g. 5.0)
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO String
}

export type DepositStatus = 'pending' | 'collected' | 'cancelled';

export interface Deposit {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  date: string; // ISO String
  description: string;
  status: DepositStatus;
  representativeId: string | null;
  representativeName: string | null;
  collectedBy: 'admin' | 'representative';
  collectedDate: string | null;
}

export type ExternalDebtStatus = 'pending' | 'paid' | 'payment';

export interface ExternalDebt {
  id: string;
  creditorId: string;
  creditorName: string;
  amount: number;
  date: string; // ISO String
  status: ExternalDebtStatus;
  notes: string;
}

export interface Creditor {
  id: string;
  name: string;
  type: 'company' | 'person';
  currency: 'LYD' | 'USD';
  totalDebt: number;
  contactInfo?: string;
}


export interface ManualShippingLabel {
  id: string;
  invoiceNumber: string;
  operationDate: string; // ISO String
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  itemDescription: string;
  trackingId: string;
  sellingPriceLYD: number;
  remainingAmount: number;
}

export interface InstantSale {
  id: string;
  productName: string;
  costUSD: number;
  costExchangeRate: number;
  totalCostLYD: number;
  salePriceMode: 'LYD' | 'USD';
  salePriceLYD: number;
  salePriceUSD: number;
  saleExchangeRate: number;
  finalSalePriceLYD: number;
  netProfit: number;
  createdAt: string; // ISO String
}

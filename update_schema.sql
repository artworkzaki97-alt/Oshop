-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Managers Table
CREATE TABLE IF NOT EXISTS managers_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  username TEXT UNIQUE,
  password TEXT,
  phone TEXT,
  permissions TEXT[] -- Array of permission strings
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  username TEXT UNIQUE,
  password TEXT,
  phone TEXT UNIQUE,
  address TEXT,
  "orderCount" INTEGER DEFAULT 0,
  debt FLOAT DEFAULT 0,
  "walletBalance" FLOAT DEFAULT 0,
  "orderCounter" INTEGER DEFAULT 0
);


-- 3. Global Sites Table (New Phase 6)
CREATE TABLE IF NOT EXISTS global_sites_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  url TEXT,
  logo TEXT
);

-- 4. Shein Cards Table (New Phase 7)
CREATE TABLE IF NOT EXISTS shein_cards_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  value FLOAT,
  "remainingValue" FLOAT,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('available', 'used', 'expired')),
  "purchaseDate" TEXT, -- ISO String
  "expiryDate" TEXT,
  "usedAt" TEXT,
  "usedForOrderId" TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products/Inventory Table (Inventory Phase)
CREATE TABLE IF NOT EXISTS products_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  "minStockLevel" INTEGER DEFAULT 0,
  "costPriceUSD" FLOAT DEFAULT 0,
  "sellingPriceLYD" FLOAT DEFAULT 0,
  "sellingPriceUSD" FLOAT,
  description TEXT,
  category TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT,
  amount FLOAT DEFAULT 0,
  date TEXT,
  "managerId" TEXT
);

-- 7. Deposits/Arboon Table
CREATE TABLE IF NOT EXISTS deposits_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "receiptNumber" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "userId" TEXT,
  amount FLOAT DEFAULT 0,
  date TEXT,
  description TEXT,
  status TEXT,
  "representativeId" TEXT,
  "representativeName" TEXT,
  "collectedBy" TEXT,
  "collectedDate" TEXT
);

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS orders_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "invoiceNumber" TEXT,
  "trackingId" TEXT,
  "userId" TEXT,
  "customerName" TEXT,
  "operationDate" TEXT,
  "sellingPriceLYD" FLOAT DEFAULT 0,
  "remainingAmount" FLOAT DEFAULT 0,
  status TEXT,
  "productLinks" TEXT,
  "exchangeRate" FLOAT DEFAULT 1,
  "purchasePriceUSD" FLOAT DEFAULT 0,
  "downPaymentLYD" FLOAT DEFAULT 0,
  "weightKG" FLOAT DEFAULT 0,
  
  -- Financial Snapshot
  "shippingCostUSD" FLOAT DEFAULT 0,
  "shippingPriceUSD" FLOAT DEFAULT 0,
  "localShippingPrice" FLOAT DEFAULT 0,
  "totalAmountLYD" FLOAT DEFAULT 0,
  
  -- Unit Prices
  "pricePerKilo" FLOAT DEFAULT 0,
  "pricePerKiloCurrency" TEXT,
  "customerWeightCost" FLOAT DEFAULT 0,
  "customerWeightCostCurrency" TEXT,
  "companyWeightCost" FLOAT DEFAULT 0,
  "companyWeightCostUSD" FLOAT DEFAULT 0,
  "companyPricePerKilo" FLOAT DEFAULT 0,
  "companyPricePerKiloUSD" FLOAT DEFAULT 0,
  "customerPricePerKilo" FLOAT DEFAULT 0,
  
  -- Additional Cost
  "addedCostUSD" FLOAT DEFAULT 0,
  "addedCostNotes" TEXT,
  
  -- Meta
  store TEXT,
  "paymentMethod" TEXT,
  "deliveryDate" TEXT,
  "itemDescription" TEXT,
  "shippingCostLYD" FLOAT DEFAULT 0,
  "representativeId" TEXT,
  "representativeName" TEXT,
  "customerAddress" TEXT,
  "customerPhone" TEXT,
  "collectedAmount" FLOAT DEFAULT 0,
  "customerWeightCostUSD" FLOAT DEFAULT 0,
  
  -- Phase 6 Updates
  images TEXT[], -- Array of strings
  "cartUrl" TEXT,
  "siteId" TEXT,
  
  -- Phase 10 Updates
  "managerId" TEXT,
  "sequenceNumber" INTEGER
);

-- 9. Transactions Table
CREATE TABLE IF NOT EXISTS transactions_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" TEXT,
  "customerId" TEXT,
  "customerName" TEXT,
  date TEXT,
  type TEXT,
  status TEXT,
  amount FLOAT DEFAULT 0,
  description TEXT,
  "managerId" TEXT
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT,
  target TEXT,
  "userId" TEXT,
  timestamp TEXT,
  "isRead" BOOLEAN DEFAULT FALSE
);

-- 11. Settings Table
CREATE TABLE IF NOT EXISTS settings_v4 (
  id TEXT PRIMARY KEY,
  "exchangeRate" FLOAT DEFAULT 1,
  "shippingCostUSD" FLOAT DEFAULT 4.5,
  "shippingPriceUSD" FLOAT DEFAULT 5.0
);

-- 12. Treasury Transactions Table
CREATE TABLE IF NOT EXISTS treasury_transactions_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount FLOAT NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')),
  description TEXT,
  "relatedOrderId" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Temporary Orders Table (for Batch Imports)
CREATE TABLE IF NOT EXISTS "tempOrders_v4" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "invoiceName" TEXT,
  "totalAmount" FLOAT DEFAULT 0,
  "remainingAmount" FLOAT DEFAULT 0,
  status TEXT,
  "subOrders" JSONB, -- Stored as JSON
  "createdAt" TEXT,
  "assignedUserId" TEXT,
  "assignedUserName" TEXT,
  "parentInvoiceId" TEXT
);

-- 14. Manual Shipping Labels
CREATE TABLE IF NOT EXISTS manual_labels_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "invoiceNumber" TEXT,
  "operationDate" TEXT,
  "customerName" TEXT,
  "customerAddress" TEXT,
  "customerPhone" TEXT,
  "itemDescription" TEXT,
  "trackingId" TEXT,
  "sellingPriceLYD" FLOAT DEFAULT 0,
  "remainingAmount" FLOAT DEFAULT 0
);

-- 15. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT,
  amount FLOAT NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')),
  "paymentMethod" TEXT CHECK ("paymentMethod" IN ('cash', 'bank', 'other')), -- Added payment method
  description TEXT,
  "relatedOrderId" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "managerId" TEXT
);

-- 16. Treasury Transactions Table (If not already created by previous task)
CREATE TABLE IF NOT EXISTS treasury_transactions_v4 (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount FLOAT NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')),
  channel TEXT CHECK (channel IN ('cash', 'bank')), -- Added channel
  description TEXT,
  "relatedOrderId" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

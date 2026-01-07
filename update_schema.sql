-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  username TEXT,
  password TEXT,
  phone TEXT,
  address TEXT,
  "orderCount" INTEGER DEFAULT 0,
  debt FLOAT DEFAULT 0,
  "orderCounter" INTEGER DEFAULT 0
);

-- Add missing columns to users if they exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='orderCounter') THEN
        ALTER TABLE users ADD COLUMN "orderCounter" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
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
  "shippingCostUSD" FLOAT DEFAULT 0,
  "shippingPriceUSD" FLOAT DEFAULT 0,
  "localShippingPrice" FLOAT DEFAULT 0,
  "totalAmountLYD" FLOAT DEFAULT 0,
  "pricePerKilo" FLOAT DEFAULT 0,
  "pricePerKiloCurrency" TEXT,
  "customerWeightCost" FLOAT DEFAULT 0,
  "customerWeightCostCurrency" TEXT,
  "companyWeightCost" FLOAT DEFAULT 0,
  "companyWeightCostUSD" FLOAT DEFAULT 0,
  "companyPricePerKilo" FLOAT DEFAULT 0,
  "companyPricePerKiloUSD" FLOAT DEFAULT 0,
  "customerPricePerKilo" FLOAT DEFAULT 0,
  "addedCostUSD" FLOAT DEFAULT 0,
  "addedCostNotes" TEXT,
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
  "customerWeightCostUSD" FLOAT DEFAULT 0
);

-- Add new financial columns to orders if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shippingCostUSD') THEN
        ALTER TABLE orders ADD COLUMN "shippingCostUSD" FLOAT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shippingPriceUSD') THEN
        ALTER TABLE orders ADD COLUMN "shippingPriceUSD" FLOAT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='companyWeightCostUSD') THEN
        ALTER TABLE orders ADD COLUMN "companyWeightCostUSD" FLOAT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customerWeightCostUSD') THEN
        ALTER TABLE orders ADD COLUMN "customerWeightCostUSD" FLOAT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='weightKG') THEN
        ALTER TABLE orders ADD COLUMN "weightKG" FLOAT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='exchangeRate') THEN
        ALTER TABLE orders ADD COLUMN "exchangeRate" FLOAT DEFAULT 1;
    END IF;
END $$;

-- Create System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  "exchangeRate" FLOAT DEFAULT 1,
  "shippingCostUSD" FLOAT DEFAULT 0,
  "shippingPriceUSD" FLOAT DEFAULT 0
);

-- Insert default system settings if not exists
INSERT INTO system_settings (id, "exchangeRate", "shippingCostUSD", "shippingPriceUSD")
VALUES ('global', 1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  "orderId" TEXT,
  "customerId" TEXT,
  "customerName" TEXT,
  date TEXT,
  type TEXT,
  status TEXT,
  amount FLOAT DEFAULT 0,
  description TEXT
);

-- Create Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT,
  amount FLOAT DEFAULT 0,
  date TEXT
);

-- Note: Ensure Row Level Security (RLS) policies are configured as needed for your application security.

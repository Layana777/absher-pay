# Government Bills System Guide

This guide provides comprehensive documentation for the Government Bills feature in Absher Pay, which enables users to view, manage, and pay government service bills directly through the application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Structure](#data-structure)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Bill Statuses](#bill-statuses)
- [Auto-Generation](#auto-generation)
- [Bulk Payments](#bulk-payments)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Government Bills system provides a centralized solution for managing payments for Saudi Arabian government services. Bills are organized by user and wallet, with full support for personal and business accounts.

### Key Features

- **Full CRUD Operations**: Create, read, update, and delete bills
- **Auto-Generation**: Simulate government bill generation for testing
- **Bulk Payments**: Pay multiple bills in a single transaction
- **Status Management**: Track bill lifecycle (unpaid, paid, overdue, upcoming)
- **Wallet Integration**: Bills linked to specific wallets (personal/business)
- **Penalty Calculation**: Automatic late fees for overdue bills
- **Comprehensive Filtering**: Filter by status, ministry, service type
- **Bilingual Support**: All content in Arabic and English
- **Direct Firebase Access**: No Redux required

---

## Architecture

### File Structure

```
src/common/services/
├── billsService.js           # Core bills service with CRUD and utilities
└── firebase/
    └── databasePaths.js      # Database path constants (includes bills paths)

scripts/
└── seedBills.mjs            # Bill generation and seeding script

docs/
└── BILLS_GUIDE.md           # This file
```

### Database Structure

Bills are stored in Firebase Realtime Database:

```
governmentBills/
├── {userId}/
│   ├── {billId}/
│   │   ├── id: string
│   │   ├── userId: string
│   │   ├── walletId: string
│   │   ├── isBusiness: boolean
│   │   ├── serviceType: string
│   │   ├── serviceSubType: string
│   │   ├── serviceName: { ar, en }
│   │   ├── category: string
│   │   ├── ministry: string
│   │   ├── ministryName: { ar, en }
│   │   ├── amount: number
│   │   ├── currency: "SAR"
│   │   ├── status: string
│   │   ├── issueDate: number
│   │   ├── dueDate: number
│   │   ├── paymentDate: number | null
│   │   ├── paidWith: string | null
│   │   ├── referenceNumber: string
│   │   ├── description: { ar, en }
│   │   ├── additionalInfo: object
│   │   ├── penaltyInfo: object | null
│   │   ├── createdAt: number
│   │   └── updatedAt: number
│   └── ...
└── ...
```

---

## Data Structure

### Bill Object

Complete structure of a government bill:

```javascript
{
  // Identification
  id: string,                    // Unique bill ID (bill_timestamp_random)
  userId: string,                // Firebase user UID
  walletId: string,             // Associated wallet ID
  isBusiness: boolean,          // Wallet type flag

  // Service Classification
  serviceType: string,          // passports, traffic, civil_affairs, human_resources, commerce, justice
  serviceSubType: string,       // renew_passport, traffic_violations, renew_iqama, etc.
  serviceName: {
    ar: string,                 // Arabic service name
    en: string                  // English service name
  },

  // Ministry Information
  category: string,             // moi_passports, moi_traffic, mhrsd, moc, moj
  ministry: string,             // MOI, MHRSD, MOC, MOJ
  ministryName: {
    ar: string,                 // وزارة الداخلية
    en: string                  // Ministry of Interior
  },

  // Financial Information
  amount: number,               // Bill amount in SAR
  currency: "SAR",

  // Status & Dates
  status: string,               // paid, unpaid, overdue, upcoming
  issueDate: number,            // Timestamp when bill was issued
  dueDate: number,              // Timestamp when payment is due
  paymentDate: number | null,   // Timestamp when paid (null if unpaid)
  paidWith: string | null,      // Transaction ID if paid

  // Reference & Description
  referenceNumber: string,      // PASS-2024-0123, TRAF-2024-5432, etc.
  description: {
    ar: string,
    en: string
  },

  // Additional Service-Specific Information
  additionalInfo: {
    // Passport services
    passportNumber?: string,
    expiryDate?: number,
    holderName?: string,

    // Driving license
    licenseNumber?: string,
    licenseType?: string,

    // Traffic violations
    violationType?: string,
    violationSubType?: string,
    location?: string,
    violationDate?: number,
    plateNumber?: string,
    speed?: string,
    speedLimit?: string,

    // Iqama/Work permits
    employeeName?: string,
    iqamaNumber?: string,
    nationality?: string,
    occupation?: string,
    employeeCount?: number,
    employees?: Array<{
      name: string,
      iqamaNumber: string,
      amount: number,
      occupation: string
    }>,

    // Vehicle registration
    vehicleModel?: string,
    vinNumber?: string,

    // Exit re-entry visa
    visaType?: string,
    validUntil?: number
  },

  // Penalty Information (for overdue bills)
  penaltyInfo?: {
    lateFee: number,            // Late fee amount
    daysOverdue: number,        // Days past due date
    totalWithPenalty: number    // amount + lateFee
  },

  // Metadata
  createdAt: number,            // Creation timestamp
  updatedAt: number             // Last update timestamp
}
```

### Bill Status Values

| Status | Description | Characteristics |
|--------|-------------|-----------------|
| `paid` | Bill has been paid | Has `paymentDate` and `paidWith` (transaction ID) |
| `unpaid` | Bill is due but not paid | Due date is in the future, payment pending |
| `overdue` | Bill is past due date | Due date has passed, may have `penaltyInfo` |
| `upcoming` | Bill will be issued in future | Issue date is in the future |

---

## API Reference

### Utility Functions

#### `sanitizeBillData(data)`

Removes undefined and null values from bill data before Firebase write.

**Parameters:**
- `data` (Object) - Raw bill data

**Returns:** Object - Sanitized data

**Example:**
```javascript
import { sanitizeBillData } from '../services/billsService';

const cleanData = sanitizeBillData({
  id: 'bill_001',
  amount: 300,
  undefinedField: undefined,
  nullField: null
});
// Returns: { id: 'bill_001', amount: 300 }
```

#### `generateBillReferenceNumber(serviceType)`

Generates a unique reference number for a bill.

**Parameters:**
- `serviceType` (string) - Service type (passports, traffic, etc.)

**Returns:** string - Reference number (e.g., "PASS-2024-0123")

**Example:**
```javascript
const refNumber = generateBillReferenceNumber('passports');
// Returns: "PASS-2024-0123"
```

#### `isBillOverdue(bill)`

Checks if a bill is overdue.

**Parameters:**
- `bill` (Object) - Bill object

**Returns:** boolean - True if overdue

**Example:**
```javascript
const overdue = isBillOverdue(bill);
if (overdue) {
  console.log('Bill is overdue!');
}
```

#### `getDaysUntilDue(bill)`

Calculates days until bill is due (negative if overdue).

**Parameters:**
- `bill` (Object) - Bill object

**Returns:** number - Days until due

**Example:**
```javascript
const days = getDaysUntilDue(bill);
if (days < 0) {
  console.log(`Bill is ${Math.abs(days)} days overdue`);
} else {
  console.log(`Bill is due in ${days} days`);
}
```

#### `calculatePenalty(bill, lateFeeRate = 0.1)`

Calculates penalty for an overdue bill.

**Parameters:**
- `bill` (Object) - Bill object
- `lateFeeRate` (number) - Late fee rate (default: 0.1 = 10%)

**Returns:** Object | null - Penalty info or null if not overdue

**Example:**
```javascript
const penalty = calculatePenalty(bill);
if (penalty) {
  console.log(`Late fee: ${penalty.lateFee} SAR`);
  console.log(`Days overdue: ${penalty.daysOverdue}`);
  console.log(`Total with penalty: ${penalty.totalWithPenalty} SAR`);
}
```

#### `calculateBulkTotal(bills)`

Calculates total amount for multiple bills.

**Parameters:**
- `bills` (Array<Object>) - Array of bill objects

**Returns:** number - Total amount including penalties

**Example:**
```javascript
const total = calculateBulkTotal([bill1, bill2, bill3]);
console.log(`Total amount: ${total} SAR`);
```

### CREATE Operations

#### `createBill(userId, billData)`

Creates a new government bill.

**Parameters:**
- `userId` (string) - User ID
- `billData` (Object) - Bill data

**Returns:** Promise<Object> - Created bill with ID

**Example:**
```javascript
import { createBill } from '../services/billsService';

const billData = {
  walletId: 'wallet_personal_1234567890',
  isBusiness: false,
  serviceType: 'passports',
  serviceSubType: 'renew_passport',
  serviceName: {
    ar: 'تجديد جواز السفر',
    en: 'Renew Passport'
  },
  category: 'moi_passports',
  ministry: 'MOI',
  ministryName: {
    ar: 'وزارة الداخلية',
    en: 'Ministry of Interior'
  },
  amount: 300.00,
  currency: 'SAR',
  status: 'unpaid',
  issueDate: Date.now(),
  dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
  paymentDate: null,
  paidWith: null,
  referenceNumber: 'PASS-2024-0123',
  description: {
    ar: 'تجديد جواز السفر',
    en: 'Passport renewal'
  },
  additionalInfo: {
    passportNumber: 'P12345678',
    expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
    holderName: 'فيصل عبدالله'
  }
};

const bill = await createBill(userId, billData);
console.log('Bill created:', bill.id);
```

#### `createBulkBills(userId, billsArray)`

Batch creates multiple bills.

**Parameters:**
- `userId` (string) - User ID
- `billsArray` (Array<Object>) - Array of bill data

**Returns:** Promise<Array<Object>> - Created bills

**Example:**
```javascript
const billsArray = [billData1, billData2, billData3];
const bills = await createBulkBills(userId, billsArray);
console.log(`Created ${bills.length} bills`);
```

### READ Operations

#### `getUserBills(userId, options = {})`

Gets all bills for a user.

**Parameters:**
- `userId` (string) - User ID
- `options` (Object) - Optional { status?, limit? }

**Returns:** Promise<Array<Object>> - Array of bills

**Example:**
```javascript
// Get all bills
const allBills = await getUserBills(userId);

// Get with status filter
const unpaidBills = await getUserBills(userId, { status: 'unpaid' });

// Get with limit
const recentBills = await getUserBills(userId, { limit: 10 });
```

#### `getWalletBills(userId, walletId, options = {})`

Gets bills for a specific wallet.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Wallet ID
- `options` (Object) - Optional { status?, limit? }

**Returns:** Promise<Array<Object>> - Array of bills

**Example:**
```javascript
const walletBills = await getWalletBills(userId, walletId);
const unpaidWalletBills = await getWalletBills(userId, walletId, { status: 'unpaid' });
```

#### `getBillById(userId, billId)`

Gets a specific bill by ID.

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID

**Returns:** Promise<Object|null> - Bill object or null

**Example:**
```javascript
const bill = await getBillById(userId, 'bill_123_abc');
if (bill) {
  console.log('Bill found:', bill.serviceName.en);
}
```

#### `getBillsByStatus(userId, status, limit = 50)`

Gets bills by status.

**Parameters:**
- `userId` (string) - User ID
- `status` (string) - Bill status
- `limit` (number) - Max results (default: 50)

**Returns:** Promise<Array<Object>> - Filtered bills

**Example:**
```javascript
const paidBills = await getBillsByStatus(userId, 'paid');
const overdueBills = await getBillsByStatus(userId, 'overdue', 20);
```

#### `getBillsByServiceType(userId, serviceType, options = {})`

Gets bills by service type.

**Parameters:**
- `userId` (string) - User ID
- `serviceType` (string) - Service type
- `options` (Object) - Optional filters

**Returns:** Promise<Array<Object>> - Filtered bills

**Example:**
```javascript
const passportBills = await getBillsByServiceType(userId, 'passports');
const trafficBills = await getBillsByServiceType(userId, 'traffic', { status: 'unpaid' });
```

#### `getBillsByMinistry(userId, ministry, options = {})`

Gets bills by ministry.

**Parameters:**
- `userId` (string) - User ID
- `ministry` (string) - Ministry code (MOI, MHRSD, etc.)
- `options` (Object) - Optional filters

**Returns:** Promise<Array<Object>> - Filtered bills

**Example:**
```javascript
const moiBills = await getBillsByMinistry(userId, 'MOI');
const mhrsdBills = await getBillsByMinistry(userId, 'MHRSD', { status: 'unpaid' });
```

#### `getUpcomingBills(userId, days = 30)`

Gets bills due within next N days.

**Parameters:**
- `userId` (string) - User ID
- `days` (number) - Days to look ahead (default: 30)

**Returns:** Promise<Array<Object>> - Upcoming bills

**Example:**
```javascript
const upcomingBills = await getUpcomingBills(userId);
const nextWeekBills = await getUpcomingBills(userId, 7);
```

#### `getOverdueBills(userId)`

Gets all overdue bills.

**Parameters:**
- `userId` (string) - User ID

**Returns:** Promise<Array<Object>> - Overdue bills

**Example:**
```javascript
const overdueBills = await getOverdueBills(userId);
console.log(`You have ${overdueBills.length} overdue bills`);
```

#### `searchBills(userId, searchTerm)`

Searches bills by reference number or description.

**Parameters:**
- `userId` (string) - User ID
- `searchTerm` (string) - Search term

**Returns:** Promise<Array<Object>> - Matching bills

**Example:**
```javascript
const results = await searchBills(userId, 'passport');
const refResults = await searchBills(userId, 'PASS-2024');
```

#### `getBillStats(userId)`

Gets comprehensive bill statistics.

**Parameters:**
- `userId` (string) - User ID

**Returns:** Promise<Object> - Statistics object

**Example:**
```javascript
const stats = await getBillStats(userId);
console.log('Total bills:', stats.totalBills);
console.log('Total amount:', stats.totalAmount);
console.log('Unpaid amount:', stats.unpaidAmount);
console.log('Overdue amount:', stats.overdueAmount);
console.log('By status:', stats.byStatus);
console.log('By ministry:', stats.byMinistry);
```

#### `getPersonalWalletBills(userId, walletId)`

Gets bills for personal wallet.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Personal wallet ID

**Returns:** Promise<Array<Object>> - Personal bills

**Example:**
```javascript
const personalBills = await getPersonalWalletBills(userId, walletId);
```

#### `getBusinessWalletBills(userId, walletId)`

Gets bills for business wallet.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Business wallet ID

**Returns:** Promise<Array<Object>> - Business bills

**Example:**
```javascript
const businessBills = await getBusinessWalletBills(userId, walletId);
```

#### `fetchAllUserBills(userId, wallets)`

Fetches all bills categorized by wallet type.

**Parameters:**
- `userId` (string) - User ID
- `wallets` (Object) - { personal, business }

**Returns:** Promise<Object> - { personal: [], business: [], all: [] }

**Example:**
```javascript
const { personal, business, all } = await fetchAllUserBills(userId, {
  personal: personalWallet,
  business: businessWallet
});
```

### UPDATE Operations

#### `updateBillStatus(userId, billId, status, additionalData = {})`

Updates bill status.

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID
- `status` (string) - New status
- `additionalData` (Object) - Additional data to update

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await updateBillStatus(userId, billId, 'paid', {
  paymentDate: Date.now(),
  paidWith: 'txn_123'
});
```

#### `markBillAsPaid(userId, billId, transactionId)`

Marks a bill as paid.

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID
- `transactionId` (string) - Payment transaction ID

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await markBillAsPaid(userId, billId, transactionId);
```

#### `updateBillAmount(userId, billId, newAmount, penaltyInfo = null)`

Updates bill amount (for adjustments or penalties).

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID
- `newAmount` (number) - New amount
- `penaltyInfo` (Object) - Optional penalty information

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
const penalty = calculatePenalty(bill);
await updateBillAmount(userId, billId, penalty.totalWithPenalty, penalty);
```

#### `updateBill(userId, billId, updates)`

Updates bill metadata.

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID
- `updates` (Object) - Fields to update

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await updateBill(userId, billId, {
  description: {
    ar: 'وصف جديد',
    en: 'New description'
  }
});
```

### DELETE Operations

#### `deleteBill(userId, billId)`

Deletes a bill.

**Parameters:**
- `userId` (string) - User ID
- `billId` (string) - Bill ID

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await deleteBill(userId, billId);
```

#### `deleteBulkBills(userId, billIds)`

Deletes multiple bills.

**Parameters:**
- `userId` (string) - User ID
- `billIds` (Array<string>) - Array of bill IDs

**Returns:** Promise<Object> - { success, failed }

**Example:**
```javascript
const result = await deleteBulkBills(userId, ['bill_001', 'bill_002', 'bill_003']);
console.log(`Deleted ${result.success}, failed ${result.failed}`);
```

### Auto-Generation Functions

#### `generateRandomBill(userId, walletId, isBusiness, serviceType, status)`

Generates a random bill for testing.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Wallet ID
- `isBusiness` (boolean) - Is business wallet
- `serviceType` (string) - Service type
- `status` (string) - Bill status

**Returns:** Object - Generated bill data

**Example:**
```javascript
const randomBill = generateRandomBill(
  userId,
  walletId,
  false,
  'passports',
  'unpaid'
);
```

#### `autoGenerateBills(userId, walletId, isBusiness, options = {})`

Auto-generates multiple bills based on government services.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Wallet ID
- `isBusiness` (boolean) - Is business wallet
- `options` (Object) - { count?, serviceTypes?, statuses? }

**Returns:** Promise<Array<Object>> - Generated bills

**Example:**
```javascript
// Generate 10 random bills
const bills = await autoGenerateBills(userId, walletId, false, {
  count: 10
});

// Generate only unpaid bills
const unpaidBills = await autoGenerateBills(userId, walletId, false, {
  count: 5,
  statuses: ['unpaid']
});

// Generate bills for specific services
const specificBills = await autoGenerateBills(userId, walletId, true, {
  count: 3,
  serviceTypes: ['human_resources', 'commerce']
});
```

### Bulk Payment Functions

#### `validateBulkPayment(bills, walletId)`

Validates bills before bulk payment.

**Parameters:**
- `bills` (Array<Object>) - Bills to validate
- `walletId` (string) - Wallet ID for payment

**Returns:** Object - { valid, errors, totalAmount }

**Example:**
```javascript
const validation = validateBulkPayment([bill1, bill2, bill3], walletId);
if (validation.valid) {
  console.log(`Total: ${validation.totalAmount} SAR`);
} else {
  console.error('Validation errors:', validation.errors);
}
```

#### `processBulkBillPayment(userId, billIds, walletId, paymentDetails = {})`

Processes bulk bill payment.

**Parameters:**
- `userId` (string) - User ID
- `billIds` (Array<string>) - Bill IDs to pay
- `walletId` (string) - Wallet ID
- `paymentDetails` (Object) - Payment method details

**Returns:** Promise<Object> - Payment result

**Example:**
```javascript
const result = await processBulkBillPayment(
  userId,
  ['bill_001', 'bill_002', 'bill_003'],
  walletId,
  { paymentMethod: 'APPLE_PAY' }
);

console.log(`Paid ${result.billCount} bills`);
console.log(`Total amount: ${result.totalAmount} SAR`);
console.log(`Transaction ID: ${result.transactionId}`);
```

---

## Usage Examples

### Example 1: Fetch and Display User Bills

```javascript
import { getUserBills, getBillStats } from '../services/billsService';

const BillsScreen = ({ userId }) => {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const userBills = await getUserBills(userId);
        const billStats = await getBillStats(userId);

        setBills(userBills);
        setStats(billStats);
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Total Bills: {stats.totalBills}</Text>
      <Text>Unpaid Amount: {stats.unpaidAmount} SAR</Text>
      <Text>Overdue Amount: {stats.overdueAmount} SAR</Text>

      {bills.map(bill => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </View>
  );
};
```

### Example 2: Pay a Single Bill

```javascript
import { getBillById, markBillAsPaid } from '../services/billsService';
import { createBillPaymentTransaction, updateWalletBalance } from '../services/transactionService';

const payBill = async (userId, billId, walletId) => {
  try {
    // Get bill details
    const bill = await getBillById(userId, billId);
    if (!bill) throw new Error('Bill not found');

    // Check if already paid
    if (bill.status === 'paid') {
      throw new Error('Bill already paid');
    }

    // Get wallet balance (implement this function)
    const wallet = await getWalletById(walletId);
    const amount = bill.penaltyInfo?.totalWithPenalty || bill.amount;

    // Check sufficient balance
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create payment transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Update wallet balance
    const newBalance = wallet.balance - amount;
    await updateWalletBalance(walletId, newBalance);

    // Mark bill as paid
    await markBillAsPaid(userId, billId, transactionId);

    console.log('Bill paid successfully!');
    return { success: true, transactionId };
  } catch (error) {
    console.error('Error paying bill:', error);
    throw error;
  }
};
```

### Example 3: Filter Bills by Status

```javascript
import { getUserBills } from '../services/billsService';

const FilteredBillsScreen = ({ userId }) => {
  const [filter, setFilter] = useState('all');
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      const allBills = await getUserBills(userId);

      let filtered = allBills;
      if (filter !== 'all') {
        filtered = allBills.filter(bill => bill.status === filter);
      }

      setBills(filtered);
    };

    fetchBills();
  }, [userId, filter]);

  return (
    <View>
      <FilterButtons onFilterChange={setFilter} />
      <BillsList bills={bills} />
    </View>
  );
};
```

### Example 4: Auto-Generate Test Bills

```javascript
import { autoGenerateBills } from '../services/billsService';

// Generate test bills for development
const generateTestBills = async (userId, walletId, isBusiness) => {
  try {
    const bills = await autoGenerateBills(userId, walletId, isBusiness, {
      count: 10,
      statuses: ['unpaid', 'paid', 'overdue', 'upcoming']
    });

    console.log(`Generated ${bills.length} test bills`);
    return bills;
  } catch (error) {
    console.error('Error generating bills:', error);
  }
};
```

### Example 5: Bulk Payment

```javascript
import { processBulkBillPayment } from '../services/billsService';

const payMultipleBills = async (userId, billIds, walletId) => {
  try {
    const result = await processBulkBillPayment(
      userId,
      billIds,
      walletId,
      { paymentMethod: 'CARD' }
    );

    console.log(`Paid ${result.billCount} bills`);
    console.log(`Total: ${result.totalAmount} SAR`);
    console.log(`Transaction ID: ${result.transactionId}`);

    return result;
  } catch (error) {
    console.error('Bulk payment failed:', error);
    throw error;
  }
};
```

---

## Bill Statuses

### Status Lifecycle

```
upcoming → unpaid → paid
              ↓
           overdue → paid
```

### Status Definitions

#### 1. Upcoming
- **When**: Issue date is in the future
- **Characteristics**:
  - Cannot be paid yet
  - No penalty
  - User can see it's coming
- **Example**: "Will be issued in 10 days"

#### 2. Unpaid
- **When**: Issued and due date is in the future
- **Characteristics**:
  - Can be paid
  - No penalty yet
  - Within payment window
- **Example**: "Due in 15 days"

#### 3. Overdue
- **When**: Due date has passed and not paid
- **Characteristics**:
  - Can be paid
  - Has penalty (10% late fee)
  - Shows days overdue
- **Example**: "5 days overdue, late fee: 50 SAR"

#### 4. Paid
- **When**: Payment completed
- **Characteristics**:
  - Has payment date
  - Has transaction ID
  - Cannot be edited
- **Example**: "Paid on Nov 28, 2024"

---

## Auto-Generation

Auto-generation simulates government bill generation for testing and development.

### How It Works

1. **Service Selection**: Based on wallet type (personal/business)
2. **Random Data**: Generates realistic dates, amounts, and metadata
3. **Status Distribution**: Creates bills with different statuses
4. **Firebase Storage**: Saves directly to database

### Available Services by Wallet Type

**Personal Wallet**:
- Passports (300-400 SAR)
- Traffic (100-500 SAR)
- Civil Affairs (100 SAR)

**Business Wallet**:
- Human Resources/Iqama (2,000 SAR)
- Commerce (200 SAR)
- Justice (50 SAR)

### Usage

```javascript
// Generate 5 random bills
const bills = await autoGenerateBills(userId, walletId, isBusiness);

// Generate 10 unpaid bills
const unpaidBills = await autoGenerateBills(userId, walletId, false, {
  count: 10,
  statuses: ['unpaid']
});

// Generate specific service types
const iqamaBills = await autoGenerateBills(userId, walletId, true, {
  count: 5,
  serviceTypes: ['human_resources']
});
```

---

## Bulk Payments

### Overview

Bulk payments allow users to pay multiple bills in a single transaction.

### Features

- ✅ Validate all bills before payment
- ✅ Calculate total amount including penalties
- ✅ Single transaction ID for all bills
- ✅ Atomic operation (all or nothing)
- ✅ Detailed payment summary

### Validation Rules

1. All bills must belong to the same wallet
2. Bills must not be already paid
3. Bills must not be upcoming (not yet issued)
4. Wallet must have sufficient balance

### Example

```javascript
// Select bills to pay
const billIds = ['bill_001', 'bill_002', 'bill_003'];

// Validate before payment
const validation = validateBulkPayment(bills, walletId);

if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  return;
}

// Process payment
const result = await processBulkBillPayment(userId, billIds, walletId, {
  paymentMethod: 'APPLE_PAY'
});

console.log('Payment successful!');
console.log(`Bills paid: ${result.billCount}`);
console.log(`Total: ${result.totalAmount} SAR`);
```

---

## Integration Guide

### Step 1: Import Service Functions

```javascript
import {
  getUserBills,
  getBillById,
  markBillAsPaid,
  getOverdueBills,
  processBulkBillPayment
} from '../common/services/billsService';
```

### Step 2: Fetch Bills on Screen Load

```javascript
useEffect(() => {
  const loadBills = async () => {
    const bills = await getUserBills(userId);
    setBills(bills);
  };

  loadBills();
}, [userId]);
```

### Step 3: Handle Bill Payment

```javascript
const handlePayBill = async (bill) => {
  try {
    await payBill(userId, bill.id, walletId);
    // Refresh bills
    const updatedBills = await getUserBills(userId);
    setBills(updatedBills);
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### Step 4: Display Bills

```javascript
<FlatList
  data={bills}
  keyExtractor={(bill) => bill.id}
  renderItem={({ item: bill }) => (
    <View>
      <Text>{bill.serviceName.ar}</Text>
      <Text>{bill.amount} {bill.currency}</Text>
      <Text>{bill.status}</Text>
      <Button
        title="Pay"
        onPress={() => handlePayBill(bill)}
        disabled={bill.status === 'paid' || bill.status === 'upcoming'}
      />
    </View>
  )}
/>
```

---

## Best Practices

### 1. Error Handling

Always wrap bill operations in try-catch blocks:

```javascript
try {
  const bills = await getUserBills(userId);
} catch (error) {
  console.error('Error fetching bills:', error);
  // Show user-friendly error message
}
```

### 2. Loading States

Show loading indicators during async operations:

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchBills = async () => {
    setLoading(true);
    try {
      const bills = await getUserBills(userId);
      setBills(bills);
    } finally {
      setLoading(false);
    }
  };

  fetchBills();
}, [userId]);
```

### 3. Refresh After Actions

Refresh bill list after payments or updates:

```javascript
const payBill = async (billId) => {
  await markBillAsPaid(userId, billId, transactionId);
  // Refresh
  const updatedBills = await getUserBills(userId);
  setBills(updatedBills);
};
```

### 4. Validate Before Payment

Always validate bills before payment:

```javascript
if (bill.status === 'paid') {
  alert('Bill already paid');
  return;
}

if (bill.status === 'upcoming') {
  alert('Bill not yet issued');
  return;
}

if (wallet.balance < bill.amount) {
  alert('Insufficient balance');
  return;
}
```

### 5. Show Penalties Clearly

Display penalty information for overdue bills:

```javascript
const BillCard = ({ bill }) => {
  const penalty = calculatePenalty(bill);

  return (
    <View>
      <Text>Base Amount: {bill.amount} SAR</Text>
      {penalty && (
        <>
          <Text>Late Fee: {penalty.lateFee} SAR</Text>
          <Text>Total: {penalty.totalWithPenalty} SAR</Text>
          <Text>{penalty.daysOverdue} days overdue</Text>
        </>
      )}
    </View>
  );
};
```

### 6. Filter by Wallet Type

Separate personal and business bills:

```javascript
const personalBills = await getPersonalWalletBills(userId, personalWalletId);
const businessBills = await getBusinessWalletBills(userId, businessWalletId);
```

---

## Troubleshooting

### Problem: Bills not showing up

**Causes**:
1. Wrong user ID
2. No bills created for user
3. Firebase rules blocking access

**Solutions**:
```javascript
// 1. Verify user ID
console.log('User ID:', userId);

// 2. Check Firebase Console
// Navigate to governmentBills → {userId}

// 3. Generate test bills
await autoGenerateBills(userId, walletId, isBusiness);
```

### Problem: Cannot pay bill

**Causes**:
1. Bill already paid
2. Bill is upcoming
3. Insufficient wallet balance

**Solutions**:
```javascript
// Check bill status
if (bill.status === 'paid') {
  console.log('Bill already paid on', new Date(bill.paymentDate));
}

if (bill.status === 'upcoming') {
  console.log('Bill will be issued on', new Date(bill.issueDate));
}

// Check wallet balance
const wallet = await getWalletById(walletId);
const required = bill.penaltyInfo?.totalWithPenalty || bill.amount;
if (wallet.balance < required) {
  console.log(`Need ${required} SAR, have ${wallet.balance} SAR`);
}
```

### Problem: Bulk payment validation fails

**Causes**:
1. Bills from different wallets
2. Already paid bills included
3. Upcoming bills included

**Solutions**:
```javascript
const validation = validateBulkPayment(bills, walletId);

if (!validation.valid) {
  console.log('Validation errors:');
  validation.errors.forEach(error => console.log('-', error));
}

// Filter valid bills
const validBills = bills.filter(bill =>
  bill.walletId === walletId &&
  bill.status !== 'paid' &&
  bill.status !== 'upcoming'
);
```

### Problem: Penalty calculation incorrect

**Cause**: Using wrong late fee rate or bill status

**Solution**:
```javascript
// Only calculate for overdue bills
if (isBillOverdue(bill)) {
  const penalty = calculatePenalty(bill, 0.1); // 10% rate
  console.log('Penalty:', penalty);
} else {
  console.log('Bill not overdue, no penalty');
}
```

---

## Related Documentation

- [Government Services Guide](./GOVERNMENT_SERVICES_GUIDE.md)
- [Transaction Guide](./TRANSACTIONS_GUIDE.md)
- [Wallet Service](../src/common/services/walletService.js)
- [Bills Service](../src/common/services/billsService.js)
- [Seed Bills Script](../scripts/seedBills.mjs)
- [Scripts README](../scripts/README.md)

---

**Last Updated:** December 2024
**Version:** 1.0.0

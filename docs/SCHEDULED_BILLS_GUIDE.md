# Scheduled Bills System Guide

This guide provides comprehensive documentation for the Scheduled Bills feature in Absher Pay, which enables users to schedule automatic bill payments for future dates.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Structure](#data-structure)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [User Interface](#user-interface)
- [Integration Guide](#integration-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Scheduled Bills system allows users to:
- **Schedule bill payments** for a future date
- **View all scheduled payments** in one place
- **Cancel scheduled payments** before execution
- **Process scheduled payments** manually or automatically
- **Track payment status** (scheduled, completed, cancelled, failed)

### Key Features

- ✅ Schedule payments for government bills
- ✅ Automatic payment execution on due date
- ✅ Manual payment processing (pay now)
- ✅ Cancel or reschedule payments
- ✅ View comprehensive statistics
- ✅ Filter by status (scheduled, completed, cancelled)
- ✅ Track overdue scheduled payments
- ✅ Wallet integration with balance validation

---

## Architecture

### File Structure

```
src/
├── common/services/
│   ├── scheduledBillsService.js      # Core scheduled bills service
│   └── firebase/
│       └── databasePaths.js          # Database paths (includes scheduled bills)
│
└── business/
    ├── screens/Dashboard/
    │   ├── UpcomingPayDetailsScreen.js    # Bill details + schedule action
    │   ├── ScheduleSuccessScreen.js       # Schedule confirmation
    │   └── ScheduledBillsScreen.js        # View all scheduled bills
    │
    └── navigation/
        └── BusinessNavigator.js           # Navigation setup

docs/
└── SCHEDULED_BILLS_GUIDE.md          # This file
```

### Database Structure

Scheduled bills are stored in Firebase Realtime Database:

```
scheduledBills/
├── {userId}/
│   ├── {scheduledBillId}/
│   │   ├── id: string
│   │   ├── userId: string
│   │   ├── walletId: string
│   │   ├── billId: string (reference to governmentBills)
│   │   ├── billReferenceNumber: string
│   │   ├── serviceName: string
│   │   ├── ministryName: { ar, en }
│   │   ├── scheduledAmount: number
│   │   ├── scheduledDate: number (timestamp)
│   │   ├── status: string (scheduled|completed|cancelled|failed)
│   │   ├── createdAt: number
│   │   ├── updatedAt: number
│   │   ├── completedAt: number | null
│   │   ├── completedTransactionId: string | null
│   │   └── metadata: object
│   └── ...
└── ...
```

---

## Data Structure

### Scheduled Bill Object

Complete structure of a scheduled bill:

```javascript
{
  // Identification
  id: "scheduled_1234567890_abc123",
  userId: "firebase_user_uid",
  walletId: "wallet_personal_1234567890",
  billId: "bill_1234567890_xyz789",
  billReferenceNumber: "PASS-2024-1234",

  // Service Information
  serviceName: "تجديد جواز السفر",
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  // Financial Information
  scheduledAmount: 300.00,

  // Schedule Information
  scheduledDate: 1735689600000, // Unix timestamp
  status: "scheduled", // scheduled, completed, cancelled, failed

  // Completion Information (null if not completed)
  completedAt: null,
  completedTransactionId: null,

  // Metadata
  metadata: {
    baseAmount: 300.00,
    penaltyAmount: 0,
    vatAmount: 0,
    serviceFee: 0,
    serviceType: "passports",
    category: "moi_passports"
  },

  // Timestamps
  createdAt: 1735516800000,
  updatedAt: 1735516800000
}
```

### Status Values

| Status | Description | Can Pay Now | Can Cancel |
|--------|-------------|-------------|------------|
| `scheduled` | Payment is scheduled for future date | ✅ Yes | ✅ Yes |
| `completed` | Payment was successfully executed | ❌ No | ❌ No |
| `cancelled` | User cancelled the scheduled payment | ❌ No | ❌ No |
| `failed` | Automatic payment failed (insufficient funds, etc.) | ✅ Yes | ✅ Yes |

---

## API Reference

### Utility Functions

#### `sanitizeScheduledBillData(data)`

Removes undefined and null values from scheduled bill data.

**Parameters:**
- `data` (Object) - Raw scheduled bill data

**Returns:** Object - Sanitized data

**Example:**
```javascript
import { sanitizeScheduledBillData } from '../services/scheduledBillsService';

const cleanData = sanitizeScheduledBillData({
  id: 'scheduled_001',
  scheduledAmount: 300,
  undefinedField: undefined
});
// Returns: { id: 'scheduled_001', scheduledAmount: 300 }
```

#### `isScheduledBillDue(scheduledBill)`

Checks if a scheduled bill is due.

**Parameters:**
- `scheduledBill` (Object) - Scheduled bill object

**Returns:** boolean - True if due

**Example:**
```javascript
const isDue = isScheduledBillDue(scheduledBill);
if (isDue) {
  console.log('Scheduled bill is due!');
}
```

#### `getDaysUntilScheduled(scheduledBill)`

Calculates days until scheduled date (negative if past due).

**Parameters:**
- `scheduledBill` (Object) - Scheduled bill object

**Returns:** number - Days until scheduled

**Example:**
```javascript
const days = getDaysUntilScheduled(scheduledBill);
if (days < 0) {
  console.log(`Scheduled bill is ${Math.abs(days)} days overdue`);
} else {
  console.log(`Scheduled bill due in ${days} days`);
}
```

### CREATE Operations

#### `createScheduledBill(userId, scheduledBillData)`

Creates a new scheduled bill.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillData` (Object) - Scheduled bill data

**Returns:** Promise<Object> - Created scheduled bill with ID

**Example:**
```javascript
import { createScheduledBill } from '../services/scheduledBillsService';

const scheduledBillData = {
  walletId: 'wallet_personal_1234567890',
  billId: 'bill_1234567890_xyz789',
  billReferenceNumber: 'PASS-2024-1234',
  serviceName: 'تجديد جواز السفر',
  ministryName: {
    ar: 'وزارة الداخلية',
    en: 'Ministry of Interior'
  },
  scheduledAmount: 300.00,
  scheduledDate: new Date('2024-12-31').getTime(),
  metadata: {
    baseAmount: 300.00,
    serviceType: 'passports'
  }
};

const scheduledBill = await createScheduledBill(userId, scheduledBillData);
console.log('Scheduled bill created:', scheduledBill.id);
```

### READ Operations

#### `getUserScheduledBills(userId, options = {})`

Gets all scheduled bills for a user.

**Parameters:**
- `userId` (string) - User ID
- `options` (Object) - Optional { status?, limit? }

**Returns:** Promise<Array<Object>> - Array of scheduled bills

**Example:**
```javascript
// Get all scheduled bills
const allScheduledBills = await getUserScheduledBills(userId);

// Get only scheduled bills
const scheduledOnly = await getUserScheduledBills(userId, { status: 'scheduled' });

// Get with limit
const recentScheduled = await getUserScheduledBills(userId, { limit: 10 });
```

#### `getWalletScheduledBills(userId, walletId, options = {})`

Gets scheduled bills for a specific wallet.

**Parameters:**
- `userId` (string) - User ID
- `walletId` (string) - Wallet ID
- `options` (Object) - Optional { status?, limit? }

**Returns:** Promise<Array<Object>> - Array of scheduled bills

**Example:**
```javascript
const walletScheduledBills = await getWalletScheduledBills(userId, walletId);
const scheduledOnly = await getWalletScheduledBills(userId, walletId, { status: 'scheduled' });
```

#### `getScheduledBillById(userId, scheduledBillId)`

Gets a specific scheduled bill by ID.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID

**Returns:** Promise<Object|null> - Scheduled bill object or null

**Example:**
```javascript
const scheduledBill = await getScheduledBillById(userId, 'scheduled_123_abc');
if (scheduledBill) {
  console.log('Found:', scheduledBill.serviceName);
}
```

#### `getUpcomingScheduledBills(userId, days = 7)`

Gets scheduled bills due within next N days.

**Parameters:**
- `userId` (string) - User ID
- `days` (number) - Days to look ahead (default: 7)

**Returns:** Promise<Array<Object>> - Upcoming scheduled bills

**Example:**
```javascript
const upcomingScheduledBills = await getUpcomingScheduledBills(userId);
const nextWeek = await getUpcomingScheduledBills(userId, 7);
```

#### `getOverdueScheduledBills(userId)`

Gets all overdue scheduled bills (scheduled date has passed but not completed).

**Parameters:**
- `userId` (string) - User ID

**Returns:** Promise<Array<Object>> - Overdue scheduled bills

**Example:**
```javascript
const overdueScheduledBills = await getOverdueScheduledBills(userId);
console.log(`You have ${overdueScheduledBills.length} overdue scheduled bills`);
```

#### `getScheduledBillStats(userId)`

Gets comprehensive scheduled bill statistics.

**Parameters:**
- `userId` (string) - User ID

**Returns:** Promise<Object> - Statistics object

**Example:**
```javascript
const stats = await getScheduledBillStats(userId);
console.log('Total scheduled:', stats.totalScheduled);
console.log('Total completed:', stats.totalCompleted);
console.log('Scheduled amount:', stats.totalScheduledAmount);
console.log('Overdue count:', stats.overdueCount);
```

### UPDATE Operations

#### `updateScheduledBillStatus(userId, scheduledBillId, status, additionalData = {})`

Updates scheduled bill status.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID
- `status` (string) - New status
- `additionalData` (Object) - Additional data to update

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await updateScheduledBillStatus(userId, scheduledBillId, 'completed', {
  completedAt: Date.now(),
  completedTransactionId: 'txn_123'
});
```

#### `cancelScheduledBill(userId, scheduledBillId)`

Cancels a scheduled bill.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await cancelScheduledBill(userId, scheduledBillId);
```

#### `updateScheduledDate(userId, scheduledBillId, newScheduledDate)`

Updates the scheduled date.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID
- `newScheduledDate` (number) - New scheduled date timestamp

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
const newDate = new Date('2025-01-15').getTime();
await updateScheduledDate(userId, scheduledBillId, newDate);
```

### DELETE Operations

#### `deleteScheduledBill(userId, scheduledBillId)`

Deletes a scheduled bill.

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID

**Returns:** Promise<boolean> - Success status

**Example:**
```javascript
await deleteScheduledBill(userId, scheduledBillId);
```

### PROCESSING Operations

#### `processScheduledBill(userId, scheduledBillId)`

Processes a scheduled bill (executes the payment).

**Parameters:**
- `userId` (string) - User ID
- `scheduledBillId` (string) - Scheduled bill ID

**Returns:** Promise<Object> - Processing result

**Example:**
```javascript
const result = await processScheduledBill(userId, scheduledBillId);

if (result.success) {
  console.log('Payment successful!');
  console.log('Transaction ID:', result.transactionId);
} else {
  console.log('Payment failed:', result.error);
}
```

#### `processAllDueScheduledBills(userId)`

Processes all due scheduled bills for a user.

**Parameters:**
- `userId` (string) - User ID

**Returns:** Promise<Object> - Processing results

**Example:**
```javascript
const results = await processAllDueScheduledBills(userId);
console.log(`Processed: ${results.processed}/${results.total}`);
console.log(`Failed: ${results.failed}`);
```

---

## Usage Examples

### Example 1: Schedule a Bill Payment

```javascript
import { createScheduledBill } from '../services/scheduledBillsService';

const handleSchedulePayment = async (bill, scheduledDate) => {
  try {
    const scheduledBillData = {
      walletId: bill.walletId,
      billId: bill.id,
      billReferenceNumber: bill.referenceNumber,
      serviceName: bill.serviceName.ar,
      ministryName: bill.ministryName,
      scheduledAmount: bill.amount,
      scheduledDate: new Date(scheduledDate).getTime(),
      metadata: {
        baseAmount: bill.amount,
        serviceType: bill.serviceType
      }
    };

    const scheduledBill = await createScheduledBill(userId, scheduledBillData);

    Alert.alert('نجح', 'تم جدولة الفاتورة بنجاح');
    return scheduledBill;
  } catch (error) {
    console.error('Error scheduling bill:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء جدولة الفاتورة');
  }
};
```

### Example 2: Display Scheduled Bills

```javascript
import { getUserScheduledBills } from '../services/scheduledBillsService';

const ScheduledBillsList = ({ userId }) => {
  const [scheduledBills, setScheduledBills] = useState([]);

  useEffect(() => {
    const fetchScheduledBills = async () => {
      const bills = await getUserScheduledBills(userId, { status: 'scheduled' });
      setScheduledBills(bills);
    };

    fetchScheduledBills();
  }, [userId]);

  return (
    <FlatList
      data={scheduledBills}
      renderItem={({ item }) => (
        <ScheduledBillCard scheduledBill={item} />
      )}
    />
  );
};
```

### Example 3: Process Scheduled Bill Manually

```javascript
import { processScheduledBill } from '../services/scheduledBillsService';

const handlePayNow = async (scheduledBill) => {
  Alert.alert(
    'تنفيذ الدفع',
    `هل تريد دفع ${scheduledBill.serviceName} الآن؟`,
    [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم',
        onPress: async () => {
          const result = await processScheduledBill(userId, scheduledBill.id);

          if (result.success) {
            Alert.alert('نجح', 'تم الدفع بنجاح');
          } else {
            Alert.alert('خطأ', result.error);
          }
        }
      }
    ]
  );
};
```

### Example 4: Cancel Scheduled Bill

```javascript
import { cancelScheduledBill } from '../services/scheduledBillsService';

const handleCancelSchedule = async (scheduledBillId) => {
  try {
    await cancelScheduledBill(userId, scheduledBillId);
    Alert.alert('نجح', 'تم إلغاء الجدولة');
    // Refresh list
    fetchScheduledBills();
  } catch (error) {
    console.error('Error cancelling:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء الإلغاء');
  }
};
```

---

## User Interface

### Screens

#### 1. UpcomingPayDetailsScreen
- **Purpose**: Display bill details and allow scheduling
- **Location**: `src/business/screens/Dashboard/UpcomingPayDetailsScreen.js`
- **Features**:
  - View bill information
  - Schedule payment button
  - Date picker for scheduling

#### 2. ScheduleSuccessScreen
- **Purpose**: Confirm successful scheduling
- **Location**: `src/business/screens/Dashboard/ScheduleSuccessScreen.js`
- **Features**:
  - Success message
  - Scheduled bill details
  - View all scheduled bills button

#### 3. ScheduledBillsScreen
- **Purpose**: View and manage all scheduled bills
- **Location**: `src/business/screens/Dashboard/ScheduledBillsScreen.js`
- **Features**:
  - List all scheduled bills
  - Filter by status (all, scheduled, completed, cancelled)
  - Statistics summary
  - Pay now action
  - Cancel schedule action
  - Pull to refresh

---

## Integration Guide

### Step 1: Import Service

```javascript
import {
  createScheduledBill,
  getUserScheduledBills,
  cancelScheduledBill,
  processScheduledBill
} from '../common/services/scheduledBillsService';
```

### Step 2: Schedule a Bill Payment

```javascript
const schedulePayment = async (bill, date) => {
  const scheduledBillData = {
    walletId: bill.walletId,
    billId: bill.id,
    billReferenceNumber: bill.referenceNumber,
    serviceName: bill.serviceName.ar,
    ministryName: bill.ministryName,
    scheduledAmount: bill.amount,
    scheduledDate: new Date(date).getTime()
  };

  const scheduledBill = await createScheduledBill(userId, scheduledBillData);
  return scheduledBill;
};
```

### Step 3: Display Scheduled Bills

```javascript
useEffect(() => {
  const loadScheduledBills = async () => {
    const bills = await getUserScheduledBills(userId);
    setScheduledBills(bills);
  };

  loadScheduledBills();
}, [userId]);
```

### Step 4: Navigate to Scheduled Bills Screen

```javascript
navigation.navigate('ScheduledBills');
```

---

## Best Practices

### 1. Always Validate Before Processing

```javascript
const result = await processScheduledBill(userId, scheduledBillId);

if (!result.success) {
  // Handle error
  if (result.error === 'Insufficient balance') {
    Alert.alert('رصيد غير كافٍ', 'يرجى شحن المحفظة');
  }
}
```

### 2. Refresh After Actions

```javascript
const handleCancelSchedule = async (scheduledBillId) => {
  await cancelScheduledBill(userId, scheduledBillId);
  // Refresh list
  await fetchScheduledBills();
};
```

### 3. Show Loading States

```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const bills = await getUserScheduledBills(userId);
      setScheduledBills(bills);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [userId]);
```

### 4. Handle Overdue Scheduled Bills

```javascript
const overdueScheduledBills = await getOverdueScheduledBills(userId);

if (overdueScheduledBills.length > 0) {
  Alert.alert(
    'تنبيه',
    `لديك ${overdueScheduledBills.length} جدولة متأخرة`
  );
}
```

---

## Troubleshooting

### Problem: Scheduled bill not appearing

**Causes**:
1. Wrong user ID
2. Scheduled bill not created properly
3. Firebase rules blocking access

**Solutions**:
```javascript
// Verify user ID
console.log('User ID:', userId);

// Check if scheduled bill was created
const scheduledBill = await createScheduledBill(userId, data);
console.log('Created:', scheduledBill);

// Fetch all to verify
const all = await getUserScheduledBills(userId);
console.log('All scheduled bills:', all);
```

### Problem: Cannot process scheduled bill

**Causes**:
1. Insufficient wallet balance
2. Original bill already paid
3. Scheduled bill already processed

**Solutions**:
```javascript
const result = await processScheduledBill(userId, scheduledBillId);

if (!result.success) {
  console.log('Error:', result.error);
  // Handle specific errors
  switch (result.error) {
    case 'Insufficient balance':
      Alert.alert('رصيد غير كافٍ');
      break;
    case 'Bill already paid':
      Alert.alert('الفاتورة مدفوعة مسبقاً');
      break;
  }
}
```

### Problem: Overdue scheduled bills not processing

**Solution**: Implement background job or manual trigger:

```javascript
const processOverdue = async () => {
  const results = await processAllDueScheduledBills(userId);
  console.log(`Processed ${results.processed}/${results.total}`);
};
```

---

## Related Documentation

- [Bills Guide](./BILLS_GUIDE.md)
- [Government Services Guide](./GOVERNMENT_SERVICES_GUIDE.md)
- [Wallet Service](../src/common/services/walletService.js)
- [Bills Service](../src/common/services/billsService.js)
- [Scheduled Bills Service](../src/common/services/scheduledBillsService.js)

---

**Last Updated:** December 2024
**Version:** 1.0.0

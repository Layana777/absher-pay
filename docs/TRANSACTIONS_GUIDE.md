# Transactions Service Guide

## Overview

The Transactions Service provides a comprehensive solution for managing all financial transactions in the Absher Pay application. It supports multiple transaction types including top-ups, payments, transfers, refunds, and more, with full bilingual support (Arabic/English).

## Database Structure

Transactions are organized in Firebase Realtime Database under the following structure:

```
transactions/
  └── {walletId}/
      ├── txn_2024_12345_1733200000/
      │   ├── id: "txn_2024_12345_1733200000"
      │   ├── walletId: "wallet_personal_1234567890"
      │   ├── userId: "user123"
      │   ├── type: "top_up"
      │   ├── category: "deposit"
      │   ├── amount: 500.00
      │   ├── balanceBefore: 1000.00
      │   ├── balanceAfter: 1500.00
      │   ├── status: "completed"
      │   ├── referenceNumber: "TOP-2024-1234"
      │   ├── descriptionAr: "إيداع رصيد"
      │   ├── descriptionEn: "Top-up"
      │   ├── timestamp: 1733200000
      │   ├── createdAt: 1733200000
      │   └── paymentMethod: "mada"
      └── txn_2024_12346_1733210000/
          └── ...
```

## Transaction Types & Categories

### Transaction Types

| Type | Arabic | Description |
|------|--------|-------------|
| `top_up` | إيداع رصيد | Adding money to wallet |
| `payment` | دفع | Payment for government services |
| `refund` | استرجاع مبلغ | Money refund |
| `transfer_in` | تحويل وارد | Incoming transfer from another wallet |
| `transfer_out` | تحويل صادر | Outgoing transfer to another wallet |
| `withdrawal` | سحب رصيد | Withdrawal to bank account |
| `adjustment` | تعديل إداري | Administrative adjustment |
| `cashback` | استرجاع نقدي | Cashback reward |
| `bonus` | مكافأة | Bonus (referral, promotion) |
| `penalty` | غرامة | Penalty fee |
| `reversal` | عكس معاملة | Transaction reversal |
| `fee` | رسوم | Service fee |

### Transaction Categories

| Category | Arabic | Types Included |
|----------|--------|----------------|
| `deposit` | إيداع | top_up |
| `government_service` | خدمة حكومية | payment |
| `refund` | استرجاع | refund |
| `transfer` | تحويل | transfer_in, transfer_out |
| `withdrawal` | سحب | withdrawal |
| `adjustment` | تعديل | adjustment |
| `reward` | مكافأة | cashback, bonus |
| `penalty` | غرامة | penalty |
| `reversal` | عكس | reversal |
| `fee` | رسوم | fee |

### Transaction Status

| Status | Arabic | Description |
|--------|--------|-------------|
| `completed` | مكتملة | Successfully completed |
| `pending` | قيد الانتظار | Awaiting processing |
| `failed` | فاشلة | Transaction failed |
| `cancelled` | ملغاة | Transaction cancelled |

## Import

```javascript
import {
  // Creation functions
  createTopUpTransaction,
  createPaymentTransaction,
  createRefundTransaction,
  createTransferInTransaction,
  createTransferOutTransaction,
  createWithdrawalTransaction,
  createAdjustmentTransaction,
  createCashbackTransaction,
  createBonusTransaction,
  createPenaltyTransaction,
  createReversalTransaction,
  createFeeTransaction,

  // Query functions
  getTransactionById,
  getWalletTransactions,
  getTransactionsByType,
  getTransactionsByCategory,
  getTransactionsByStatus,
  getTransactionsByDateRange,
  searchTransactions,

  // Update functions
  updateTransactionStatus,

  // Analytics functions
  getTransactionStats,
} from '../services';
```

## Transaction Creation Functions

### 1. Top-Up Transaction

Add money to wallet using Mada, Apple Pay, or bank transfer.

```javascript
const result = await createTopUpTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 500.00
  balanceBefore,      // 1000.00
  paymentMethod,      // "mada", "apple_pay", "bank_transfer"
  paymentDetails      // { lastFourDigits: "4532", transactionId: "PAY-2024-001" }
);

if (result.success) {
  console.log('Transaction created:', result.data);
  // result.data.balanceAfter === 1500.00
  // result.data.referenceNumber === "TOP-2024-XXXX"
}
```

**Fields:**
- `amount`: Positive number (automatically formatted to 2 decimals)
- `paymentMethod`: "mada", "apple_pay", "bank_transfer", "credit_card"
- `paymentDetails`: Object with payment-specific data

### 2. Payment Transaction

Pay for government services (driving license, passport, etc.).

```javascript
const result = await createPaymentTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 200.00 (will be stored as -200.00)
  balanceBefore,      // 1500.00
  serviceType,        // "driving_license_renewal"
  descriptionAr,      // "تجديد رخصة القيادة"
  descriptionEn       // "Driving License Renewal"
);

if (result.success) {
  console.log('Payment processed:', result.data);
  // result.data.balanceAfter === 1300.00
  // result.data.amount === -200.00 (negative)
}
```

**Common Service Types:**
- `driving_license_renewal`
- `passport_renewal`
- `iqama_renewal`
- `commercial_license`
- `traffic_violation`
- `vehicle_registration`

### 3. Refund Transaction

Refund money from a previous payment.

```javascript
const result = await createRefundTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 200.00
  balanceBefore,      // 1300.00
  relatedTransaction, // "txn_2024_002" (original payment)
  refundReason,       // "تم إلغاء الخدمة"
  descriptionAr,      // "استرجاع مبلغ - تجديد رخصة القيادة"
  descriptionEn       // "Refund - Driving License Renewal"
);
```

### 4. Transfer In Transaction

Receive money from another wallet.

```javascript
const result = await createTransferInTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 300.00
  balanceBefore,      // 1500.00
  fromWallet,         // "wallet_personal_9876543210"
  fromUserId,         // "user456"
  fromUserName,       // "محمد أحمد"
  transferNote        // "مساهمة في المشروع" (optional)
);

if (result.success) {
  // result.data.descriptionAr === "تحويل وارد من محمد أحمد"
  // result.data.balanceAfter === 1800.00
}
```

### 5. Transfer Out Transaction

Send money to another wallet.

```javascript
const result = await createTransferOutTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 300.00 (will be stored as -300.00)
  balanceBefore,      // 1800.00
  toWallet,           // "wallet_personal_5555555555"
  toUserId,           // "user789"
  toUserName,         // "خالد سعود"
  transferNote        // "دفعة العمل" (optional)
);

if (result.success) {
  // result.data.descriptionAr === "تحويل صادر إلى خالد سعود"
  // result.data.balanceAfter === 1500.00
}
```

### 6. Withdrawal Transaction

Withdraw money to bank account.

```javascript
const result = await createWithdrawalTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 1000.00 (will be stored as -1000.00)
  balanceBefore,      // 1500.00
  withdrawalDetails,  // { bankName, accountNumber, accountHolderName }
  estimatedArrival    // 1733326400 (optional, defaults to +3 days)
);

// withdrawalDetails example:
const withdrawalDetails = {
  bankName: "البنك الأهلي",
  accountNumber: "SA**************4567", // Masked for security
  accountHolderName: "فيصل القباني"
};
```

### 7. Adjustment Transaction

Administrative correction (admin only).

```javascript
const result = await createAdjustmentTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 50.00 (positive or negative)
  balanceBefore,      // 500.00
  adjustmentReason,   // "تعويض عن خطأ تقني"
  adjustedBy          // "admin_001"
);

if (result.success) {
  // result.data.balanceAfter === 550.00
  // result.data.descriptionAr === "تعديل إداري - تعويض عن خطأ تقني"
}
```

### 8. Cashback Transaction

Cashback reward for a purchase.

```javascript
const result = await createCashbackTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 10.00
  balanceBefore,      // 550.00
  relatedTransaction, // "txn_2024_002" (original payment)
  cashbackRate        // 5.0 (5%)
);

if (result.success) {
  // result.data.descriptionAr === "استرجاع نقدي 5%"
  // result.data.balanceAfter === 560.00
}
```

### 9. Bonus Transaction

Referral or promotion bonus.

```javascript
const result = await createBonusTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 100.00
  balanceBefore,      // 560.00
  bonusType,          // "referral", "promotion", "welcome"
  bonusReason         // "مكافأة إحالة صديق"
);

if (result.success) {
  // result.data.descriptionAr === "مكافأة إحالة صديق"
  // result.data.balanceAfter === 660.00
}
```

### 10. Penalty Transaction

Apply penalty for policy violation.

```javascript
const result = await createPenaltyTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 50.00 (will be stored as -50.00)
  balanceBefore,      // 660.00
  penaltyReason       // "تجاوز الحد اليومي"
);

if (result.success) {
  // result.data.descriptionAr === "غرامة - تجاوز الحد اليومي"
  // result.data.balanceAfter === 610.00
}
```

### 11. Reversal Transaction

Reverse a previous transaction.

```javascript
const result = await createReversalTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 300.00
  balanceBefore,      // 610.00
  relatedTransaction, // "txn_2024_005" (transaction being reversed)
  reversalReason      // "خطأ في معلومات المستلم"
);

if (result.success) {
  // result.data.descriptionAr === "عكس معاملة - خطأ في معلومات المستلم"
  // result.data.balanceAfter === 910.00
}
```

### 12. Fee Transaction

Service fee (withdrawal, transfer, etc.).

```javascript
const result = await createFeeTransaction(
  walletId,           // "wallet_personal_1234567890"
  userId,             // "user123"
  amount,             // 5.00 (will be stored as -5.00)
  balanceBefore,      // 910.00
  feeType,            // "withdrawal_fee", "transfer_fee", "service_fee"
  relatedTransaction  // "txn_2024_006" (optional)
);

if (result.success) {
  // result.data.descriptionAr === "رسوم سحب رصيد"
  // result.data.balanceAfter === 905.00
}
```

## Query Functions

### Get Transaction by ID

```javascript
const result = await getTransactionById(walletId, transactionId);

if (result.success) {
  const transaction = result.data;
  console.log(transaction.descriptionAr);
  console.log(transaction.amount);
  console.log(transaction.status);
}
```

### Get All Wallet Transactions

```javascript
// Get last 50 transactions
const result = await getWalletTransactions(walletId);

// With options
const result = await getWalletTransactions(walletId, {
  limit: 100,
  startDate: 1733000000,
  endDate: 1733500000
});

if (result.success) {
  const transactions = result.data; // Sorted by newest first
  transactions.forEach(txn => {
    console.log(`${txn.descriptionAr}: ${txn.amount} SAR`);
  });
}
```

### Get Transactions by Type

```javascript
// Get all top-up transactions
const result = await getTransactionsByType(walletId, 'top_up', 20);

// Get all payments
const result = await getTransactionsByType(walletId, 'payment', 50);

if (result.success) {
  console.log(`Found ${result.data.length} transactions`);
}
```

### Get Transactions by Category

```javascript
// Get all government service payments
const result = await getTransactionsByCategory(walletId, 'government_service');

// Get all rewards
const result = await getTransactionsByCategory(walletId, 'reward');

if (result.success) {
  result.data.forEach(txn => {
    console.log(txn.descriptionAr);
  });
}
```

### Get Transactions by Status

```javascript
// Get pending transactions
const result = await getTransactionsByStatus(walletId, 'pending');

// Get failed transactions
const result = await getTransactionsByStatus(walletId, 'failed');

if (result.success) {
  const pendingCount = result.data.length;
  console.log(`You have ${pendingCount} pending transactions`);
}
```

### Get Transactions by Date Range

```javascript
const startDate = new Date('2024-01-01').getTime();
const endDate = new Date('2024-12-31').getTime();

const result = await getTransactionsByDateRange(walletId, startDate, endDate);

if (result.success) {
  console.log(`Transactions in 2024: ${result.data.length}`);
}
```

### Search Transactions

```javascript
// Search by description or reference number
const result = await searchTransactions(walletId, 'رخصة القيادة');

// Search by reference number
const result = await searchTransactions(walletId, 'TOP-2024-001');

if (result.success) {
  result.data.forEach(txn => {
    console.log(`${txn.referenceNumber}: ${txn.descriptionAr}`);
  });
}
```

## Update Functions

### Update Transaction Status

```javascript
// Mark as completed
await updateTransactionStatus(walletId, transactionId, 'completed');

// Mark as failed with reason
await updateTransactionStatus(
  walletId,
  transactionId,
  'failed',
  'رصيد غير كافٍ'
);

// Mark as cancelled
await updateTransactionStatus(walletId, transactionId, 'cancelled');
```

## Analytics Functions

### Get Transaction Statistics

```javascript
// Get all-time stats
const result = await getTransactionStats(walletId);

// Get stats for specific period
const startDate = new Date('2024-12-01').getTime();
const endDate = new Date('2024-12-31').getTime();

const result = await getTransactionStats(walletId, { startDate, endDate });

if (result.success) {
  const stats = result.data;

  console.log('Total Transactions:', stats.totalTransactions);
  console.log('Total Income:', stats.totalIncome, 'SAR');
  console.log('Total Expense:', stats.totalExpense, 'SAR');
  console.log('Net Amount:', stats.netAmount, 'SAR');

  // Breakdown by type
  console.log('Top-ups:', stats.byType.top_up || 0);
  console.log('Payments:', stats.byType.payment || 0);
  console.log('Transfers Out:', stats.byType.transfer_out || 0);

  // Breakdown by category
  console.log('Government Services:', stats.byCategory.government_service || 0);
  console.log('Rewards:', stats.byCategory.reward || 0);

  // Breakdown by status
  console.log('Completed:', stats.byStatus.completed);
  console.log('Pending:', stats.byStatus.pending);
  console.log('Failed:', stats.byStatus.failed);
}
```

## Usage Examples

### Complete Top-Up Flow

```javascript
import { createTopUpTransaction, updateWalletBalance } from '../services';

const handleTopUp = async (walletId, userId, amount, paymentMethod) => {
  try {
    // 1. Get current wallet balance
    const wallet = await getWalletById(walletId);
    const balanceBefore = wallet.balance;

    // 2. Create transaction
    const txnResult = await createTopUpTransaction(
      walletId,
      userId,
      amount,
      balanceBefore,
      paymentMethod,
      {
        lastFourDigits: '4532',
        transactionId: 'PAY-2024-001'
      }
    );

    if (!txnResult.success) {
      throw new Error(txnResult.error);
    }

    // 3. Update wallet balance
    const newBalance = balanceBefore + amount;
    await updateWalletBalance(walletId, newBalance);

    // 4. Show success message
    Alert.alert(
      'نجح الإيداع',
      `تم إضافة ${amount.toFixed(2)} ريال سعودي إلى محفظتك`
    );

    return txnResult.data;
  } catch (error) {
    console.error('Top-up failed:', error);
    Alert.alert('خطأ', 'فشل في إتمام عملية الإيداع');
  }
};
```

### Complete Payment Flow

```javascript
const handlePayment = async (walletId, userId, serviceType, amount) => {
  try {
    // 1. Get current wallet balance
    const wallet = await getWalletById(walletId);
    const balanceBefore = wallet.balance;

    // 2. Check sufficient balance
    if (balanceBefore < amount) {
      Alert.alert('رصيد غير كافٍ', 'يرجى إضافة رصيد إلى محفظتك');
      return;
    }

    // 3. Create payment transaction
    const txnResult = await createPaymentTransaction(
      walletId,
      userId,
      amount,
      balanceBefore,
      serviceType,
      'تجديد رخصة القيادة',
      'Driving License Renewal'
    );

    if (!txnResult.success) {
      throw new Error(txnResult.error);
    }

    // 4. Update wallet balance
    const newBalance = balanceBefore - amount;
    await updateWalletBalance(walletId, newBalance);

    // 5. Show success message
    Alert.alert(
      'تمت العملية بنجاح',
      `رقم المرجع: ${txnResult.data.referenceNumber}`
    );

    return txnResult.data;
  } catch (error) {
    console.error('Payment failed:', error);

    // Mark transaction as failed
    if (error.transactionId) {
      await updateTransactionStatus(
        walletId,
        error.transactionId,
        'failed',
        error.message
      );
    }
  }
};
```

### Display Transaction History

```javascript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { getWalletTransactions } from '../services';

const TransactionHistory = ({ walletId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [walletId]);

  const loadTransactions = async () => {
    const result = await getWalletTransactions(walletId, { limit: 50 });

    if (result.success) {
      setTransactions(result.data);
    }

    setLoading(false);
  };

  const renderTransaction = ({ item }) => {
    const isPositive = item.amount > 0;
    const amountColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <View className="p-4 bg-white mb-2 rounded-lg">
        <Text className="text-base font-semibold text-gray-900">
          {item.descriptionAr}
        </Text>

        <Text className="text-sm text-gray-500 mt-1">
          {item.referenceNumber}
        </Text>

        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-xs text-gray-400">
            {new Date(item.timestamp).toLocaleDateString('ar-SA')}
          </Text>

          <Text
            className="text-lg font-bold"
            style={{ color: amountColor }}
          >
            {isPositive ? '+' : ''}{item.amount.toFixed(2)} ريال
          </Text>
        </View>

        <View className="mt-2">
          <Text className={`text-xs px-2 py-1 rounded-full self-start ${
            item.status === 'completed' ? 'bg-green-100 text-green-800' :
            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {item.status === 'completed' ? 'مكتملة' :
             item.status === 'pending' ? 'قيد الانتظار' :
             item.status === 'failed' ? 'فاشلة' : 'ملغاة'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text>جاري التحميل...</Text>;
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderTransaction}
      contentContainerClassName="p-4"
    />
  );
};

export default TransactionHistory;
```

## Best Practices

### 1. Always Track Balance Changes

```javascript
// ✅ Good - Track balance before and after
const wallet = await getWalletById(walletId);
const balanceBefore = wallet.balance;

await createTopUpTransaction(walletId, userId, amount, balanceBefore, ...);

const balanceAfter = balanceBefore + amount;
await updateWalletBalance(walletId, balanceAfter);
```

### 2. Handle Transaction Failures

```javascript
// ✅ Good - Update status on failure
try {
  const result = await processPayment(...);
  if (!result.success) {
    await updateTransactionStatus(walletId, txnId, 'failed', result.error);
  }
} catch (error) {
  await updateTransactionStatus(walletId, txnId, 'failed', error.message);
}
```

### 3. Link Related Transactions

```javascript
// ✅ Good - Reference original transaction in refunds
const refundResult = await createRefundTransaction(
  walletId,
  userId,
  amount,
  balanceBefore,
  originalTransactionId,  // Link to original payment
  refundReason,
  descriptionAr,
  descriptionEn
);
```

### 4. Use Reference Numbers for Customer Support

```javascript
// ✅ Good - Always show reference number to user
Alert.alert(
  'تمت العملية بنجاح',
  `رقم المرجع: ${transaction.referenceNumber}\n` +
  'احتفظ بهذا الرقم للمراجعة'
);
```

### 5. Implement Proper Error Handling

```javascript
// ✅ Good - Comprehensive error handling
const handleTransaction = async () => {
  try {
    // Validate inputs
    if (amount <= 0) {
      throw new Error('المبلغ يجب أن يكون أكبر من صفر');
    }

    // Check balance
    const wallet = await getWalletById(walletId);
    if (wallet.balance < amount) {
      throw new Error('رصيد غير كافٍ');
    }

    // Process transaction
    const result = await createPaymentTransaction(...);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('Transaction error:', error);
    Alert.alert('خطأ', error.message);
    return null;
  }
};
```

## Common Patterns

### Filter Transactions by Month

```javascript
const getMonthlyTransactions = async (walletId, year, month) => {
  const startDate = new Date(year, month - 1, 1).getTime();
  const endDate = new Date(year, month, 0, 23, 59, 59).getTime();

  return await getTransactionsByDateRange(walletId, startDate, endDate);
};

// Usage
const result = await getMonthlyTransactions(walletId, 2024, 12);
```

### Calculate Monthly Expenses

```javascript
const getMonthlyExpenses = async (walletId, year, month) => {
  const result = await getMonthlyTransactions(walletId, year, month);

  if (result.success) {
    const totalExpense = result.data
      .filter(txn => txn.amount < 0)
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

    return totalExpense.toFixed(2);
  }

  return 0;
};
```

### Get Recent Activity

```javascript
const getRecentActivity = async (walletId, days = 7) => {
  const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  const endDate = Date.now();

  return await getTransactionsByDateRange(walletId, startDate, endDate);
};
```

## Response Format

All transaction functions return a standardized response:

```javascript
// Success response
{
  success: true,
  data: {
    id: "txn_2024_12345_1733200000",
    walletId: "wallet_personal_1234567890",
    userId: "user123",
    type: "top_up",
    category: "deposit",
    amount: 500.00,
    balanceBefore: 1000.00,
    balanceAfter: 1500.00,
    status: "completed",
    referenceNumber: "TOP-2024-1234",
    descriptionAr: "إيداع رصيد",
    descriptionEn: "Top-up",
    timestamp: 1733200000,
    createdAt: 1733200000,
    // ... additional fields based on transaction type
  }
}

// Error response
{
  success: false,
  error: "Error message here"
}
```

## Security Considerations

1. **Always validate amounts** - Ensure amounts are positive and within limits
2. **Check balance before deductions** - Prevent negative balances
3. **Mask sensitive data** - Hide full account numbers, show only last 4 digits
4. **Log all transactions** - Maintain audit trail for compliance
5. **Use atomic operations** - Ensure balance updates happen with transactions
6. **Implement rate limiting** - Prevent abuse and fraud
7. **Require authentication** - Verify user identity before transactions

## Summary

The Transactions Service provides:

✅ **12 transaction types** covering all financial operations
✅ **Bilingual support** with Arabic and English descriptions
✅ **Automatic ID generation** for transactions and reference numbers
✅ **Balance tracking** with before/after amounts
✅ **Comprehensive querying** by type, category, status, date, and search
✅ **Analytics & statistics** for financial insights
✅ **Status management** for transaction lifecycle
✅ **Audit trail** with timestamps and user tracking

Follow this guide to implement robust transaction management in your Absher Pay application!

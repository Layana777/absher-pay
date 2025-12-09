/**
 * Government Bills Sample Data
 *
 * This file contains sample bill objects demonstrating different scenarios
 * and showing what each field can contain.
 *
 * Use these samples as reference when:
 * - Understanding the bill data structure
 * - Testing bill-related features
 * - Implementing bill UI components
 */

// ============================================================================
// SAMPLE 1: Unpaid Business Bill - Iqama Renewal
// ============================================================================

export const SAMPLE_UNPAID_BUSINESS_BILL = {
  // Core identifiers
  id: "bill_1703856234567_abc123",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_business_7001234567890",

  // Wallet type flag
  isBusiness: true,

  // Service classification (hierarchical)
  serviceType: "civil_affairs",           // Main category
  serviceSubType: "renew_iqama",           // Specific service
  serviceName: {
    ar: "تجديد إقامة",
    en: "Renew Iqama"
  },

  // Ministry information
  category: "moi_civil_affairs",                        // Category code
  ministry: "MOI",                        // Ministry code
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  // Financial information
  amount: 2000,                             // Base amount in SAR
  currency: "SAR",

  // Status (one of: "paid", "unpaid", "overdue", "upcoming")
  status: "unpaid",

  // Dates (all timestamps in milliseconds)
  issueDate: 1703856234567,                 // When bill was issued
  dueDate: 1705152234567,                   // Payment due date (15 days from issue)
  paymentDate: null,                        // Null if not paid
  paidWith: null,                           // Transaction ID if paid

  // Reference and description
  referenceNumber: "CIVIL-2024-7856",       // Format: PREFIX-YEAR-RANDOM
  description: {
    ar: "فاتورة تجديد إقامة",
    en: "Iqama renewal bill"
  },

  // Service-specific additional information
  additionalInfo: {
    employeeName: "أحمد محمد",
    iqamaNumber: "2345678901",
    nationality: "مصري",
    occupation: "محاسب"
  },

  // Penalty information (null if not overdue)
  penaltyInfo: null,

  // Metadata
  createdAt: 1703856234567,
  updatedAt: 1703856234567
};

// ============================================================================
// SAMPLE 2: Overdue Personal Bill - Traffic Violation
// ============================================================================

export const SAMPLE_OVERDUE_TRAFFIC_BILL = {
  id: "bill_1703000000000_xyz789",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_personal_1234567890",

  isBusiness: false,

  serviceType: "traffic",
  serviceSubType: "traffic_violations",
  serviceName: {
    ar: "مخالفة مرورية",
    en: "Traffic Violation"
  },

  category: "moi_traffic",
  ministry: "MOI",
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  amount: 500,                              // Original amount
  currency: "SAR",

  status: "overdue",                        // Bill is overdue!

  issueDate: 1700000000000,                 // Issued ~45 days ago
  dueDate: 1703000000000,                   // Was due ~5 days ago
  paymentDate: null,
  paidWith: null,

  referenceNumber: "TRAF-2024-1234",
  description: {
    ar: "فاتورة مخالفة مرورية",
    en: "Traffic violation bill"
  },

  // Traffic-specific information
  additionalInfo: {
    plateNumber: "أ ب ج 1234",
    violationType: "speeding_major",
    violationSubType: "speeding_major",
    location: "طريق الملك فهد - الرياض",
    violationDate: 1700000000000,
    speed: "140 km/h",
    speedLimit: "120 km/h"
  },

  // Penalty calculated (10% late fee)
  penaltyInfo: {
    lateFee: 50.00,                         // 10% of 500
    daysOverdue: 5,                         // Days past due date
    totalWithPenalty: 550.00                // 500 + 50
  },

  createdAt: 1700000000000,
  updatedAt: 1703400000000                  // Updated when penalty calculated
};

// ============================================================================
// SAMPLE 3: Paid Personal Bill - Passport Renewal
// ============================================================================

export const SAMPLE_PAID_PASSPORT_BILL = {
  id: "bill_1698000000000_def456",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_personal_1234567890",

  isBusiness: false,

  serviceType: "passports",
  serviceSubType: "renew_passport",
  serviceName: {
    ar: "تجديد جواز السفر",
    en: "Renew Passport"
  },

  category: "moi_passports",
  ministry: "MOI",
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  amount: 300,
  currency: "SAR",

  status: "paid",                           // Already paid!

  issueDate: 1693000000000,                 // ~60 days ago
  dueDate: 1700000000000,                   // Was due ~30 days ago
  paymentDate: 1699000000000,               // Paid ~35 days ago (before due date)
  paidWith: "txn_1699000000000_abc123",     // Transaction ID

  referenceNumber: "PASS-2024-5678",
  description: {
    ar: "فاتورة تجديد جواز السفر",
    en: "Passport renewal bill"
  },

  // Passport-specific information
  additionalInfo: {
    passportNumber: "P123456789",
    expiryDate: 1700000000000,
    holderName: "فيصل عبدالله"
  },

  penaltyInfo: null,                        // No penalty (paid on time)

  createdAt: 1693000000000,
  updatedAt: 1699000000000
};

// ============================================================================
// SAMPLE 4: Upcoming Business Bill - Multiple Employees
// ============================================================================

export const SAMPLE_UPCOMING_MULTI_EMPLOYEE_BILL = {
  id: "bill_1706000000000_ghi321",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_business_7001234567890",

  isBusiness: true,

  serviceType: "civil_affairs",
  serviceSubType: "renew_iqama",
  serviceName: {
    ar: "تجديد إقامة العمالة",
    en: "Renew Workers Iqama"
  },

  category: "moi_civil_affairs",
  ministry: "MOI",
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  amount: 6500,                             // Total for multiple employees
  currency: "SAR",

  status: "upcoming",                       // Not yet issued

  issueDate: 1710000000000,                 // Will be issued in ~10 days
  dueDate: 1712592000000,                   // Due in ~40 days
  paymentDate: null,
  paidWith: null,

  referenceNumber: "CIVIL-2024-9012",
  description: {
    ar: "فاتورة تجديد إقامة العمالة",
    en: "Workers iqama renewal bill"
  },

  // Multiple employees information
  additionalInfo: {
    employeeCount: 13,                      // Total number of workers
    employees: [
      {
        name: "أحمد محمد",
        iqamaNumber: "2234567890",
        amount: 500,
        occupation: "محاسب"
      },
      {
        name: "محمد علي",
        iqamaNumber: "2345678901",
        amount: 500,
        occupation: "مهندس"
      },
      {
        name: "علي حسن",
        iqamaNumber: "2456789012",
        amount: 500,
        occupation: "سائق"
      },
      {
        name: "حسن أحمد",
        iqamaNumber: "2567890123",
        amount: 500,
        occupation: "فني"
      },
      {
        name: "خالد محمود",
        iqamaNumber: "2678901234",
        amount: 500,
        occupation: "كهربائي"
      },
      {
        name: "محمود فيصل",
        iqamaNumber: "2789012345",
        amount: 500,
        occupation: "نجار"
      },
      {
        name: "عبدالله سالم",
        iqamaNumber: "2890123456",
        amount: 500,
        occupation: "سباك"
      },
      {
        name: "سالم ناصر",
        iqamaNumber: "2901234567",
        amount: 500,
        occupation: "بناء"
      },
      {
        name: "ناصر عمر",
        iqamaNumber: "3012345678",
        amount: 500,
        occupation: "حداد"
      },
      {
        name: "عمر طارق",
        iqamaNumber: "3123456789",
        amount: 500,
        occupation: "طباخ"
      },
      {
        name: "طارق زياد",
        iqamaNumber: "3234567890",
        amount: 500,
        occupation: "حارس"
      },
      {
        name: "زياد وليد",
        iqamaNumber: "3345678901",
        amount: 500,
        occupation: "عامل نظافة"
      },
      {
        name: "وليد ماجد",
        iqamaNumber: "3456789012",
        amount: 500,
        occupation: "مساعد إداري"
      }
    ]
  },

  penaltyInfo: null,

  createdAt: 1705000000000,
  updatedAt: 1705000000000
};

// ============================================================================
// SAMPLE 5: Commerce Registration - Business Bill
// ============================================================================

export const SAMPLE_COMMERCE_REGISTRATION_BILL = {
  id: "bill_1704000000000_jkl654",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_business_7001234567890",

  isBusiness: true,

  serviceType: "commerce",
  serviceSubType: "renew_commercial_registration",
  serviceName: {
    ar: "تجديد السجل التجاري",
    en: "Renew Commercial Registration"
  },

  category: "moc",
  ministry: "MOC",
  ministryName: {
    ar: "وزارة التجارة",
    en: "Ministry of Commerce"
  },

  amount: 1200,
  currency: "SAR",

  status: "unpaid",

  issueDate: 1703000000000,
  dueDate: 1705592000000,                   // ~22 days from issue
  paymentDate: null,
  paidWith: null,

  referenceNumber: "COM-2024-3456",
  description: {
    ar: "فاتورة تجديد السجل التجاري",
    en: "Commercial registration renewal bill"
  },

  additionalInfo: {},                       // May be empty for some services

  penaltyInfo: null,

  createdAt: 1703000000000,
  updatedAt: 1703000000000
};

// ============================================================================
// SAMPLE 6: National ID Renewal - Personal Bill
// ============================================================================

export const SAMPLE_NATIONAL_ID_BILL = {
  id: "bill_1705000000000_mno987",
  userId: "user_firebase_uid_12345",
  walletId: "wallet_personal_1234567890",

  isBusiness: false,

  serviceType: "civil_affairs",
  serviceSubType: "renew_national_id",
  serviceName: {
    ar: "تجديد بطاقة الهوية",
    en: "Renew National ID"
  },

  category: "moi_civil_affairs",
  ministry: "MOI",
  ministryName: {
    ar: "وزارة الداخلية",
    en: "Ministry of Interior"
  },

  amount: 100,
  currency: "SAR",

  status: "unpaid",

  issueDate: 1703856234567,
  dueDate: 1707000000000,
  paymentDate: null,
  paidWith: null,

  referenceNumber: "CIVIL-2024-7890",
  description: {
    ar: "فاتورة تجديد بطاقة الهوية",
    en: "National ID renewal bill"
  },

  additionalInfo: {
    nationalId: "1234567890",
    expiryDate: 1707000000000
  },

  penaltyInfo: null,

  createdAt: 1703856234567,
  updatedAt: 1703856234567
};

// ============================================================================
// FIELD VALUE REFERENCE GUIDE
// ============================================================================

export const FIELD_REFERENCE = {
  // Core Identifiers
  id: {
    type: "string",
    format: "bill_[timestamp]_[random]",
    example: "bill_1703856234567_abc123",
    description: "Unique bill identifier"
  },

  userId: {
    type: "string",
    format: "Firebase UID",
    example: "user_firebase_uid_12345",
    description: "User who owns the bill"
  },

  walletId: {
    type: "string",
    format: "wallet_[type]_[number]",
    examples: ["wallet_personal_1234567890", "wallet_business_7001234567890"],
    description: "Associated wallet identifier"
  },

  isBusiness: {
    type: "boolean",
    values: [true, false],
    description: "Wallet type flag - true for business, false for personal"
  },

  // Service Classification
  serviceType: {
    type: "string",
    values: ["passports", "traffic", "civil_affairs", "commerce"],
    description: "Main service category"
  },

  serviceSubType: {
    type: "string",
    examples: ["renew_iqama", "traffic_violations", "renew_passport", "renew_commercial_registration"],
    description: "Specific service under the main category"
  },

  category: {
    type: "string",
    values: ["moi_passports", "moi_traffic", "moi_civil_affairs", "moc"],
    description: "Category code for filtering and grouping"
  },

  ministry: {
    type: "string",
    values: ["MOI", "MOC"],
    description: "Ministry abbreviation code"
  },

  // Financial Information
  amount: {
    type: "number",
    range: "Positive number",
    examples: [50, 100, 300, 500, 1200, 2000, 6500],
    description: "Base bill amount in SAR (before penalties)"
  },

  currency: {
    type: "string",
    value: "SAR",
    description: "Currency code - always SAR for Saudi bills"
  },

  // Status
  status: {
    type: "string",
    values: ["paid", "unpaid", "overdue", "upcoming"],
    descriptions: {
      paid: "Bill has been paid",
      unpaid: "Bill is due but not yet paid",
      overdue: "Bill is past due date and incurs penalties",
      upcoming: "Bill will be issued in the future"
    }
  },

  // Dates
  issueDate: {
    type: "number",
    format: "Timestamp in milliseconds",
    example: 1703856234567,
    description: "When the bill was issued by the government"
  },

  dueDate: {
    type: "number",
    format: "Timestamp in milliseconds",
    example: 1705152234567,
    description: "Payment due date - penalties apply after this date"
  },

  paymentDate: {
    type: "number | null",
    format: "Timestamp in milliseconds or null",
    example: 1699000000000,
    description: "When the bill was paid - null if not yet paid"
  },

  paidWith: {
    type: "string | null",
    format: "Transaction ID or null",
    example: "txn_1699000000000_abc123",
    description: "Transaction ID used for payment - null if not paid"
  },

  // Reference
  referenceNumber: {
    type: "string",
    format: "PREFIX-YEAR-RANDOM",
    examples: ["PASS-2024-5678", "TRAF-2024-1234", "IQAMA-2024-7856"],
    prefixes: {
      PASS: "Passports",
      TRAF: "Traffic",
      CIVIL: "Civil Affairs",
      IQAMA: "Human Resources",
      COM: "Commerce",
      JUS: "Justice"
    },
    description: "Government-issued reference number"
  },

  // Penalty Information
  penaltyInfo: {
    type: "object | null",
    structure: {
      lateFee: "number (10% of amount)",
      daysOverdue: "number (days past due date)",
      totalWithPenalty: "number (amount + lateFee)"
    },
    example: { lateFee: 50.00, daysOverdue: 5, totalWithPenalty: 550.00 },
    description: "Penalty details - only present for overdue bills"
  },

  // Additional Info
  additionalInfo: {
    type: "object",
    description: "Service-specific additional information - varies by service type",
    byServiceType: {
      passports: ["passportNumber", "expiryDate", "holderName"],
      traffic: ["plateNumber", "violationType", "location", "speed", "speedLimit"],
      civil_affairs: ["nationalId", "expiryDate", "employeeName", "iqamaNumber", "nationality", "occupation", "employeeCount", "employees", "visaType", "validUntil"],
      commerce: ["registrationNumber", "companyName"]
    }
  },

  // Metadata
  createdAt: {
    type: "number",
    format: "Timestamp in milliseconds",
    example: 1703856234567,
    description: "When the bill record was created in Firebase"
  },

  updatedAt: {
    type: "number",
    format: "Timestamp in milliseconds",
    example: 1703856234567,
    description: "When the bill was last updated"
  }
};

// ============================================================================
// ALL SAMPLES ARRAY
// ============================================================================

export const ALL_SAMPLES = [
  SAMPLE_UNPAID_BUSINESS_BILL,
  SAMPLE_OVERDUE_TRAFFIC_BILL,
  SAMPLE_PAID_PASSPORT_BILL,
  SAMPLE_UPCOMING_MULTI_EMPLOYEE_BILL,
  SAMPLE_COMMERCE_REGISTRATION_BILL,
  SAMPLE_NATIONAL_ID_BILL
];

// ============================================================================
// HELPER: Get Sample by Type
// ============================================================================

export const getSampleByStatus = (status) => {
  return ALL_SAMPLES.filter(sample => sample.status === status);
};

export const getSampleByWalletType = (isBusiness) => {
  return ALL_SAMPLES.filter(sample => sample.isBusiness === isBusiness);
};

export const getSampleByServiceType = (serviceType) => {
  return ALL_SAMPLES.filter(sample => sample.serviceType === serviceType);
};

export const getSampleByMinistry = (ministry) => {
  return ALL_SAMPLES.filter(sample => sample.ministry === ministry);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SAMPLE_UNPAID_BUSINESS_BILL,
  SAMPLE_OVERDUE_TRAFFIC_BILL,
  SAMPLE_PAID_PASSPORT_BILL,
  SAMPLE_UPCOMING_MULTI_EMPLOYEE_BILL,
  SAMPLE_COMMERCE_REGISTRATION_BILL,
  SAMPLE_NATIONAL_ID_BILL,
  FIELD_REFERENCE,
  ALL_SAMPLES,
  getSampleByStatus,
  getSampleByWalletType,
  getSampleByServiceType,
  getSampleByMinistry
};

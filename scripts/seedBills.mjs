/**
 * Seed Government Bills Script
 *
 * This script generates and populates test bills in Firebase for specific users and wallets.
 *
 * Usage:
 *   node scripts/seedBills.mjs --userId="YOUR_USER_ID" --walletId="YOUR_WALLET_ID"
 *   node scripts/seedBills.mjs --userId="abc123" --walletId="wallet_personal_1234567890" --count=10
 *
 * Options:
 *   --userId          Firebase user ID (required)
 *   --walletId        Wallet ID (required)
 *   --count           Number of bills to generate (default: 5)
 *   --statuses        Comma-separated statuses (default: unpaid,paid,overdue,upcoming)
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCx0GXCgSaNJlrg1a_goaLHp58IuwviL3M",
  authDomain: "absher-pay.firebaseapp.com",
  databaseURL:
    "https://absher-pay-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "absher-pay",
  storageBucket: "absher-pay.firebasestorage.app",
  messagingSenderId: "523633067316",
  appId: "1:523633067316:web:862ec426fee4e8abb85161",
  measurementId: "G-NGTKK52CB7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ============================================================================
// COMMAND-LINE ARGUMENT PARSING
// ============================================================================

const parseArgs = () => {
  const args = process.argv.slice(2);
  const params = {};

  args.forEach((arg) => {
    const [key, value] = arg.split("=");
    if (key && value) {
      const cleanKey = key.replace("--", "");
      params[cleanKey] = value.replace(/['"]/g, ""); // Remove quotes
    }
  });

  return params;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch wallet data from Firebase
 */
const getWalletData = async (walletId) => {
  try {
    const walletRef = ref(database, `wallets/${walletId}`);
    const snapshot = await get(walletRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    return null;
  }
};

/**
 * Validate required parameters
 */
const validateParams = (params) => {
  const errors = [];

  if (!params.userId) {
    errors.push("--userId is required");
  }

  if (!params.walletId) {
    errors.push("--walletId is required");
  }

  return errors;
};

/**
 * Generate bill reference number
 */
const generateBillReferenceNumber = (serviceType) => {
  const prefixes = {
    passports: "PASS",
    traffic: "TRAF",
    civil_affairs: "CIVIL",
    human_resources: "IQAMA",
    commerce: "COM",
    justice: "JUS",
  };

  const prefix = prefixes[serviceType] || "BILL";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${prefix}-${year}-${random}`;
};

/**
 * Generate random bill
 */
const generateRandomBill = (userId, walletId, isBusiness, status) => {
  // Define available services based on wallet type
  const personalServices = [
    "passports",
    "traffic",
    "civil_affairs",
  ];
  const businessServices = [
    "human_resources",
    "commerce",
    "justice",
  ];

  const availableServices = isBusiness ? businessServices : personalServices;
  const serviceType =
    availableServices[Math.floor(Math.random() * availableServices.length)];

  // Generate dates based on status
  const now = Date.now();
  let issueDate, dueDate, paymentDate = null, paidWith = null;

  switch (status) {
    case "paid":
      issueDate = now - 60 * 24 * 60 * 60 * 1000; // 60 days ago
      dueDate = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
      paymentDate = now - 35 * 24 * 60 * 60 * 1000; // Paid 35 days ago
      paidWith = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      break;
    case "unpaid":
      issueDate = now - 15 * 24 * 60 * 60 * 1000; // 15 days ago
      dueDate = now + 15 * 24 * 60 * 60 * 1000; // Due in 15 days
      break;
    case "overdue":
      issueDate = now - 45 * 24 * 60 * 60 * 1000; // 45 days ago
      dueDate = now - 5 * 24 * 60 * 60 * 1000; // 5 days overdue
      break;
    case "upcoming":
      issueDate = now + 10 * 24 * 60 * 60 * 1000; // Will be issued in 10 days
      dueDate = now + 40 * 24 * 60 * 60 * 1000; // Due in 40 days
      break;
    default:
      issueDate = now;
      dueDate = now + 30 * 24 * 60 * 60 * 1000;
  }

  // Sample service data
  const serviceData = {
    passports: {
      ar: "تجديد جواز السفر",
      en: "Renew Passport",
      amount: 300,
      category: "moi_passports",
      ministry: "MOI",
      ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
    },
    traffic: {
      ar: "مخالفة مرورية",
      en: "Traffic Violation",
      amount: 500,
      category: "moi_traffic",
      ministry: "MOI",
      ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
    },
    civil_affairs: {
      ar: "تجديد بطاقة الهوية",
      en: "Renew National ID",
      amount: 100,
      category: "moi_civil_affairs",
      ministry: "MOI",
      ministryName: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
    },
    human_resources: {
      ar: "تجديد إقامة",
      en: "Renew Iqama",
      amount: 2000,
      category: "mhrsd",
      ministry: "MHRSD",
      ministryName: {
        ar: "وزارة الموارد البشرية",
        en: "Ministry of Human Resources",
      },
    },
    commerce: {
      ar: "تجديد السجل التجاري",
      en: "Renew Commercial Registration",
      amount: 200,
      category: "moc",
      ministry: "MOC",
      ministryName: { ar: "وزارة التجارة", en: "Ministry of Commerce" },
    },
    justice: {
      ar: "توثيق عقد",
      en: "Contract Notarization",
      amount: 50,
      category: "moj",
      ministry: "MOJ",
      ministryName: { ar: "وزارة العدل", en: "Ministry of Justice" },
    },
  };

  const service = serviceData[serviceType];

  // Calculate penalty if overdue
  let penaltyInfo = null;
  if (status === "overdue") {
    const daysOverdue = Math.abs(Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));
    const lateFee = service.amount * 0.1;
    penaltyInfo = {
      lateFee: parseFloat(lateFee.toFixed(2)),
      daysOverdue,
      totalWithPenalty: parseFloat((service.amount + lateFee).toFixed(2)),
    };
  }

  const billId = `bill_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    id: billId,
    userId,
    walletId,
    isBusiness,
    serviceType,
    serviceSubType: `${serviceType}_sub`,
    serviceName: {
      ar: service.ar,
      en: service.en,
    },
    category: service.category,
    ministry: service.ministry,
    ministryName: service.ministryName,
    amount: service.amount,
    currency: "SAR",
    status,
    issueDate,
    dueDate,
    paymentDate,
    paidWith,
    referenceNumber: generateBillReferenceNumber(serviceType),
    description: {
      ar: `فاتورة ${service.ar}`,
      en: `${service.en} bill`,
    },
    additionalInfo: {},
    penaltyInfo,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

/**
 * Seed bills to Firebase
 */
const seedBills = async (userId, bills) => {
  try {
    let success = 0;
    let failed = 0;

    for (const bill of bills) {
      try {
        const billRef = ref(database, `governmentBills/${userId}/${bill.id}`);
        await import("firebase/database").then(({ set }) =>
          set(billRef, bill)
        );
        success++;
        console.log(`   ✅ Bill ${bill.id} created (${bill.serviceName.en})`);
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to create bill:`, error.message);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { success, failed };
  } catch (error) {
    console.error("❌ Error seeding bills:", error);
    throw error;
  }
};

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log("🌱 Starting Government Bills seeding process...");
  console.log("=".repeat(70));

  // Parse arguments
  const params = parseArgs();

  // Validate parameters
  const errors = validateParams(params);
  if (errors.length > 0) {
    console.error("\n❌ Missing required parameters:\n");
    errors.forEach((error) => console.error(`   - ${error}`));
    console.log("\n📖 Usage:");
    console.log(
      '   node scripts/seedBills.mjs --userId="YOUR_ID" --walletId="YOUR_WALLET_ID"'
    );
    console.log("\n📋 Options:");
    console.log("   --userId       Firebase user ID (required)");
    console.log("   --walletId     Wallet ID (required)");
    console.log("   --count        Number of bills to generate (default: 5)");
    console.log("   --statuses     Comma-separated statuses (default: unpaid,paid,overdue,upcoming)");
    process.exit(1);
  }

  const userId = params.userId;
  const walletId = params.walletId;
  const count = parseInt(params.count) || 5;
  const statuses = params.statuses
    ? params.statuses.split(",")
    : ["unpaid", "paid", "overdue", "upcoming"];

  console.log("\n📊 CONFIGURATION");
  console.log("=".repeat(70));
  console.log(`   User ID: ${userId}`);
  console.log(`   Wallet ID: ${walletId}`);
  console.log(`   Bills to generate: ${count}`);
  console.log(`   Statuses: ${statuses.join(", ")}`);

  // Fetch wallet data
  console.log("\n🔍 Fetching wallet data...");
  const wallet = await getWalletData(walletId);

  if (!wallet) {
    console.error(`\n❌ Wallet not found: ${walletId}`);
    console.log("   Please check the wallet ID and try again.");
    process.exit(1);
  }

  const isBusiness = wallet.type === "business";
  console.log(`   ✅ Wallet found: ${wallet.type} wallet`);
  console.log(`   Balance: ${wallet.balance} ${wallet.currency}`);

  // Generate bills
  console.log("\n🎲 Generating bills...");
  const bills = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const bill = generateRandomBill(userId, walletId, isBusiness, status);
    bills.push(bill);
  }

  console.log(`   ✅ Generated ${bills.length} bills`);

  // Display bill summary
  console.log("\n📋 BILL SUMMARY");
  console.log("=".repeat(70));
  const summary = {
    total: bills.length,
    byStatus: {},
    totalAmount: 0,
  };

  bills.forEach((bill) => {
    summary.byStatus[bill.status] = (summary.byStatus[bill.status] || 0) + 1;
    summary.totalAmount += bill.penaltyInfo?.totalWithPenalty || bill.amount;
  });

  console.log(`   Total Bills: ${summary.total}`);
  console.log(`   Total Amount: ${summary.totalAmount.toFixed(2)} SAR`);
  console.log("   By Status:");
  Object.entries(summary.byStatus).forEach(([status, count]) => {
    console.log(`      - ${status}: ${count}`);
  });

  // Seed bills to Firebase
  console.log("\n🌱 Seeding bills to Firebase...\n");
  const result = await seedBills(userId, bills);

  // Print final summary
  console.log("\n" + "=".repeat(70));
  console.log("📈 SEEDING SUMMARY");
  console.log("=".repeat(70));
  console.log(`✅ Seeded: ${result.success}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📊 Total: ${bills.length}`);
  console.log("=".repeat(70));

  if (result.success > 0) {
    console.log("\n✨ Bills successfully seeded to Firebase!");
    console.log("🔍 Check Firebase Console to verify the data.");
    console.log(`📂 Path: governmentBills/${userId}`);
  }

  if (result.failed > 0) {
    console.log("\n⚠️  Some bills failed to seed. Check errors above.");
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});

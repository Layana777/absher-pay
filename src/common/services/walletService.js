import { ref, set, get, update } from "firebase/database";
import { database } from "./firebase";
import { DB_PATHS } from "./firebase/databasePaths";

// Helper Functions

/**
 * Generates unique wallet ID
 * @param {string} type - Wallet type (personal|business)
 * @param {string} nationalId - National ID
 * @returns {string} Wallet ID
 */
const generateWalletId = (type, nationalId) => {
  return `wallet_${type}_${nationalId}`;
};

/**
 * Generates random dummy wallet data for simulation
 * @param {string} type - Wallet type (personal|business)
 * @param {string} nationalId - National ID
 * @param {string} userId - Firebase UID
 * @returns {object} Wallet data object
 */
export const generateDummyWalletData = (type, nationalId, userId) => {
  const now = Date.now();

  // Base wallet data
  const walletData = {
    userId,
    nationalId,
    type,
    balance:
      type === "personal"
        ? parseFloat((500 + Math.random() * 4500).toFixed(2)) // 500-5000 SAR
        : parseFloat((10000 + Math.random() * 90000).toFixed(2)), // 10000-100000 SAR
    currency: "SAR",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  // Add business-specific data
  if (type === "business") {
    const companyNames = [
      { ar: "شركة العتيبي للتجارة", en: "Al-Otaibi Trading Company" },
      { ar: "مؤسسة الشمري للمقاولات", en: "Al-Shamri Contracting Est." },
      { ar: "شركة الدوسري للتقنية", en: "Al-Dosari Technology Co." },
      { ar: "مؤسسة القحطاني للتجزئة", en: "Al-Qahtani Retail Est." },
      { ar: "شركة الغامدي للخدمات", en: "Al-Ghamdi Services Co." },
    ];

    const industries = [
      "trading",
      "contracting",
      "technology",
      "retail",
      "services",
    ];
    const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة"];

    const randomCompany =
      companyNames[Math.floor(Math.random() * companyNames.length)];
    const randomIndustry =
      industries[Math.floor(Math.random() * industries.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    // Generate random tax number (15 digits starting with 300)
    const taxNumber = `300${Math.floor(
      100000000000 + Math.random() * 900000000000
    )}`;

    // Generate random commercial registration (10 digits)
    const commercialRegistration = `${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}`;

    walletData.businessInfo = {
      companyName: randomCompany.ar,
      companyNameEn: randomCompany.en,
      taxNumber,
      commercialRegistration,
      industry: randomIndustry,
      registeredCity: randomCity,
    };
  }

  return walletData;
};

// Database Functions

/**
 * Checks if user already has wallets created
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<object>} { hasWallets: boolean, wallets: object | null }
 */
export const checkUserWallets = async (userId) => {
  try {
    const userWalletsRef = ref(database, DB_PATHS.USER_WALLETS(userId));
    const snapshot = await get(userWalletsRef);

    if (snapshot.exists()) {
      const wallets = snapshot.val();
      // Check if wallets object has any wallet IDs
      const hasWallets =
        wallets &&
        (wallets.personal || wallets.business) &&
        Object.keys(wallets).length > 0;
      return { hasWallets, wallets };
    }

    return { hasWallets: false, wallets: null };
  } catch (error) {
    console.error("Error checking user wallets:", error);
    return { hasWallets: false, wallets: null };
  }
};

/**
 * Creates personal wallet in Firebase
 * @param {string} userId - Firebase Auth UID
 * @param {string} nationalId - National ID
 * @returns {Promise<object>} Complete wallet object
 */
export const createPersonalWallet = async (userId, nationalId) => {
  try {
    // Generate wallet ID and data
    const walletId = generateWalletId("personal", nationalId);
    const walletData = generateDummyWalletData("personal", nationalId, userId);

    // Write wallet to wallets collection
    const walletRef = ref(database, DB_PATHS.WALLET(walletId));
    await set(walletRef, walletData);

    // Update user's wallets reference
    const userWalletRef = ref(
      database,
      `${DB_PATHS.USER(userId)}/wallets/personal`
    );
    await set(userWalletRef, walletId);

    console.log("Personal wallet created successfully:", walletId);
    return { ...walletData, id: walletId };
  } catch (error) {
    console.error("Error creating personal wallet:", error);
    throw new Error("فشل في إنشاء المحفظة الشخصية");
  }
};

/**
 * Creates business wallet in Firebase
 * @param {string} userId - Firebase Auth UID
 * @param {string} nationalId - National ID
 * @returns {Promise<object>} Complete wallet object with businessInfo
 */
export const createBusinessWallet = async (userId, nationalId) => {
  try {
    // Generate wallet ID and data
    const walletId = generateWalletId("business", nationalId);
    const walletData = generateDummyWalletData("business", nationalId, userId);

    // Write wallet to wallets collection
    const walletRef = ref(database, DB_PATHS.WALLET(walletId));
    await set(walletRef, walletData);

    // Update user's wallets reference
    const userWalletRef = ref(
      database,
      `${DB_PATHS.USER(userId)}/wallets/business`
    );
    await set(userWalletRef, walletId);

    console.log("Business wallet created successfully:", walletId);
    return { ...walletData, id: walletId };
  } catch (error) {
    console.error("Error creating business wallet:", error);
    throw new Error("فشل في إنشاء محفظة الأعمال");
  }
};

/**
 * Fetches wallet data by wallet ID
 * @param {string} walletId - Wallet ID
 * @returns {Promise<object>} Wallet data or null
 */
export const getWalletById = async (walletId) => {
  try {
    const walletRef = ref(database, DB_PATHS.WALLET(walletId));
    const snapshot = await get(walletRef);

    if (snapshot.exists()) {
      return { ...snapshot.val(), id: walletId };
    }

    return null;
  } catch (error) {
    console.error("Error getting wallet by ID:", error);
    throw new Error("فشل في جلب بيانات المحفظة");
  }
};

/**
 * Fetches all user's wallet IDs and data
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<object>} { personal: object | null, business: object | null }
 */
export const getWalletsByUserId = async (userId) => {
  try {
    // Get wallet IDs from user document
    const userWalletsRef = ref(database, DB_PATHS.USER_WALLETS(userId));
    const snapshot = await get(userWalletsRef);

    if (!snapshot.exists()) {
      return { personal: null, business: null };
    }

    const walletIds = snapshot.val();
    const result = { personal: null, business: null };

    // Fetch personal wallet if it exists
    if (walletIds.personal) {
      try {
        result.personal = await getWalletById(walletIds.personal);
      } catch (error) {
        console.error("Error fetching personal wallet:", error);
      }
    }

    // Fetch business wallet if it exists
    if (walletIds.business) {
      try {
        result.business = await getWalletById(walletIds.business);
      } catch (error) {
        console.error("Error fetching business wallet:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error getting wallets by user ID:", error);
    throw new Error("فشل في جلب المحافظ");
  }
};

/**
 * Updates wallet balance
 * @param {string} walletId - Wallet ID
 * @param {number} newBalance - New balance amount
 * @returns {Promise<boolean>} Success status
 */
export const updateWalletBalance = async (walletId, newBalance) => {
  try {
    const walletRef = ref(database, DB_PATHS.WALLET(walletId));
    await update(walletRef, {
      balance: newBalance,
      updatedAt: Date.now(),
    });

    console.log("Wallet balance updated successfully:", walletId);
    return true;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw new Error("فشل في تحديث رصيد المحفظة");
  }
};

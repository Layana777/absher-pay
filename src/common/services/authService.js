import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  ref,
  set,
  get,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { auth, database } from "./firebase";
import { DB_PATHS } from "./firebase/databasePaths";

// Validation Functions

/**
 * Validates National ID format
 * @param {string} nationalId - The national ID to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateNationalId = (nationalId) => {
  if (!nationalId || nationalId.trim() === "") {
    return { isValid: false, error: "الرجاء إدخال رقم الهوية الوطنية" };
  }

  const trimmedId = nationalId.trim();

  if (!/^\d+$/.test(trimmedId)) {
    return { isValid: false, error: "رقم الهوية يجب أن يحتوي على أرقام فقط" };
  }

  if (trimmedId.length !== 10) {
    return { isValid: false, error: "رقم الهوية يجب أن يكون 10 أرقام" };
  }

  return { isValid: true, error: null };
};

/**
 * Validates password format
 * @param {string} password - The password to validate
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "الرجاء إدخال كلمة المرور" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    };
  }

  return { isValid: true, error: null };
};

// Helper Functions

/**
 * Converts National ID to synthetic email for Firebase Auth
 * @param {string} nationalId - The national ID
 * @param {boolean} isBusiness - Whether user is business or individual
 * @returns {string} Synthetic email
 */
const nationalIdToEmail = (nationalId, isBusiness = true) => {
  const domain = isBusiness ? "absher.business" : "absher.pay";
  return `${nationalId}@${domain}`;
};

/**
 * Generates random dummy data for new users
 * @param {string} nationalId - The national ID
 * @param {boolean} isBusiness - Whether user is business or individual
 * @returns {object} User data object
 */
export const generateDummyUserData = (nationalId, isBusiness = true) => {
  const firstNames = ["محمد", "أحمد", "عبدالله", "خالد", "سعود"];
  const middleNames = ["بن عبدالله", "بن محمد", "بن أحمد", "بن سعود", "بن فهد"];
  const lastNames = ["العتيبي", "القحطاني", "الدوسري", "الشمري", "الغامدي"];
  const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة"];

  // Generate random phone number
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  const phoneNumber = `+9665${randomDigits}`;

  return {
    nationalId,
    email: nationalIdToEmail(nationalId, isBusiness),
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    middleName: middleNames[Math.floor(Math.random() * middleNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    phoneNumber,
    passCode: "0000",
    isActive: true,
    isBusiness,
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };
};

// Database Functions

/**
 * Gets user data by UID from database
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<object>} User data or null
 */
export const getUserByUid = async (uid) => {
  try {
    const userRef = ref(database, DB_PATHS.USER(uid));
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error("Error getting user by UID:", error);
    throw error;
  }
};

/**
 * Gets user data by National ID from database
 * @param {string} nationalId - National ID
 * @returns {Promise<object>} User data with UID or null
 */
export const getUserByNationalId = async (nationalId) => {
  try {
    const usersRef = ref(database, DB_PATHS.USERS);
    const nationalIdQuery = query(
      usersRef,
      orderByChild("nationalId"),
      equalTo(nationalId)
    );
    const snapshot = await get(nationalIdQuery);

    if (snapshot.exists()) {
      // Get first (and should be only) matching user
      const userData = Object.values(snapshot.val())[0];
      return userData;
    }

    return null;
  } catch (error) {
    console.error("Error getting user by National ID:", error);
    throw error;
  }
};

/**
 * Creates user record in database
 * @param {string} uid - Firebase Auth UID
 * @param {object} userData - User data
 * @returns {Promise<object>} Created user data with UID
 */
const createUserInDatabase = async (uid, userData) => {
  try {
    const userRef = ref(database, DB_PATHS.USER(uid));
    const userDataWithUid = { ...userData, uid };

    await set(userRef, userDataWithUid);

    return userDataWithUid;
  } catch (error) {
    console.error("Error creating user in database:", error);
    throw error;
  }
};

/**
 * Updates last login timestamp for user
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (uid) => {
  try {
    const userRef = ref(database, DB_PATHS.USER(uid));
    await update(userRef, {
      lastLogin: Date.now(),
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    throw error;
  }
};

// Authentication Functions

/**
 * Creates a new user with Firebase Auth and database
 * @param {string} nationalId - National ID (10 digits)
 * @param {string} password - Password
 * @param {boolean} isBusiness - Whether user is business or individual
 * @returns {Promise<object>} { success: boolean, uid: string, user: object, error: string }
 */
export const createUser = async (nationalId, password, isBusiness = true) => {
  try {
    const email = nationalIdToEmail(nationalId, isBusiness);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { uid } = userCredential.user;

    // Generate user data
    const userData = generateDummyUserData(nationalId, isBusiness);

    // Store in database
    const fullUserData = await createUserInDatabase(uid, userData);

    return {
      success: true,
      uid,
      user: fullUserData,
      error: null,
    };
  } catch (error) {
    console.error("Error creating user:", error);

    let errorMessage = "حدث خطأ أثناء إنشاء الحساب";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "هذا الحساب موجود بالفعل";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "كلمة المرور ضعيفة جداً";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "رقم الهوية غير صالح";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "خطأ في الاتصال. يرجى المحاولة مرة أخرى";
    }

    return {
      success: false,
      uid: null,
      user: null,
      error: errorMessage,
    };
  }
};

/**
 * Logs in a user (creates account if doesn't exist)
 * @param {string} nationalId - National ID (10 digits)
 * @param {string} password - Password
 * @param {boolean} isBusiness - Whether user is business or individual
 * @returns {Promise<object>} { success: boolean, uid: string, user: object, error: string }
 */
export const loginUser = async (nationalId, password, isBusiness = true) => {
  try {
    const email = nationalIdToEmail(nationalId, isBusiness);

    // Try to sign in
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (signInError) {
      // Handle sign-in errors - no auto-creation
      if (
        signInError.code === "auth/user-not-found" ||
        signInError.code === "auth/invalid-credential"
      ) {
        return {
          success: false,
          uid: null,
          user: null,
          error: "رقم الهوية أو كلمة المرور غير صحيحة",
        };
      }

      // Handle other sign-in errors
      throw signInError;
    }

    const { uid } = userCredential.user;

    // Update last login
    await updateLastLogin(uid);

    // Get user data from database
    const userData = await getUserByUid(uid);

    if (!userData) {
      // User exists in Auth but not in database - data inconsistency
      return {
        success: false,
        uid: null,
        user: null,
        error: "خطأ في بيانات المستخدم. يرجى الاتصال بالدعم",
      };
    }

    return {
      success: true,
      uid,
      user: userData,
      error: null,
    };
  } catch (error) {
    console.error("Error logging in user:", error);

    let errorMessage = "حدث خطأ أثناء تسجيل الدخول";

    if (error.code === "auth/wrong-password") {
      errorMessage = "رقم الهوية أو كلمة المرور غير صحيحة";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "رقم الهوية غير صالح";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "هذا الحساب معطل";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "خطأ في الاتصال. يرجى المحاولة مرة أخرى";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "محاولات كثيرة جداً. يرجى المحاولة لاحقاً";
    }

    return {
      success: false,
      uid: null,
      user: null,
      error: errorMessage,
    };
  }
};

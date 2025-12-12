/**
 * Seed Users Script
 *
 * This script creates test users in Firebase Authentication and Database.
 *
 * Usage:
 *   node scripts/seedUsers.mjs
 *
 * Configuration:
 *   - Modify the USERS array below to add/change national IDs
 *   - All users will have password: 1122334455
 *   - Set isBusiness: true for business users, false for individual users
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Firebase configuration is missing. Please check your .env file.");
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ============================================================================
// CONFIGURATION - MODIFY THIS SECTION
// ============================================================================

const PASSWORD = "1122334455"; // Same password for all users

// Define users to create
// You can add/modify national IDs here
const USERS = [
  { nationalId: "1102673538", isBusiness: false },

  // Add more users here as needed
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts National ID to synthetic email for Firebase Auth
 */
function nationalIdToEmail(nationalId, isBusiness) {
  const domain = isBusiness ? "absher.business" : "absher.pay";
  return `${nationalId}@${domain}`;
}

/**
 * Generates random dummy data for a user
 */
function generateUserData(nationalId, isBusiness) {
  const firstNames = ["محمد", "أحمد", "عبدالله", "خالد", "سعود"];
  const middleNames = [" عبدالله", " محمد", " أحمد", " سعود", " فهد"];
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
}

/**
 * Creates a user in Firebase Auth and Database
 */
async function createUser(nationalId, isBusiness) {
  try {
    const email = nationalIdToEmail(nationalId, isBusiness);
    const userData = generateUserData(nationalId, isBusiness);

    console.log(
      `\n📝 Creating user: ${nationalId} (${
        isBusiness ? "Business" : "Single"
      })`
    );
    console.log(`   Email: ${email}`);
    console.log(
      `   Name: ${userData.firstName} ${userData.middleName} ${userData.lastName}`
    );
    console.log(`   City: ${userData.city}`);
    console.log(`   Phone: ${userData.phoneNumber}`);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      PASSWORD
    );
    const { uid } = userCredential.user;

    console.log(`   ✅ Auth account created (UID: ${uid})`);

    // Store user data in database
    const userRef = ref(database, `users/${uid}`);
    const userDataWithUid = { ...userData, uid };
    await set(userRef, userDataWithUid);

    console.log(`   ✅ Database record created`);
    console.log(`   ✓ User created successfully!`);

    return { success: true, uid, nationalId };
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`   ⚠️  User already exists, skipping...`);
      return { success: false, error: "already-exists", nationalId };
    } else {
      console.error(`   ❌ Error: ${error.message}`);
      return { success: false, error: error.message, nationalId };
    }
  }
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function seedUsers() {
  console.log("🌱 Starting user seeding process...");
  console.log(`📊 Total users to create: ${USERS.length}`);
  console.log(`🔑 Password for all users: ${PASSWORD}`);
  console.log("=".repeat(60));

  const results = {
    created: 0,
    skipped: 0,
    failed: 0,
    total: USERS.length,
  };

  for (const user of USERS) {
    const result = await createUser(user.nationalId, user.isBusiness);

    if (result.success) {
      results.created++;
    } else if (result.error === "already-exists") {
      results.skipped++;
    } else {
      results.failed++;
    }

    // Small delay between user creations to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📈 SEEDING SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Created: ${results.created}`);
  console.log(`⚠️  Skipped (already exist): ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.total}`);
  console.log("=".repeat(60));

  if (results.created > 0) {
    console.log("\n✨ Users successfully seeded to Firebase!");
    console.log(`🔑 Login with any National ID and password: ${PASSWORD}`);
  }

  if (results.failed > 0) {
    console.log("\n⚠️  Some users failed to create. Check errors above.");
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
seedUsers().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});

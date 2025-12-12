/**
 * Seed Government Services Script
 *
 * This script populates Firebase Realtime Database with all Saudi Arabian
 * government services available through Absher Pay.
 *
 * Usage:
 *   node scripts/seedGovernmentServices.mjs
 *
 * Features:
 *   - Seeds all government services with complete data
 *   - Organized by ministry and category
 *   - Includes all sub-types, fees, and processing times
 *   - Can be run multiple times (updates existing data)
 *   - Validates data structure before seeding
 */

import { initializeApp } from "firebase/app";
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
const database = getDatabase(app);

// ============================================================================
// GOVERNMENT SERVICES DATA
// ============================================================================

const GOVERNMENT_SERVICES_DATA = {
  // ========== 1. وزارة الداخلية - جوازات السفر (MOI - Passports) ==========
  passports: {
    nameAr: "جوازات السفر",
    nameEn: "Passports",
    category: "moi_passports",
    icon: "🛂",
    ministry: "MOI",
    ministryName: {
      ar: "وزارة الداخلية",
      en: "Ministry of Interior"
    },
    description: {
      ar: "خدمات إصدار وتجديد جوازات السفر ورخص القيادة",
      en: "Passport issuance, renewal, and driving license services"
    },
    subTypes: {
      issue_new_passport: {
        nameAr: "إصدار جواز سفر جديد",
        nameEn: "Issue New Passport",
        fee: 300.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "5-7 business days",
        icon: "📘",
        description: {
          ar: "إصدار جواز سفر جديد للمواطنين السعوديين",
          en: "Issue new passport for Saudi citizens"
        },
        requiredDocuments: [
          { ar: "صورة شخصية حديثة", en: "Recent photo" },
          { ar: "بطاقة الهوية الوطنية", en: "National ID" }
        ]
      },
      renew_passport: {
        nameAr: "تجديد جواز السفر",
        nameEn: "Renew Passport",
        fee: 300.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "3-5 business days",
        icon: "🔄",
        description: {
          ar: "تجديد جواز السفر المنتهي أو المقارب على الانتهاء",
          en: "Renew expired or expiring passport"
        },
        requiredDocuments: [
          { ar: "جواز السفر القديم", en: "Old passport" },
          { ar: "صورة شخصية حديثة", en: "Recent photo" }
        ]
      },
      issue_driving_license: {
        nameAr: "إصدار رخصة قيادة",
        nameEn: "Issue Driving License",
        fee: 400.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "🪪",
        description: {
          ar: "إصدار رخصة قيادة جديدة بعد اجتياز الاختبار",
          en: "Issue new driving license after passing the test"
        },
        requiredDocuments: [
          { ar: "شهادة اجتياز الاختبار", en: "Test pass certificate" },
          { ar: "الفحص الطبي", en: "Medical examination" }
        ]
      },
      renew_driving_license: {
        nameAr: "تجديد رخصة القيادة",
        nameEn: "Renew Driving License",
        fee: 200.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "🔄",
        description: {
          ar: "تجديد رخصة القيادة المنتهية",
          en: "Renew expired driving license"
        },
        requiredDocuments: [
          { ar: "رخصة القيادة القديمة", en: "Old driving license" },
          { ar: "الفحص الطبي", en: "Medical examination" }
        ]
      }
    }
  },

  // ========== 2. وزارة الداخلية - المرور (MOI - Traffic) ==========
  traffic: {
    nameAr: "إدارة المرور",
    nameEn: "Traffic Department",
    category: "moi_traffic",
    icon: "🚦",
    ministry: "MOI",
    ministryName: {
      ar: "وزارة الداخلية",
      en: "Ministry of Interior"
    },
    description: {
      ar: "خدمات المرور والمخالفات المرورية وتسجيل المركبات",
      en: "Traffic services, violations, and vehicle registration"
    },
    subTypes: {
      traffic_violations: {
        nameAr: "المخالفات المرورية",
        nameEn: "Traffic Violations",
        fee: 0,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "🚨",
        description: {
          ar: "دفع المخالفات المرورية",
          en: "Pay traffic violations"
        },
        violations: {
          speeding_minor: {
            nameAr: "تجاوز السرعة (بسيط)",
            nameEn: "Minor Speeding",
            fee: 150.00,
            speedRange: { ar: "أقل من 20 كم/س", en: "Less than 20 km/h over" }
          },
          speeding_major: {
            nameAr: "تجاوز السرعة (كبير)",
            nameEn: "Major Speeding",
            fee: 500.00,
            speedRange: { ar: "أكثر من 30 كم/س", en: "More than 30 km/h over" }
          },
          red_light: {
            nameAr: "تجاوز الإشارة الحمراء",
            nameEn: "Red Light Violation",
            fee: 300.00
          },
          no_seatbelt: {
            nameAr: "عدم ربط حزام الأمان",
            nameEn: "No Seatbelt",
            fee: 150.00
          },
          parking_violation: {
            nameAr: "مخالفة وقوف",
            nameEn: "Parking Violation",
            fee: 100.00
          },
          using_phone: {
            nameAr: "استخدام الجوال أثناء القيادة",
            nameEn: "Using Phone While Driving",
            fee: 500.00
          }
        }
      },
      vehicle_registration_renewal: {
        nameAr: "تجديد استمارة المركبة",
        nameEn: "Vehicle Registration Renewal",
        fee: 150.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "🚙",
        description: {
          ar: "تجديد استمارة تسجيل المركبة السنوية",
          en: "Renew annual vehicle registration"
        },
        requiredDocuments: [
          { ar: "الاستمارة القديمة", en: "Old registration" },
          { ar: "شهادة الفحص الدوري", en: "Periodic inspection certificate" },
          { ar: "شهادة التأمين", en: "Insurance certificate" }
        ]
      },
      periodic_inspection: {
        nameAr: "الفحص الدوري للمركبة",
        nameEn: "Periodic Vehicle Inspection",
        fee: 50.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "same day",
        icon: "🔧",
        description: {
          ar: "فحص دوري للمركبة للتأكد من سلامتها",
          en: "Periodic vehicle safety inspection"
        }
      }
    }
  },

  // ========== 3. وزارة الداخلية - الأحوال المدنية (MOI - Civil Affairs) ==========
  civil_affairs: {
    nameAr: "الأحوال المدنية",
    nameEn: "Civil Affairs",
    category: "moi_civil_affairs",
    icon: "📋",
    ministry: "MOI",
    ministryName: {
      ar: "وزارة الداخلية",
      en: "Ministry of Interior"
    },
    description: {
      ar: "خدمات الهوية الوطنية والوثائق المدنية",
      en: "National ID and civil documentation services"
    },
    subTypes: {
      issue_national_id: {
        nameAr: "إصدار بطاقة هوية وطنية",
        nameEn: "Issue National ID",
        fee: 100.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "3-5 business days",
        icon: "🆔",
        description: {
          ar: "إصدار بطاقة الهوية الوطنية للمواطنين",
          en: "Issue national ID card for citizens"
        },
        requiredDocuments: [
          { ar: "صورة شخصية", en: "Personal photo" },
          { ar: "شهادة الميلاد", en: "Birth certificate" }
        ]
      },
      renew_national_id: {
        nameAr: "تجديد بطاقة الهوية الوطنية",
        nameEn: "Renew National ID",
        fee: 100.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "3-5 business days",
        icon: "🔄",
        description: {
          ar: "تجديد بطاقة الهوية الوطنية المنتهية",
          en: "Renew expired national ID card"
        },
        requiredDocuments: [
          { ar: "البطاقة القديمة", en: "Old ID card" },
          { ar: "صورة شخصية حديثة", en: "Recent photo" }
        ]
      },
      birth_certificate: {
        nameAr: "شهادة ميلاد",
        nameEn: "Birth Certificate",
        fee: 50.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "👶",
        description: {
          ar: "استخراج شهادة ميلاد",
          en: "Obtain birth certificate"
        },
        requiredDocuments: [
          { ar: "تقرير المستشفى", en: "Hospital report" }
        ]
      },
      family_book: {
        nameAr: "دفتر العائلة",
        nameEn: "Family Book",
        fee: 100.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "1-2 business days",
        icon: "👨‍👩‍👧‍👦",
        description: {
          ar: "إصدار أو تحديث دفتر العائلة",
          en: "Issue or update family book"
        },
        requiredDocuments: [
          { ar: "عقد الزواج", en: "Marriage certificate" },
          { ar: "شهادات ميلاد الأبناء", en: "Children's birth certificates" }
        ]
      },
      marriage_certificate: {
        nameAr: "عقد النكاح",
        nameEn: "Marriage Certificate",
        fee: 50.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "💍",
        description: {
          ar: "توثيق عقد النكاح",
          en: "Marriage contract documentation"
        }
      },
      issue_iqama: {
        nameAr: "إصدار إقامة",
        nameEn: "Issue Iqama",
        fee: 2000.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "5-7 business days",
        icon: "🆕",
        description: {
          ar: "إصدار إقامة جديدة للعمالة الوافدة",
          en: "Issue new iqama for expatriate workers"
        },
        requiredDocuments: [
          { ar: "جواز السفر", en: "Passport" },
          { ar: "عقد العمل", en: "Work contract" },
          { ar: "الفحص الطبي", en: "Medical examination" }
        ]
      },
      renew_iqama: {
        nameAr: "تجديد الإقامة",
        nameEn: "Renew Iqama",
        fee: 2000.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "1-3 business days",
        icon: "🔄",
        description: {
          ar: "تجديد الإقامة المنتهية أو المقاربة على الانتهاء",
          en: "Renew expired or expiring iqama"
        },
        requiredDocuments: [
          { ar: "الإقامة القديمة", en: "Old iqama" },
          { ar: "جواز السفر ساري", en: "Valid passport" }
        ]
      },
      exit_reentry_visa: {
        nameAr: "تأشيرة خروج وعودة",
        nameEn: "Exit Re-entry Visa",
        fee: 200.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "instant",
        icon: "🛫",
        description: {
          ar: "إصدار تأشيرة خروج وعودة للعامل الوافد",
          en: "Issue exit re-entry visa for expatriate worker"
        },
        variations: {
          single: {
            nameAr: "خروج وعودة (مرة واحدة)",
            nameEn: "Exit Re-entry (Single)",
            fee: 200.00,
            validity: "2 months"
          },
          multiple: {
            nameAr: "خروج وعودة (متعددة)",
            nameEn: "Exit Re-entry (Multiple)",
            fee: 500.00,
            validity: "6 months"
          }
        }
      }
    }
  },

  // ========== 4. وزارة التجارة (MOC - Ministry of Commerce) ==========
  commerce: {
    nameAr: "وزارة التجارة",
    nameEn: "Ministry of Commerce",
    category: "moc",
    icon: "🏢",
    ministry: "MOC",
    ministryName: {
      ar: "وزارة التجارة",
      en: "Ministry of Commerce"
    },
    description: {
      ar: "خدمات السجل التجاري والتراخيص التجارية",
      en: "Commercial registration and business licensing services"
    },
    subTypes: {
      commercial_registration: {
        nameAr: "السجل التجاري",
        nameEn: "Commercial Registration",
        fee: 200.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "1-3 business days",
        icon: "📜",
        description: {
          ar: "إصدار أو تجديد السجل التجاري",
          en: "Issue or renew commercial registration"
        },
        requiredDocuments: [
          { ar: "الهوية الوطنية", en: "National ID" },
          { ar: "عقد التأسيس", en: "Establishment contract" }
        ]
      },
      renew_commercial_registration: {
        nameAr: "تجديد السجل التجاري",
        nameEn: "Renew Commercial Registration",
        fee: 200.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "instant",
        icon: "🔄",
        description: {
          ar: "تجديد السجل التجاري السنوي",
          en: "Renew annual commercial registration"
        }
      },
      business_license: {
        nameAr: "الرخصة التجارية",
        nameEn: "Business License",
        fee: 300.00,
        currency: "SAR",
        availableFor: ["business"],
        processingTime: "2-5 business days",
        icon: "📋",
        description: {
          ar: "إصدار رخصة تجارية جديدة",
          en: "Issue new business license"
        }
      }
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates the government services data structure
 */
function validateData() {
  console.log("🔍 Validating data structure...");

  let isValid = true;
  const requiredFields = ["nameAr", "nameEn", "category", "ministry", "subTypes"];

  Object.entries(GOVERNMENT_SERVICES_DATA).forEach(([serviceId, service]) => {
    requiredFields.forEach((field) => {
      if (!service[field]) {
        console.error(`   ❌ Missing field '${field}' in service '${serviceId}'`);
        isValid = false;
      }
    });

    // Validate sub-types
    if (service.subTypes) {
      Object.entries(service.subTypes).forEach(([subTypeId, subType]) => {
        if (!subType.nameAr || !subType.nameEn || !subType.fee === undefined) {
          console.error(
            `   ❌ Missing required fields in subType '${subTypeId}' of service '${serviceId}'`
          );
          isValid = false;
        }
      });
    }
  });

  if (isValid) {
    console.log("   ✅ Data structure is valid");
  }

  return isValid;
}

/**
 * Seeds a single service to the database
 */
async function seedService(serviceId, serviceData) {
  try {
    const serviceRef = ref(database, `governmentServices/${serviceId}`);

    // Add metadata
    const serviceWithMetadata = {
      ...serviceData,
      id: serviceId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    await set(serviceRef, serviceWithMetadata);

    return { success: true, serviceId };
  } catch (error) {
    console.error(`   ❌ Error seeding service '${serviceId}':`, error.message);
    return { success: false, serviceId, error: error.message };
  }
}

/**
 * Gets statistics about the services
 */
function getStatistics() {
  const stats = {
    totalServices: 0,
    totalSubTypes: 0,
    byMinistry: {},
    byUserType: {
      personal: 0,
      business: 0,
    },
  };

  Object.entries(GOVERNMENT_SERVICES_DATA).forEach(([_, service]) => {
    stats.totalServices++;

    // Count by ministry
    if (!stats.byMinistry[service.ministry]) {
      stats.byMinistry[service.ministry] = 0;
    }
    stats.byMinistry[service.ministry]++;

    // Count sub-types
    if (service.subTypes) {
      const subTypeCount = Object.keys(service.subTypes).length;
      stats.totalSubTypes += subTypeCount;

      // Count by user type
      Object.values(service.subTypes).forEach((subType) => {
        if (subType.availableFor.includes("personal")) {
          stats.byUserType.personal++;
        }
        if (subType.availableFor.includes("business")) {
          stats.byUserType.business++;
        }
      });
    }
  });

  return stats;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function seedGovernmentServices() {
  console.log("🌱 Starting Government Services seeding process...");
  console.log("=".repeat(70));

  // Validate data structure
  if (!validateData()) {
    console.error("\n💥 Data validation failed. Please fix errors and try again.");
    process.exit(1);
  }

  // Show statistics
  const stats = getStatistics();
  console.log("\n📊 DATA STATISTICS");
  console.log("=".repeat(70));
  console.log(`   Total Services: ${stats.totalServices}`);
  console.log(`   Total Sub-types: ${stats.totalSubTypes}`);
  console.log(`   Services by Ministry:`);
  Object.entries(stats.byMinistry).forEach(([ministry, count]) => {
    console.log(`      - ${ministry}: ${count}`);
  });
  console.log(`   Services by User Type:`);
  console.log(`      - Personal: ${stats.byUserType.personal}`);
  console.log(`      - Business: ${stats.byUserType.business}`);
  console.log("=".repeat(70));

  // Seed services
  console.log("\n🌱 Seeding services to Firebase...\n");

  const results = {
    seeded: 0,
    failed: 0,
    total: stats.totalServices,
  };

  for (const [serviceId, serviceData] of Object.entries(GOVERNMENT_SERVICES_DATA)) {
    console.log(`📝 Seeding: ${serviceData.nameEn} (${serviceId})`);

    const result = await seedService(serviceId, serviceData);

    if (result.success) {
      results.seeded++;
      console.log(`   ✅ Successfully seeded`);
    } else {
      results.failed++;
      console.log(`   ❌ Failed to seed`);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("📈 SEEDING SUMMARY");
  console.log("=".repeat(70));
  console.log(`✅ Seeded: ${results.seeded}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.total}`);
  console.log("=".repeat(70));

  if (results.seeded > 0) {
    console.log("\n✨ Government services successfully seeded to Firebase!");
    console.log("🔍 Check Firebase Console to verify the data.");
  }

  if (results.failed > 0) {
    console.log("\n⚠️  Some services failed to seed. Check errors above.");
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
seedGovernmentServices().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});

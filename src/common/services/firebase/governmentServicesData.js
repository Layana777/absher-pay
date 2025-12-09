/**
 * Government Services Data Structure
 *
 * This file contains all Saudi Arabian government services available through Absher Pay.
 * Services are organized by ministry and category for easy management and expansion.
 *
 * Structure:
 * - Each service has a unique ID, names in Arabic and English
 * - Services are categorized by ministry
 * - Each service has multiple sub-types (specific service operations)
 * - Sub-types include fees, processing time, and availability
 */

export const GOVERNMENT_SERVICES_DATA = {
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
        fee: 0, // Variable based on violation type
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

/**
 * Helper function to get all service categories
 */
export const getServiceCategories = () => {
  return Object.keys(GOVERNMENT_SERVICES_DATA);
};

/**
 * Helper function to get services by ministry
 */
export const getServicesByMinistry = (ministry) => {
  return Object.entries(GOVERNMENT_SERVICES_DATA)
    .filter(([_, service]) => service.ministry === ministry)
    .reduce((acc, [key, service]) => {
      acc[key] = service;
      return acc;
    }, {});
};

/**
 * Helper function to get services available for specific user type
 */
export const getServicesForUserType = (userType) => {
  const result = {};

  Object.entries(GOVERNMENT_SERVICES_DATA).forEach(([serviceKey, service]) => {
    const filteredSubTypes = {};

    Object.entries(service.subTypes).forEach(([subTypeKey, subType]) => {
      if (subType.availableFor.includes(userType)) {
        filteredSubTypes[subTypeKey] = subType;
      }
    });

    if (Object.keys(filteredSubTypes).length > 0) {
      result[serviceKey] = {
        ...service,
        subTypes: filteredSubTypes
      };
    }
  });

  return result;
};

/**
 * List of all ministries
 */
export const MINISTRIES = {
  MOI: {
    code: "MOI",
    nameAr: "وزارة الداخلية",
    nameEn: "Ministry of Interior",
    icon: "🏛️"
  },
  MOC: {
    code: "MOC",
    nameAr: "وزارة التجارة",
    nameEn: "Ministry of Commerce",
    icon: "🏢"
  }
};

export default GOVERNMENT_SERVICES_DATA;

import { ref, set, get, update, remove, push } from "firebase/database";
import { database } from "./firebase";

/**
 * قاعدة بيانات رموز البنوك السعودية (IBAN Bank Codes)
 */
const SAUDI_BANK_CODES = {
  '80': 'مصرف الراجحي',
  '10': 'البنك الأهلي التجاري',
  '20': 'بنك الرياض',
  '30': 'بنك الجزيرة',
  '40': 'بنك البلاد',
  '35': 'بنك الإنماء',
  '50': 'البنك العربي الوطني',
  '60': 'البنك السعودي البريطاني (ساب)',
  '05': 'البنك السعودي الفرنسي',
  '15': 'بنك الاستثمار',
  '45': 'البنك السعودي الهولندي',
  '55': 'بنك الخليج الدولي',
  '65': 'البنك الأول',
  '71': 'بنك الإمارات دبي الوطني',
  '75': 'بنك الكويت الوطني',
  '76': 'بنك مسقط',
  '85': 'بنك قطر الوطني الأهلي'
};

/**
 * استخراج اسم البنك من رقم البطاقة أو IBAN
 * @param {string} cardNumber - رقم البطاقة الكامل (16 رقم) أو IBAN
 * @returns {string} اسم البنك
 */
export const getBankNameFromCard = (cardNumber) => {
  if (!cardNumber) return 'بنك غير محدد';

  const cleanNumber = cardNumber.replace(/\s/g, '').toUpperCase();

  // التحقق إذا كان IBAN سعودي (يبدأ بـ SA)
  if (cleanNumber.startsWith('SA')) {
    // استخراج رمز البنك (4 أرقام بعد SA02 أو SA03)
    // مثال: SA0380000000608010167519
    //        ^^||-- رمز البنك (80)
    const bankCode = cleanNumber.substring(4, 6);
    const bankName = SAUDI_BANK_CODES[bankCode];

    if (bankName) {
      return bankName;
    }
  }

  // إذا كان رقم بطاقة عادي
  // BIN Database - الأرقام الأولى تحدد البنك
  // هذا مثال بسيط - في الإنتاج استخدم API متخصص
  if (cleanNumber.startsWith('4')) return 'بنك غير محدد (Visa)';
  if (cleanNumber.startsWith('5')) return 'بنك غير محدد (Mastercard)';
  if (cleanNumber.startsWith('9')) return 'مصرف الراجحي';
  if (cleanNumber.startsWith('6')) return 'بنك غير محدد (Discover)';

  return 'بنك غير محدد';
};

/**
 * خدمة إدارة البطاقات البنكية في Firebase
 *
 * هيكل البيانات في Firebase:
 * users/
 *   {uid}/
 *     cards/
 *       {cardId}/
 *         id: string
 *         cardNumber: string (آخر 4 أرقام فقط)
 *         bankName: string
 *         cardType: string (mada, visa, mastercard)
 *         type: string (مدى, فيزا, ماستركارد)
 *         holderName: string
 *         expiryDate: string (MM/YY)
 *         isDefault: boolean
 *         createdAt: timestamp
 *         updatedAt: timestamp
 */

/**
 * حفظ بطاقة جديدة للمستخدم
 * @param {string} uid - معرف المستخدم
 * @param {object} cardData - بيانات البطاقة
 * @returns {Promise<object>} نتيجة الحفظ
 */
export const saveCard = async (uid, cardData) => {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'معرف المستخدم مطلوب'
      };
    }

    // التحقق من البيانات المطلوبة
    if (!cardData.cardNumber || !cardData.bankName) {
      return {
        success: false,
        message: 'بيانات البطاقة غير مكتملة'
      };
    }

    // إنشاء مرجع جديد للبطاقة
    const cardsRef = ref(database, `users/${uid}/cards`);
    const newCardRef = push(cardsRef);
    const cardId = newCardRef.key;

    // تحضير بيانات البطاقة
    const timestamp = Date.now();
    const card = {
      id: cardId,
      userId: uid,
      cardNumber: cardData.cardNumber, // آخر 4 أرقام فقط
      bankName: cardData.bankName,
      cardType: cardData.cardType || 'mada',
      type: cardData.type || 'مدى',
      holderName: cardData.holderName || '',
      expiryDate: cardData.expiryDate || '',
      isDefault: cardData.isDefault || false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // حفظ البطاقة
    await set(newCardRef, card);

    console.log('✅ Card saved successfully:', cardId);

    return {
      success: true,
      message: 'تم حفظ البطاقة بنجاح',
      cardId: cardId,
      data: card
    };
  } catch (error) {
    console.error('❌ Error saving card:', error);
    return {
      success: false,
      message: 'حدث خطأ في حفظ البطاقة',
      error: error.message
    };
  }
};

/**
 * جلب جميع بطاقات المستخدم
 * @param {string} uid - معرف المستخدم
 * @returns {Promise<object>} قائمة البطاقات
 */
export const getUserCards = async (uid) => {
  try {
    if (!uid) {
      return {
        success: false,
        message: 'معرف المستخدم مطلوب',
        data: []
      };
    }

    const cardsRef = ref(database, `users/${uid}/cards`);
    const snapshot = await get(cardsRef);

    if (snapshot.exists()) {
      const cardsObj = snapshot.val();
      const cards = Object.values(cardsObj);

      // ترتيب البطاقات: البطاقة الافتراضية أولاً، ثم حسب تاريخ الإنشاء
      cards.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt - a.createdAt;
      });

      console.log(`✅ Fetched ${cards.length} cards for user:`, uid);

      return {
        success: true,
        message: 'تم جلب البطاقات بنجاح',
        data: cards
      };
    }

    return {
      success: true,
      message: 'لا توجد بطاقات محفوظة',
      data: []
    };
  } catch (error) {
    console.error('❌ Error fetching cards:', error);
    return {
      success: false,
      message: 'حدث خطأ في جلب البطاقات',
      data: [],
      error: error.message
    };
  }
};

/**
 * جلب بطاقة واحدة حسب المعرف
 * @param {string} uid - معرف المستخدم
 * @param {string} cardId - معرف البطاقة
 * @returns {Promise<object>} بيانات البطاقة
 */
export const getCardById = async (uid, cardId) => {
  try {
    if (!uid || !cardId) {
      return {
        success: false,
        message: 'معرف المستخدم والبطاقة مطلوبان',
        data: null
      };
    }

    const cardRef = ref(database, `users/${uid}/cards/${cardId}`);
    const snapshot = await get(cardRef);

    if (snapshot.exists()) {
      return {
        success: true,
        message: 'تم جلب البطاقة بنجاح',
        data: snapshot.val()
      };
    }

    return {
      success: false,
      message: 'البطاقة غير موجودة',
      data: null
    };
  } catch (error) {
    console.error('❌ Error fetching card:', error);
    return {
      success: false,
      message: 'حدث خطأ في جلب البطاقة',
      data: null,
      error: error.message
    };
  }
};

/**
 * تحديث بطاقة
 * @param {string} uid - معرف المستخدم
 * @param {string} cardId - معرف البطاقة
 * @param {object} updates - التحديثات
 * @returns {Promise<object>} نتيجة التحديث
 */
export const updateCard = async (uid, cardId, updates) => {
  try {
    if (!uid || !cardId) {
      return {
        success: false,
        message: 'معرف المستخدم والبطاقة مطلوبان'
      };
    }

    const cardRef = ref(database, `users/${uid}/cards/${cardId}`);

    // التحقق من وجود البطاقة
    const snapshot = await get(cardRef);
    if (!snapshot.exists()) {
      return {
        success: false,
        message: 'البطاقة غير موجودة'
      };
    }

    // تحديث البطاقة
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };

    await update(cardRef, updateData);

    console.log('✅ Card updated successfully:', cardId);

    return {
      success: true,
      message: 'تم تحديث البطاقة بنجاح',
      data: { cardId, ...updateData }
    };
  } catch (error) {
    console.error('❌ Error updating card:', error);
    return {
      success: false,
      message: 'حدث خطأ في تحديث البطاقة',
      error: error.message
    };
  }
};

/**
 * حذف بطاقة
 * @param {string} uid - معرف المستخدم
 * @param {string} cardId - معرف البطاقة
 * @returns {Promise<object>} نتيجة الحذف
 */
export const deleteCard = async (uid, cardId) => {
  try {
    if (!uid || !cardId) {
      return {
        success: false,
        message: 'معرف المستخدم والبطاقة مطلوبان'
      };
    }

    const cardRef = ref(database, `users/${uid}/cards/${cardId}`);

    // التحقق من وجود البطاقة
    const snapshot = await get(cardRef);
    if (!snapshot.exists()) {
      return {
        success: false,
        message: 'البطاقة غير موجودة'
      };
    }

    // حذف البطاقة
    await remove(cardRef);

    console.log('✅ Card deleted successfully:', cardId);

    return {
      success: true,
      message: 'تم حذف البطاقة بنجاح',
      data: { cardId }
    };
  } catch (error) {
    console.error('❌ Error deleting card:', error);
    return {
      success: false,
      message: 'حدث خطأ في حذف البطاقة',
      error: error.message
    };
  }
};

/**
 * تعيين بطاقة كبطاقة افتراضية
 * @param {string} uid - معرف المستخدم
 * @param {string} cardId - معرف البطاقة
 * @returns {Promise<object>} نتيجة التعيين
 */
export const setDefaultCard = async (uid, cardId) => {
  try {
    if (!uid || !cardId) {
      return {
        success: false,
        message: 'معرف المستخدم والبطاقة مطلوبان'
      };
    }

    // جلب جميع البطاقات
    const result = await getUserCards(uid);

    if (!result.success) {
      return result;
    }

    const cards = result.data;

    // تحديث جميع البطاقات: تعيين isDefault إلى false ما عدا البطاقة المحددة
    const updatePromises = cards.map((card) => {
      const isDefault = card.id === cardId;
      return updateCard(uid, card.id, { isDefault });
    });

    await Promise.all(updatePromises);

    console.log('✅ Default card updated:', cardId);

    return {
      success: true,
      message: 'تم تعيين البطاقة كبطاقة افتراضية',
      data: { defaultCardId: cardId }
    };
  } catch (error) {
    console.error('❌ Error setting default card:', error);
    return {
      success: false,
      message: 'حدث خطأ في تعيين البطاقة الافتراضية',
      error: error.message
    };
  }
};

/**
 * جلب البطاقة الافتراضية
 * @param {string} uid - معرف المستخدم
 * @returns {Promise<object>} البطاقة الافتراضية
 */
export const getDefaultCard = async (uid) => {
  try {
    const result = await getUserCards(uid);

    if (!result.success || result.data.length === 0) {
      return {
        success: false,
        message: 'لا توجد بطاقات',
        data: null
      };
    }

    const defaultCard = result.data.find(card => card.isDefault);

    if (!defaultCard) {
      // إذا لم توجد بطاقة افتراضية، اجعل الأولى افتراضية
      return {
        success: true,
        message: 'البطاقة الأولى',
        data: result.data[0]
      };
    }

    return {
      success: true,
      message: 'تم جلب البطاقة الافتراضية',
      data: defaultCard
    };
  } catch (error) {
    console.error('❌ Error fetching default card:', error);
    return {
      success: false,
      message: 'حدث خطأ في جلب البطاقة الافتراضية',
      data: null,
      error: error.message
    };
  }
};

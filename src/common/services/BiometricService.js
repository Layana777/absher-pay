import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { getUserByUid, updateLastLogin } from './authService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const USER_UID_KEY = 'user_uid';
const USER_TYPE_KEY = 'user_type'; // 'single' or 'business'
const USER_NATIONAL_ID_KEY = 'user_national_id';

/**
 * خدمة إدارة تسجيل الدخول بالبصمة
 */
class BiometricService {
  /**
   * التحقق من دعم الجهاز للبصمة
   * @returns {Promise<Object>} معلومات دعم البصمة
   */
  async checkBiometricSupport() {
    try {
      // التحقق من توفر الهاردوير
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        return {
          isSupported: false,
          message: 'الجهاز لا يدعم البصمة أو Face ID'
        };
      }

      // التحقق من تسجيل بصمات في الجهاز
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        return {
          isSupported: false,
          message: 'لا توجد بصمات مسجلة على الجهاز. يرجى تسجيل بصمتك من إعدادات الجهاز'
        };
      }

      // معرفة نوع البصمة المتاحة
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType = 'بصمة';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'بصمة الإصبع';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'بصمة العين';
      }

      return {
        isSupported: true,
        biometricType,
        supportedTypes
      };
    } catch (error) {
      console.error('خطأ في فحص دعم البصمة:', error);
      return {
        isSupported: false,
        message: 'حدث خطأ في التحقق من دعم البصمة'
      };
    }
  }

  /**
   * التحقق من البصمة
   * @param {string} promptMessage رسالة الطلب
   * @returns {Promise<Object>} نتيجة التحقق
   */
  async authenticate(promptMessage = 'يرجى التحقق من هويتك') {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'استخدام كلمة المرور',
        disableDeviceFallback: false,
        cancelLabel: 'إلغاء'
      });

      if (result.success) {
        return {
          success: true,
          message: 'تم التحقق بنجاح'
        };
      } else {
        return {
          success: false,
          message: 'فشل التحقق من البصمة',
          error: result.error
        };
      }
    } catch (error) {
      console.error('خطأ في التحقق من البصمة:', error);
      return {
        success: false,
        message: 'حدث خطأ في عملية التحقق',
        error
      };
    }
  }

  /**
   * حفظ بيانات المستخدم للدخول بالبصمة
   * @param {string} uid معرف المستخدم
   * @param {string} userType نوع المستخدم ('single' أو 'business')
   * @param {string} nationalId رقم الهوية الوطنية
   * @returns {Promise<Object>} نتيجة الحفظ
   */
  async saveBiometricCredentials(uid, userType = 'single', nationalId = null) {
    try {
      // التحقق من دعم البصمة أولاً
      const support = await this.checkBiometricSupport();
      if (!support.isSupported) {
        return {
          success: false,
          message: support.message
        };
      }

      // التحقق من وجود البيانات المطلوبة
      if (!uid) {
        return {
          success: false,
          message: 'معرف المستخدم مطلوب'
        };
      }

      // جلب بيانات المستخدم من Firebase للتحقق
      const userData = await getUserByUid(uid);
      if (!userData) {
        return {
          success: false,
          message: 'لم يتم العثور على بيانات المستخدم'
        };
      }

      // استخدام رقم الهوية من Firebase إذا لم يتم تمريره
      const userNationalId = nationalId || userData.nationalId;

      if (!userNationalId) {
        return {
          success: false,
          message: 'رقم الهوية الوطنية مطلوب'
        };
      }

      // حفظ البيانات بشكل آمن
      await SecureStore.setItemAsync(USER_UID_KEY, uid);
      await SecureStore.setItemAsync(USER_TYPE_KEY, userType);
      await SecureStore.setItemAsync(USER_NATIONAL_ID_KEY, userNationalId);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

      console.log('تم حفظ بيانات البصمة بنجاح:', { uid, userType, nationalId: userNationalId });

      return {
        success: true,
        message: 'تم تفعيل البصمة بنجاح'
      };
    } catch (error) {
      console.error('خطأ في حفظ بيانات البصمة:', error);
      return {
        success: false,
        message: 'حدث خطأ في حفظ بيانات البصمة',
        error
      };
    }
  }

  /**
   * التحقق من تفعيل البصمة
   * @returns {Promise<boolean>} حالة تفعيل البصمة
   */
  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('خطأ في التحقق من تفعيل البصمة:', error);
      return false;
    }
  }

  /**
   * الحصول على بيانات المستخدم المحفوظة
   * @returns {Promise<Object|null>} بيانات المستخدم أو null
   */
  async getSavedCredentials() {
    try {
      const enabled = await this.isBiometricEnabled();

      if (!enabled) {
        return null;
      }

      const uid = await SecureStore.getItemAsync(USER_UID_KEY);
      const userType = await SecureStore.getItemAsync(USER_TYPE_KEY);
      const nationalId = await SecureStore.getItemAsync(USER_NATIONAL_ID_KEY);

      if (!uid || !userType || !nationalId) {
        console.log('لا توجد بيانات محفوظة كاملة');
        return null;
      }

      return {
        uid,
        userType,
        nationalId
      };
    } catch (error) {
      console.error('خطأ في جلب البيانات المحفوظة:', error);
      return null;
    }
  }

  /**
   * تسجيل الدخول بالبصمة مع Firebase
   * @param {string} promptMessage رسالة الطلب
   * @returns {Promise<Object>} نتيجة تسجيل الدخول
   */
  async loginWithBiometric(promptMessage = 'تسجيل الدخول بالبصمة') {
    try {
      // التحقق من تفعيل البصمة
      const enabled = await this.isBiometricEnabled();

      if (!enabled) {
        return {
          success: false,
          message: 'البصمة غير مفعلة'
        };
      }

      // الحصول على البيانات المحفوظة
      const credentials = await this.getSavedCredentials();

      if (!credentials) {
        return {
          success: false,
          message: 'لا توجد بيانات محفوظة للبصمة'
        };
      }

      // التحقق من البصمة
      const authResult = await this.authenticate(promptMessage);

      if (!authResult.success) {
        return authResult;
      }

      // جلب بيانات المستخدم الكاملة من Firebase
      try {
        const userData = await getUserByUid(credentials.uid);

        if (!userData) {
          // إذا لم يتم العثور على المستخدم في Firebase، احذف البيانات المحلية
          await this.disableBiometric();
          return {
            success: false,
            message: 'لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى'
          };
        }

        // تحديث آخر تسجيل دخول في Firebase
        await updateLastLogin(credentials.uid);

        console.log('تم تسجيل الدخول بالبصمة بنجاح:', {
          uid: credentials.uid,
          nationalId: userData.nationalId
        });

        // إرجاع البيانات الكاملة
        return {
          success: true,
          credentials: {
            uid: credentials.uid,
            userType: credentials.userType,
            nationalId: credentials.nationalId
          },
          userData, // بيانات المستخدم الكاملة من Firebase
          message: 'تم التحقق بنجاح'
        };
      } catch (firebaseError) {
        console.error('خطأ في جلب بيانات Firebase:', firebaseError);
        return {
          success: false,
          message: 'حدث خطأ في الاتصال بالخادم',
          error: firebaseError
        };
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول بالبصمة:', error);
      return {
        success: false,
        message: 'حدث خطأ في تسجيل الدخول',
        error
      };
    }
  }

  /**
   * إلغاء تفعيل البصمة وحذف البيانات المحفوظة
   * @returns {Promise<Object>} نتيجة الإلغاء
   */
  async disableBiometric() {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(USER_UID_KEY);
      await SecureStore.deleteItemAsync(USER_TYPE_KEY);
      await SecureStore.deleteItemAsync(USER_NATIONAL_ID_KEY);

      console.log('تم إلغاء تفعيل البصمة وحذف جميع البيانات المحفوظة');

      return {
        success: true,
        message: 'تم إلغاء تفعيل البصمة بنجاح'
      };
    } catch (error) {
      console.error('خطأ في إلغاء تفعيل البصمة:', error);
      return {
        success: false,
        message: 'حدث خطأ في إلغاء تفعيل البصمة',
        error
      };
    }
  }

  /**
   * تفعيل البصمة (للاستخدام من صفحة الإعدادات)
   * @param {string} uid معرف المستخدم
   * @param {string} userType نوع المستخدم
   * @param {string} nationalId رقم الهوية (اختياري - يتم جلبه من Firebase إذا لم يُمرّر)
   * @returns {Promise<Object>} نتيجة التفعيل
   */
  async enableBiometric(uid, userType, nationalId = null) {
    try {
      // التحقق من البصمة أولاً
      const authResult = await this.authenticate('يرجى التحقق من البصمة لتفعيل الميزة');

      if (!authResult.success) {
        return {
          success: false,
          message: 'يجب التحقق من البصمة لتفعيل الميزة'
        };
      }

      // حفظ البيانات (مع جلب رقم الهوية من Firebase إذا لزم الأمر)
      return await this.saveBiometricCredentials(uid, userType, nationalId);
    } catch (error) {
      console.error('خطأ في تفعيل البصمة:', error);
      return {
        success: false,
        message: 'حدث خطأ في تفعيل البصمة',
        error
      };
    }
  }

  /**
   * عرض رسالة طلب تفعيل البصمة بعد تسجيل الدخول الناجح
   * @param {string} uid معرف المستخدم
   * @param {string} userType نوع المستخدم
   * @param {Function} onAccept دالة عند الموافقة
   * @param {Function} onReject دالة عند الرفض
   * @returns {Promise<Object>} معلومات دعم البصمة
   */
  async promptEnableBiometric(uid, userType, onAccept, onReject) {
    try {
      const support = await this.checkBiometricSupport();

      if (!support.isSupported) {
        console.log('الجهاز لا يدعم البصمة:', support.message);
        return {
          shouldPrompt: false,
          reason: support.message
        };
      }

      // التحقق من أن البصمة غير مفعلة بالفعل
      const alreadyEnabled = await this.isBiometricEnabled();

      if (alreadyEnabled) {
        console.log('البصمة مفعلة بالفعل');
        return {
          shouldPrompt: false,
          reason: 'البصمة مفعلة بالفعل'
        };
      }

      return {
        shouldPrompt: true,
        biometricType: support.biometricType,
        uid,
        userType,
        onAccept,
        onReject
      };
    } catch (error) {
      console.error('خطأ في عرض طلب تفعيل البصمة:', error);
      return {
        shouldPrompt: false,
        reason: 'حدث خطأ',
        error
      };
    }
  }
}

export default new BiometricService();

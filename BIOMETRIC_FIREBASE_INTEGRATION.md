# 🔥 ربط نظام البصمة مع Firebase

## نظرة عامة على التكامل

تم ربط نظام البصمة بالكامل مع Firebase Authentication و Realtime Database للحصول على:
- ✅ تسجيل دخول آمن مع التحقق من Firebase
- ✅ جلب بيانات المستخدم الكاملة من Firebase
- ✅ تحديث آخر تسجيل دخول تلقائياً
- ✅ حذف البيانات المحلية إذا تم حذف المستخدم من Firebase

---

## 📦 البيانات المحفوظة محلياً (SecureStore)

```javascript
{
  biometric_enabled: "true",           // حالة التفعيل
  user_uid: "firebase_uid_here",       // UID من Firebase Auth
  user_type: "single" | "business",    // نوع الحساب
  user_national_id: "1130019514"       // رقم الهوية الوطنية
}
```

### ⚠️ ملاحظة أمنية مهمة:
- **لا يتم حفظ كلمة المرور أبداً** ❌
- **لا يتم حفظ أي بيانات حساسة** ❌
- فقط المعلومات الضرورية للتحقق من Firebase ✅

---

## 🔄 دورة تسجيل الدخول بالبصمة مع Firebase

### 1️⃣ المستخدم يضغط زر البصمة

```javascript
const handleBiometricLogin = async () => {
  // 1. تسجيل الدخول بالبصمة
  const result = await BiometricService.loginWithBiometric(
    "تسجيل الدخول إلى محفظة أبشر"
  );

  // 2. النتيجة تحتوي على:
  {
    success: true,
    credentials: {
      uid: "firebase_uid",
      userType: "single",
      nationalId: "1130019514"
    },
    userData: {
      // بيانات Firebase الكاملة
      nationalId: "1130019514",
      firstName: "محمد",
      lastName: "العتيبي",
      phoneNumber: "+966512345678",
      email: "1130019514@absher.pay",
      // ... المزيد
    }
  }
};
```

### 2️⃣ داخل BiometricService.loginWithBiometric()

```javascript
async loginWithBiometric(promptMessage) {
  // 1. التحقق من تفعيل البصمة
  const enabled = await this.isBiometricEnabled();

  // 2. جلب البيانات المحفوظة محلياً
  const credentials = await this.getSavedCredentials();
  // { uid, userType, nationalId }

  // 3. طلب البصمة من المستخدم
  const authResult = await this.authenticate(promptMessage);

  // 4. جلب البيانات الكاملة من Firebase
  const userData = await getUserByUid(credentials.uid);

  // 5. تحديث آخر تسجيل دخول في Firebase
  await updateLastLogin(credentials.uid);

  // 6. إرجاع كل البيانات
  return {
    success: true,
    credentials: { uid, userType, nationalId },
    userData // من Firebase
  };
}
```

---

## 💾 حفظ البيانات عند تفعيل البصمة

### في شاشات تسجيل الدخول:

```javascript
const handleEnableBiometric = async (uid) => {
  // تمرير رقم الهوية من بيانات تسجيل الدخول
  const nationalId = pendingLoginData?.nationalId;

  const result = await BiometricService.saveBiometricCredentials(
    uid,           // من Firebase Auth
    "business",    // نوع الحساب
    nationalId     // رقم الهوية من Firebase
  );
};
```

### في BiometricService.saveBiometricCredentials():

```javascript
async saveBiometricCredentials(uid, userType, nationalId) {
  // 1. جلب بيانات المستخدم من Firebase للتحقق
  const userData = await getUserByUid(uid);

  if (!userData) {
    return {
      success: false,
      message: 'لم يتم العثور على بيانات المستخدم'
    };
  }

  // 2. استخدام رقم الهوية من Firebase إذا لم يُمرّر
  const userNationalId = nationalId || userData.nationalId;

  // 3. حفظ البيانات بأمان
  await SecureStore.setItemAsync(USER_UID_KEY, uid);
  await SecureStore.setItemAsync(USER_TYPE_KEY, userType);
  await SecureStore.setItemAsync(USER_NATIONAL_ID_KEY, userNationalId);
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

  return { success: true };
}
```

---

## 🔒 الحماية والأمان

### 1. التحقق من وجود المستخدم في Firebase:

```javascript
// في loginWithBiometric()
const userData = await getUserByUid(credentials.uid);

if (!userData) {
  // المستخدم محذوف من Firebase - احذف البيانات المحلية
  await this.disableBiometric();

  return {
    success: false,
    message: 'لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى'
  };
}
```

### 2. تحديث آخر تسجيل دخول:

```javascript
// تحديث تلقائي في Firebase
await updateLastLogin(credentials.uid);

// في Firebase Database:
{
  users: {
    "firebase_uid_here": {
      lastLogin: 1734288000000  // timestamp محدّث
    }
  }
}
```

### 3. حذف البيانات عند تسجيل الخروج:

```javascript
// في SettingsScreen - handleLogout()
const handleLogout = () => {
  Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
    {
      text: "تسجيل الخروج",
      onPress: async () => {
        // حذف بيانات البصمة تلقائياً
        await BiometricService.disableBiometric();

        // تسجيل الخروج من Redux
        dispatch(clearUser());
      }
    }
  ]);
};
```

---

## 📊 هيكل البيانات في Firebase

### Firebase Auth:
```javascript
{
  uid: "abc123xyz",
  email: "1130019514@absher.pay",  // synthetic email
  emailVerified: false
}
```

### Firebase Realtime Database:
```javascript
{
  users: {
    "abc123xyz": {  // UID من Auth
      uid: "abc123xyz",
      nationalId: "1130019514",
      email: "1130019514@absher.pay",
      firstName: "محمد",
      middleName: "بن عبدالله",
      lastName: "العتيبي",
      city: "الرياض",
      phoneNumber: "+966512345678",
      passCode: "0000",
      isActive: true,
      isBusiness: false,
      createdAt: 1734200000000,
      lastLogin: 1734288000000,  // ✅ يُحدّث تلقائياً عند الدخول بالبصمة
      wallets: { ... }
    }
  }
}
```

---

## 🎯 سيناريوهات الاستخدام

### سيناريو 1: تفعيل البصمة لأول مرة

```
1. المستخدم يسجل دخول عادي (رقم هوية + باسورد)
   ↓
2. Firebase Auth يتحقق ويرجع UID
   ↓
3. يتم جلب بيانات المستخدم الكاملة من Firebase Database
   ↓
4. يظهر حوار "هل تريد تفعيل البصمة؟"
   ↓
5. المستخدم يوافق
   ↓
6. يتم التحقق من البصمة
   ↓
7. يتم حفظ في SecureStore:
   - UID
   - userType
   - nationalId  ← من Firebase
   ↓
8. البصمة مفعلة ✅
```

### سيناريو 2: تسجيل دخول بالبصمة

```
1. المستخدم يفتح التطبيق
   ↓
2. يضغط زر "الدخول بالبصمة"
   ↓
3. يتم جلب البيانات من SecureStore:
   { uid, userType, nationalId }
   ↓
4. طلب البصمة من المستخدم
   ↓
5. بعد التحقق: جلب البيانات الكاملة من Firebase:
   getUserByUid(uid) ← بيانات كاملة
   ↓
6. تحديث lastLogin في Firebase
   ↓
7. الانتقال للتطبيق مع البيانات الكاملة ✅
```

### سيناريو 3: المستخدم محذوف من Firebase

```
1. المستخدم يضغط زر البصمة
   ↓
2. جلب البيانات من SecureStore
   ↓
3. التحقق من البصمة ✅
   ↓
4. محاولة جلب البيانات من Firebase:
   getUserByUid(uid) → null ❌
   ↓
5. حذف البيانات المحلية تلقائياً:
   disableBiometric()
   ↓
6. عرض رسالة: "لم يتم العثور على بيانات المستخدم"
   ↓
7. المستخدم يحتاج تسجيل دخول عادي مرة أخرى
```

---

## 🔧 الدوال المستخدمة من authService.js

### 1. getUserByUid()
```javascript
// جلب بيانات المستخدم الكاملة
const userData = await getUserByUid(uid);

// الإرجاع:
{
  nationalId: "1130019514",
  firstName: "محمد",
  lastName: "العتيبي",
  phoneNumber: "+966512345678",
  email: "1130019514@absher.pay",
  isBusiness: false,
  // ... المزيد
}
```

### 2. updateLastLogin()
```javascript
// تحديث آخر تسجيل دخول
await updateLastLogin(uid);

// يحدّث في Firebase:
users/uid/lastLogin = Date.now()
```

---

## ✅ الفوائد من التكامل مع Firebase

1. **التحقق المزدوج:**
   - البصمة المحلية ✅
   - بيانات Firebase ✅

2. **المزامنة التلقائية:**
   - lastLogin يُحدّث تلقائياً
   - البيانات دائماً محدّثة

3. **الأمان:**
   - حذف تلقائي إذا حُذف المستخدم من Firebase
   - لا توجد بيانات قديمة

4. **تجربة مستخدم أفضل:**
   - بيانات كاملة فوراً
   - لا حاجة لطلبات إضافية

---

## 🧪 الاختبار

### اختبر التكامل:

```javascript
// 1. سجل دخول عادي
// 2. فعّل البصمة
// 3. سجل خروج
// 4. افتح التطبيق واضغط زر البصمة
// 5. تأكد من:
//    - جلب البيانات من Firebase ✅
//    - تحديث lastLogin ✅
//    - الانتقال للتطبيق مع البيانات الكاملة ✅
```

### اختبر حالة الخطأ:

```javascript
// 1. احذف المستخدم من Firebase Console
// 2. حاول الدخول بالبصمة
// 3. يجب أن:
//    - يحذف البيانات المحلية تلقائياً ✅
//    - يعرض رسالة واضحة ✅
//    - يطلب تسجيل دخول عادي ✅
```

---

## 📝 ملخص التغييرات

### في BiometricService.js:
✅ إضافة `import { getUserByUid, updateLastLogin }`
✅ إضافة `USER_NATIONAL_ID_KEY`
✅ تحديث `saveBiometricCredentials()` - جلب من Firebase
✅ تحديث `getSavedCredentials()` - إرجاع nationalId
✅ تحديث `loginWithBiometric()` - جلب بيانات كاملة من Firebase
✅ تحديث `disableBiometric()` - حذف nationalId أيضاً

### في BusinessLoginScreen.js:
✅ تحديث `handleBiometricLogin()` - استخدام userData من Firebase
✅ تحديث `handleEnableBiometric()` - تمرير nationalId

### في SingleLoginScreen.js:
✅ تحديث `handleBiometricLogin()` - استخدام userData من Firebase
✅ تحديث `handleEnableBiometric()` - تمرير nationalId

---

## 🎉 النتيجة النهائية

نظام بصمة **متكامل بالكامل** مع Firebase:
- ✅ تسجيل دخول آمن
- ✅ بيانات محدّثة دائماً
- ✅ حماية من البيانات القديمة
- ✅ تجربة مستخدم ممتازة
- ✅ كود نظيف وقابل للصيانة

**جاهز للاستخدام! 🚀**

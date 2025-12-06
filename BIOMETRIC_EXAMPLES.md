# أمثلة عملية - نظام البصمة

## 🔍 أمثلة الاستخدام الفعلي

---

## مثال 1: فحص دعم البصمة في صفحة جديدة

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import BiometricService from '../common/services/BiometricService';

const MyNewScreen = () => {
  const [biometricInfo, setBiometricInfo] = useState(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const result = await BiometricService.checkBiometricSupport();

    if (result.isSupported) {
      setBiometricInfo({
        supported: true,
        type: result.biometricType
      });
      console.log('نوع البصمة المتاح:', result.biometricType);
    } else {
      setBiometricInfo({
        supported: false,
        reason: result.message
      });
      Alert.alert('غير مدعوم', result.message);
    }
  };

  return (
    <View>
      {biometricInfo?.supported ? (
        <Text>البصمة مدعومة: {biometricInfo.type}</Text>
      ) : (
        <Text>البصمة غير مدعومة</Text>
      )}
    </View>
  );
};
```

---

## مثال 2: تسجيل دخول سريع بالبصمة

```javascript
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import BiometricService from '../common/services/BiometricService';

const QuickLoginComponent = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async () => {
    setLoading(true);

    try {
      // محاولة تسجيل الدخول بالبصمة
      const result = await BiometricService.loginWithBiometric(
        'تسجيل الدخول السريع'
      );

      if (result.success) {
        // البيانات موجودة والتحقق نجح
        const { uid, userType } = result.credentials;

        // الانتقال للصفحة المناسبة
        if (userType === 'business') {
          navigation.navigate('BusinessHome', { uid });
        } else {
          navigation.navigate('SingleHome', { uid });
        }
      } else {
        // فشل التحقق أو البصمة غير مفعلة
        Alert.alert('فشل', result.message);
      }
    } catch (error) {
      console.error('خطأ:', error);
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title="دخول سريع بالبصمة"
      onPress={handleQuickLogin}
      disabled={loading}
    />
  );
};
```

---

## مثال 3: التحقق من البصمة قبل عملية حساسة

```javascript
import React from 'react';
import { Button, Alert } from 'react-native';
import BiometricService from '../common/services/BiometricService';

const SensitiveActionComponent = () => {
  const performSensitiveAction = async () => {
    // التحقق من البصمة قبل تنفيذ عملية حساسة
    const authResult = await BiometricService.authenticate(
      'يرجى التحقق من هويتك لإتمام التحويل'
    );

    if (authResult.success) {
      // المستخدم تحقق بنجاح، نفذ العملية
      await processPayment();
      Alert.alert('نجح', 'تم إتمام التحويل بنجاح');
    } else {
      // فشل التحقق
      Alert.alert('فشل', 'يجب التحقق من هويتك أولاً');
    }
  };

  const processPayment = async () => {
    // كود معالجة الدفع
    console.log('معالجة الدفع...');
  };

  return (
    <Button
      title="تحويل مبلغ 1000 ريال"
      onPress={performSensitiveAction}
    />
  );
};
```

---

## مثال 4: صفحة إعدادات مخصصة للبصمة

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import BiometricService from '../common/services/BiometricService';

const BiometricSettingsScreen = ({ user }) => {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [bioType, setBioType] = useState('بصمة');

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    // فحص الدعم
    const support = await BiometricService.checkBiometricSupport();
    setSupported(support.isSupported);

    if (support.isSupported) {
      setBioType(support.biometricType);

      // فحص التفعيل
      const isEnabled = await BiometricService.isBiometricEnabled();
      setEnabled(isEnabled);
    }
  };

  const handleToggle = async (value) => {
    if (!supported) {
      Alert.alert('غير متاح', 'الجهاز لا يدعم البصمة');
      return;
    }

    if (value) {
      // تفعيل
      const result = await BiometricService.enableBiometric(
        user.uid,
        user.type
      );

      if (result.success) {
        setEnabled(true);
        Alert.alert('نجح', `تم تفعيل ${bioType}`);
      } else {
        Alert.alert('فشل', result.message);
      }
    } else {
      // إلغاء
      Alert.alert(
        'تأكيد',
        `هل تريد إلغاء تفعيل ${bioType}؟`,
        [
          { text: 'لا', style: 'cancel' },
          {
            text: 'نعم',
            onPress: async () => {
              const result = await BiometricService.disableBiometric();
              if (result.success) {
                setEnabled(false);
                Alert.alert('تم', `تم إلغاء ${bioType}`);
              }
            }
          }
        ]
      );
    }
  };

  if (!supported) {
    return (
      <View>
        <Text>البصمة غير مدعومة على هذا الجهاز</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>تفعيل {bioType}</Text>
      <Switch
        value={enabled}
        onValueChange={handleToggle}
      />
    </View>
  );
};
```

---

## مثال 5: حوار مخصص للتفعيل

```javascript
import React, { useState } from 'react';
import { Modal, View, Text, Button } from 'react-native';
import BiometricService from '../common/services/BiometricService';

const CustomBiometricPrompt = ({ visible, onClose, userId }) => {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);

    const result = await BiometricService.saveBiometricCredentials(
      userId,
      'single'
    );

    if (result.success) {
      Alert.alert('ممتاز!', 'يمكنك الآن استخدام البصمة');
      onClose(true); // أُبلغ المكون الأب بالنجاح
    } else {
      Alert.alert('خطأ', result.message);
    }

    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>
            🔐 تفعيل البصمة
          </Text>

          <Text style={styles.description}>
            فعّل البصمة الآن للحصول على:
            {'\n'}• دخول سريع للتطبيق
            {'\n'}• أمان إضافي لحسابك
            {'\n'}• راحة أكبر في الاستخدام
          </Text>

          <Button
            title="تفعيل الآن"
            onPress={handleEnable}
            disabled={loading}
          />

          <Button
            title="ربما لاحقاً"
            onPress={() => onClose(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'right'
  }
};
```

---

## مثال 6: Hook مخصص للبصمة

```javascript
import { useState, useEffect } from 'react';
import BiometricService from '../common/services/BiometricService';

// Hook قابل لإعادة الاستخدام
export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('بصمة');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);

    // فحص الدعم
    const support = await BiometricService.checkBiometricSupport();
    setIsSupported(support.isSupported);

    if (support.isSupported) {
      setBiometricType(support.biometricType);

      // فحص التفعيل
      const enabled = await BiometricService.isBiometricEnabled();
      setIsEnabled(enabled);
    }

    setLoading(false);
  };

  const enable = async (uid, userType) => {
    const result = await BiometricService.enableBiometric(uid, userType);
    if (result.success) {
      setIsEnabled(true);
    }
    return result;
  };

  const disable = async () => {
    const result = await BiometricService.disableBiometric();
    if (result.success) {
      setIsEnabled(false);
    }
    return result;
  };

  const login = async (promptMessage) => {
    return await BiometricService.loginWithBiometric(promptMessage);
  };

  return {
    isSupported,
    isEnabled,
    biometricType,
    loading,
    enable,
    disable,
    login,
    refresh: initialize
  };
};

// الاستخدام في مكون:
const MyComponent = () => {
  const {
    isSupported,
    isEnabled,
    biometricType,
    loading,
    login
  } = useBiometric();

  if (loading) return <Text>جاري التحميل...</Text>;

  return (
    <View>
      {isEnabled && (
        <Button
          title={`دخول ب${biometricType}`}
          onPress={() => login('تسجيل الدخول')}
        />
      )}
    </View>
  );
};
```

---

## مثال 7: Context للبصمة على مستوى التطبيق

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import BiometricService from '../common/services/BiometricService';

const BiometricContext = createContext();

export const BiometricProvider = ({ children }) => {
  const [state, setState] = useState({
    isSupported: false,
    isEnabled: false,
    biometricType: 'بصمة',
    loading: true
  });

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    const support = await BiometricService.checkBiometricSupport();

    if (support.isSupported) {
      const enabled = await BiometricService.isBiometricEnabled();

      setState({
        isSupported: true,
        isEnabled: enabled,
        biometricType: support.biometricType,
        loading: false
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const enableBiometric = async (uid, userType) => {
    const result = await BiometricService.enableBiometric(uid, userType);
    if (result.success) {
      setState(prev => ({ ...prev, isEnabled: true }));
    }
    return result;
  };

  const disableBiometric = async () => {
    const result = await BiometricService.disableBiometric();
    if (result.success) {
      setState(prev => ({ ...prev, isEnabled: false }));
    }
    return result;
  };

  return (
    <BiometricContext.Provider
      value={{
        ...state,
        enableBiometric,
        disableBiometric,
        refresh: initializeBiometric
      }}
    >
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometricContext = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometricContext must be used within BiometricProvider');
  }
  return context;
};

// الاستخدام:
// في App.js
<BiometricProvider>
  <Navigation />
</BiometricProvider>

// في أي مكون
const { isEnabled, biometricType } = useBiometricContext();
```

---

## 🎯 نصائح الاستخدام

1. **دائماً تحقق من الدعم أولاً** قبل محاولة استخدام البصمة
2. **اعرض رسائل واضحة** للمستخدم عند الفشل
3. **لا تحفظ كلمات المرور** أبداً - استخدم UID فقط
4. **امنح المستخدم الخيار** - لا تجبره على استخدام البصمة
5. **احذف البيانات** عند تسجيل الخروج

---

## ⚠️ أخطاء شائعة يجب تجنبها

❌ **خطأ:** عدم التحقق من الدعم
```javascript
// خطأ
await BiometricService.authenticate();
```

✅ **صحيح:**
```javascript
const support = await BiometricService.checkBiometricSupport();
if (support.isSupported) {
  await BiometricService.authenticate();
}
```

❌ **خطأ:** حفظ بيانات حساسة
```javascript
// خطأ - لا تفعل هذا!
await SecureStore.setItemAsync('password', password);
```

✅ **صحيح:**
```javascript
// فقط UID
await BiometricService.saveBiometricCredentials(uid, userType);
```

---

**جرب هذه الأمثلة واستمتع بتطبيقك! 🚀**

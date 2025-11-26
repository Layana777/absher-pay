# دليل الألوان - Absher Pay Color Guide

## نظرة عامة | Overview

يستخدم تطبيق Absher Pay نظام ألوان مزدوج لدعم تطبيقين منفصلين:
- **Single (Customer) App**: اللون الأساسي أخضر
- **Business App**: اللون الأساسي أزرق

---

## 🎨 الألوان الأساسية | Primary Colors

### Single (Customer) App - Green
```
Primary Color: #028550
RGB: rgb(2, 133, 80)
```

**الاستخدام:**
- أزرار العميل الأساسية
- روابط وعناصر تفاعلية
- شريط التنقل للعملاء
- أيقونات مميزة

**Tailwind Classes:**
- `bg-single-primary` - اللون الأساسي
- `bg-single-primary-light` - نسخة فاتحة
- `bg-single-primary-dark` - نسخة داكنة
- `text-single-primary` - نص بالون الأساسي

**Shades:**
- 50: `#e6f7f1` (فاتح جداً)
- 100: `#ccefe3`
- 200: `#99dfc7`
- 300: `#66cfab`
- 400: `#33bf8f`
- 500: `#028550` (الأساسي)
- 600: `#026a40`
- 700: `#015030`
- 800: `#013520`
- 900: `#001b10` (داكن جداً)

---

### Business App - Blue
```
Primary Color: #0055aa
RGB: rgb(0, 85, 170)
```

**الاستخدام:**
- أزرار الأعمال الأساسية
- لوحة التحكم
- التقارير والإحصائيات
- عناصر إدارية

**Tailwind Classes:**
- `bg-business-primary` - اللون الأساسي
- `bg-business-primary-light` - نسخة فاتحة
- `bg-business-primary-dark` - نسخة داكنة
- `text-business-primary` - نص بالون الأساسي

**Shades:**
- 50: `#e6f2ff` (فاتح جداً)
- 100: `#cce5ff`
- 200: `#99cbff`
- 300: `#66b1ff`
- 400: `#3397ff`
- 500: `#0055aa` (الأساسي)
- 600: `#004488`
- 700: `#003366`
- 800: `#002244`
- 900: `#001122` (داكن جداً)

---

## 🎨 الألوان الثانوية | Secondary Colors

### Background
```
Color: #f8f8f8
RGB: rgb(248, 248, 248)
```
**Tailwind:** `bg-background`

### Card/Surface
```
Color: #FFFFFF
RGB: rgb(255, 255, 255)
```
**Tailwind:** `bg-card` أو `bg-white`

---

## 🎨 ألوان الحالة | Status Colors

### Success (نجاح)
```
Color: #34C759
```
**Tailwind:** `bg-success`, `text-success`

### Danger (خطر)
```
Color: #FF3B30
```
**Tailwind:** `bg-danger`, `text-danger`

### Warning (تحذير)
```
Color: #FF9500
```
**Tailwind:** `bg-warning`, `text-warning`

### Info (معلومات)
```
Color: #0055aa
```
**Tailwind:** `bg-info`, `text-info`

---

## 🎨 ألوان النص | Text Colors

### Primary Text
```
Color: #000000
```
**Tailwind:** `text-text`

### Secondary Text
```
Color: #8E8E93
```
**Tailwind:** `text-text-secondary`

### Tertiary Text
```
Color: #C7C7CC
```
**Tailwind:** `text-text-tertiary`

---

## 🎨 ألوان الحدود | Border Colors

### Default Border
```
Color: #C6C6C8
```
**Tailwind:** `border-border`

### Light Border
```
Color: #E5E5EA
```
**Tailwind:** `border-border-light`

---

## 📋 أمثلة الاستخدام | Usage Examples

### Customer App Button
```jsx
<Button
  title="إضافة إلى السلة"
  variant="single-primary"
  onPress={handleAddToCart}
/>
```

### Business App Button
```jsx
<Button
  title="حفظ المنتج"
  variant="business-primary"
  onPress={handleSaveProduct}
/>
```

### Default Primary (Customer)
```jsx
<Button
  title="تسجيل الدخول"
  variant="primary"
  onPress={handleLogin}
/>
```

### Using Tailwind Classes
```jsx
// Customer card with green accent
<View className="bg-card p-4 border-l-4 border-single-primary">
  <Text className="text-single-primary font-bold">عرض خاص</Text>
</View>

// Business dashboard with blue header
<View className="bg-business-primary p-4">
  <Text className="text-white font-bold">لوحة التحكم</Text>
</View>

// Background
<View className="flex-1 bg-background">
  {/* محتوى التطبيق */}
</View>
```

---

## 🎨 إرشادات التصميم | Design Guidelines

### للتطبيق العميل (Single)
- استخدم `single-primary` للعناصر الأساسية
- الأخضر يعبر عن: النمو، الأمان، النجاح
- مناسب لعمليات الشراء والدفع

### لتطبيق الأعمال (Business)
- استخدم `business-primary` للعناصر الأساسية
- الأزرق يعبر عن: الثقة، الاحترافية، الاستقرار
- مناسب للإدارة والتقارير

### القواعد العامة
1. **التباين**: تأكد من تباين كافٍ بين النص والخلفية
2. **الاتساق**: استخدم نفس اللون للعناصر المتشابهة
3. **التسلسل**: استخدم درجات الألوان للدلالة على الأهمية
4. **الوضوح**: لا تستخدم أكثر من 3 ألوان أساسية في شاشة واحدة

---

## 📱 تطبيق الألوان في الكود | Implementation

### Constants File
```javascript
// src/common/constants/colors.js
export const COLORS = {
  singlePrimary: '#028550',
  businessPrimary: '#0055aa',
  background: '#f8f8f8',
  // ...
};
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'single-primary': { /* ... */ },
        'business-primary': { /* ... */ },
        // ...
      }
    }
  }
};
```

### Button Component
```javascript
// src/common/components/ui/Button.js
const variantClasses = {
  'single-primary': 'bg-single-primary active:bg-single-primary-dark',
  'business-primary': 'bg-business-primary active:bg-business-primary-dark',
  // ...
};
```

---

## 🎯 اختبار الألوان | Color Testing

تم تجهيز `App.js` لعرض جميع الألوان:
```bash
npm start
```

ستظهر:
- نماذج الألوان لكل تطبيق
- أزرار بجميع الأشكال
- عينات الألوان المختلفة

---

## 📚 مراجع إضافية | Additional Resources

- [NativeWind Colors](https://www.nativewind.dev/core-concepts/colors)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Material Design Color System](https://material.io/design/color)

---

**آخر تحديث:** $(date +%Y-%m-%d)
**الإصدار:** 1.0.0

# UpcomingPaymentsSection - Reusable Component

Component قابل لإعادة الاستخدام لعرض قائمة المدفوعات القادمة في تطبيق أبشر أعمال.

## المكونات

### 1. UpcomingPaymentCard
Component فردي لعرض بطاقة دفعة واحدة.

### 2. UpcomingPaymentsSection
Component رئيسي يعرض قائمة المدفوعات مع header وأزرار.

## الاستخدام الأساسي

```javascript
import { UpcomingPaymentsSection } from "../../components/HomeContentSections";

// في الـ component الخاص بك
<UpcomingPaymentsSection
  onViewAll={handleViewAllPayments}
  onPaymentPress={handlePaymentPress}
/>
```

## الاستخدام مع بيانات مخصصة

```javascript
const customPayments = [
  {
    id: "1",
    title: "رسوم الزكاة والدخل",
    description: "مستحق خلال 5 أيام",
    amount: 15000,
    icon: "dollar-sign",
    iconColor: "#059669",
    iconBgColor: "bg-green-50",
    isUrgent: true,
  },
  {
    id: "2",
    title: "اشتراك التأمينات",
    description: "مستحق خلال 10 أيام",
    amount: 8500,
    icon: "shield",
    iconColor: "#0055aa",
    iconBgColor: "bg-blue-50",
    isUrgent: false,
  },
];

<UpcomingPaymentsSection
  payments={customPayments}
  onViewAll={handleViewAllPayments}
  onPaymentPress={handlePaymentPress}
  title="المدفوعات العاجلة"
  showViewAll={true}
/>
```

## Props

### UpcomingPaymentsSection Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `payments` | Array | No | Default sample data | مصفوفة من كائنات الدفعات |
| `onViewAll` | Function | No | - | دالة يتم استدعاؤها عند الضغط على "عرض الكل" |
| `onPaymentPress` | Function | No | - | دالة يتم استدعاؤها عند الضغط على بطاقة دفعة |
| `title` | String | No | "المدفوعات القادمة" | عنوان القسم |
| `showViewAll` | Boolean | No | true | إظهار أو إخفاء زر "عرض الكل" |

### Payment Object Structure

```javascript
{
  id: string,              // معرف فريد للدفعة
  title: string,           // عنوان الدفعة
  description: string,     // وصف الدفعة
  amount: number,          // المبلغ بالريال
  icon: string,           // اسم أيقونة Feather
  iconColor: string,      // لون الأيقونة (hex)
  iconBgColor: string,    // لون خلفية الأيقونة (Tailwind class)
  isUrgent: boolean,      // هل الدفعة عاجلة؟
}
```

## الأيقونات المتاحة (Feather Icons)

- `users` - للعمالة
- `file-text` - للملفات والمستندات
- `file` - للسجلات
- `dollar-sign` - للرسوم المالية
- `shield` - للتأمينات
- `credit-card` - للمدفوعات

## مثال كامل

```javascript
import React from "react";
import { View, ScrollView } from "react-native";
import { UpcomingPaymentsSection } from "../../components/HomeContentSections";

const MyScreen = ({ navigation }) => {
  const handleViewAll = () => {
    navigation.navigate("PaymentsList");
  };

  const handlePaymentPress = (payment) => {
    navigation.navigate("PaymentDetails", {
      paymentId: payment.id,
    });
  };

  // يمكنك جلب البيانات من API أو Redux
  const paymentsFromAPI = [
    // ... بيانات المدفوعات
  ];

  return (
    <ScrollView>
      <UpcomingPaymentsSection
        payments={paymentsFromAPI}
        onViewAll={handleViewAll}
        onPaymentPress={handlePaymentPress}
      />
    </ScrollView>
  );
};
```

## ملاحظات

- إذا لم يتم تمرير `payments`، سيتم استخدام بيانات تجريبية افتراضية
- الـ Component يدعم RTL بشكل كامل
- جميع النصوص محاذاة للعربية (text-right)
- يمكن تخصيص الألوان حسب الحاجة

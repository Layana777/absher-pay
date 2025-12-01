# Button Component Documentation

## Overview

The Button component is a reusable, customizable button used throughout the Absher Pay application. It supports multiple variants, sizes, and states, making it suitable for both the Single (Customer) and Business apps.

## Import

```javascript
import { Button } from '../../common/components/ui';
// or
import Button from '../../common/components/ui/Button';
```

## Basic Usage

```javascript
<Button
  title="تسجيل الدخول"
  onPress={() => console.log('Button pressed')}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | The text to display on the button |
| `onPress` | function | required | Function to call when button is pressed |
| `variant` | string | `'primary'` | Button style variant (see variants below) |
| `size` | string | `'medium'` | Button size (see sizes below) |
| `disabled` | boolean | `false` | Whether the button is disabled |
| `loading` | boolean | `false` | Whether to show loading indicator |
| `className` | string | `''` | Additional Tailwind classes for the button |
| `textClassName` | string | `''` | Additional Tailwind classes for the text |

## Variants

### Single (Customer) App - Primary Button
Use this for primary actions in the customer app.

```javascript
<Button
  title="ابدأ الآن"
  onPress={handleStart}
  variant="single-primary"
  size="medium"
/>
```

**Color:** Green (#028550)
**Use cases:** Login, Continue, Start, Confirm payments

### Business App - Primary Button
Use this for primary actions in the business app.

```javascript
<Button
  title="حفظ المنتج"
  onPress={handleSave}
  variant="business-primary"
  size="medium"
/>
```

**Color:** Blue (#0055aa)
**Use cases:** Save, Create, Update, Dashboard actions

### Other Variants

```javascript
// Primary (default)
<Button title="تسجيل الدخول" variant="primary" />

// Secondary
<Button title="إلغاء" variant="secondary" />

// Outline
<Button title="تخطي" variant="outline" />

// Danger
<Button title="حذف" variant="danger" />

// Success
<Button title="تم" variant="success" />
```

## Sizes

### Small
Compact button for inline actions or secondary buttons.

```javascript
<Button
  title="تعديل"
  size="small"
  variant="single-primary"
  onPress={handleEdit}
/>
```

**Padding:** `py-2 px-4`
**Text size:** `text-sm`

### Medium (Recommended)
Standard button size for most use cases.

```javascript
<Button
  title="التالي"
  size="medium"
  variant="single-primary"
  onPress={handleNext}
/>
```

**Padding:** `py-4`
**Text size:** `text-lg`

### Large
Large button for prominent actions.

```javascript
<Button
  title="إنشاء حساب"
  size="large"
  variant="single-primary"
  onPress={handleSignup}
/>
```

**Padding:** `py-4 px-8`
**Text size:** `text-xl`

## States

### Loading State

```javascript
<Button
  title="جاري التحميل..."
  loading={true}
  variant="single-primary"
  onPress={handleSubmit}
/>
```

Shows an activity indicator instead of the text.

### Disabled State

```javascript
<Button
  title="متابعة"
  disabled={!isValid}
  variant="single-primary"
  onPress={handleContinue}
/>
```

Button becomes semi-transparent and non-interactive.

## Complete Examples

### Single App - Onboarding Screen

```javascript
import React from 'react';
import { View } from 'react-native';
import { Button } from '../../common/components/ui';

const OnboardingScreen = ({ navigation, currentIndex, totalPages }) => {
  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      // Go to next page
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View className="px-5 pb-10">
      <Button
        title={currentIndex === totalPages - 1 ? "ابدأ الآن" : "التالي"}
        onPress={handleNext}
        variant="single-primary"
        size="medium"
      />
    </View>
  );
};
```

### Single App - Login Form

```javascript
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Button } from '../../common/components/ui';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Login logic
    } finally {
      setLoading(false);
    }
  };

  const isValid = email && password;

  return (
    <View className="p-5 space-y-4">
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="البريد الإلكتروني"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="كلمة المرور"
        secureTextEntry
      />
      <Button
        title="تسجيل الدخول"
        onPress={handleLogin}
        variant="single-primary"
        size="medium"
        disabled={!isValid}
        loading={loading}
      />
    </View>
  );
};
```

### Business App - Product Form

```javascript
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Button } from '../../common/components/ui';

const ProductForm = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save product logic
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="p-5 space-y-4">
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="اسم المنتج"
      />
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="السعر"
        keyboardType="numeric"
      />

      <View className="flex-row gap-3">
        <Button
          title="إلغاء"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="medium"
          className="flex-1"
        />
        <Button
          title="حفظ"
          onPress={handleSave}
          variant="business-primary"
          size="medium"
          loading={loading}
          className="flex-1"
        />
      </View>
    </View>
  );
};
```

### Inline Buttons (Small Size)

```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../common/components/ui';

const ProductCard = ({ product }) => {
  return (
    <View className="bg-white p-4 rounded-lg">
      <Text className="text-lg font-bold">{product.name}</Text>
      <Text className="text-gray-600">{product.price} ريال</Text>

      <View className="flex-row gap-2 mt-3">
        <Button
          title="تعديل"
          size="small"
          variant="outline"
          onPress={() => console.log('Edit')}
        />
        <Button
          title="حذف"
          size="small"
          variant="danger"
          onPress={() => console.log('Delete')}
        />
      </View>
    </View>
  );
};
```

## Customization with className

You can add custom Tailwind classes to further customize the button:

```javascript
// Full width button
<Button
  title="تسجيل الدخول"
  variant="single-primary"
  className="w-full"
/>

// Button with custom margin
<Button
  title="التالي"
  variant="single-primary"
  className="mt-4 mb-2"
/>

// Button with custom styling
<Button
  title="خاص"
  variant="single-primary"
  className="bg-purple-600"
  textClassName="text-yellow-300"
/>
```

## Design Guidelines

### When to use Single vs Business variant

**Use `single-primary` for:**
- Customer-facing features
- Payment and checkout flows
- User account management
- Service browsing

**Use `business-primary` for:**
- Business dashboard actions
- Product management
- Reports and analytics
- Admin operations

### Accessibility

- Always provide meaningful button text
- Use loading state for async operations
- Disable buttons when action is not available
- Ensure proper touch target size (minimum 44x44 points)

### Best Practices

1. **Use appropriate sizes:**
   - Small: Secondary actions, inline actions
   - Medium: Primary actions, forms (recommended)
   - Large: Hero sections, prominent CTAs

2. **Loading states:**
   - Always show loading state for async operations
   - Keep button disabled during loading

3. **Disabled states:**
   - Disable buttons when requirements aren't met
   - Provide feedback on why button is disabled

4. **Consistent styling:**
   - Use single-primary for customer app
   - Use business-primary for business app
   - Use outline for secondary actions
   - Use danger for destructive actions

## Color Reference

| Variant | Background | Active State | Text Color |
|---------|------------|--------------|------------|
| single-primary | #028550 (Green) | #026a40 | White |
| business-primary | #0055aa (Blue) | #004488 | White |
| outline | Transparent | Primary-50 | Primary |
| danger | Red | Red-600 | White |
| success | Green | Green-600 | White |

## Related Documentation

- [Color Guide](./COLORS_GUIDE.md) - Complete color system documentation
- [Project Structure](./PROJECT_STRUCTURE.md) - Component organization

## Troubleshooting

### Button not showing correct color

Make sure you're using the correct variant name:
```javascript
// ✅ Correct
<Button variant="single-primary" />

// ❌ Wrong
<Button variant="singlePrimary" />
<Button variant="green" />
```

### Button text not centered

The button automatically centers text. If you need custom alignment, use the `className` prop:
```javascript
<Button
  title="نص"
  className="items-start" // Align to start
/>
```

### Custom colors not working

For custom colors, you may need to override the variant:
```javascript
<Button
  title="مخصص"
  className="bg-purple-600 active:bg-purple-700"
  textClassName="text-white"
/>
```

---

**Last Updated:** December 2024
**Version:** 1.0.0

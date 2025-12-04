# Business Navigation Guide

## Navigation Structure

The BusinessNavigator now supports two types of screens:

1. **Tab Screens** - Main screens with bottom tab bar visible
2. **Standalone Screens** - Detail/modal screens without tabs

### Architecture

```
BusinessNavigator (Stack)
  └── BusinessTabs (Tab Navigator) [Default Screen]
      ├── Home
      ├── Payments
      ├── Support
      ├── Reports
      └── Settings
  └── Standalone Screens (No Tabs)
      ├── PaymentDetails
      ├── Profile
      ├── TransactionHistory
      └── (Add more as needed)
```

## Navigation Examples

### 1. Navigate Between Tab Screens

When navigating between tab screens, the bottom tab bar remains visible.

```javascript
// From any screen in BusinessHomeScreen
navigation.navigate('Payments'); // Shows Payments tab
navigation.navigate('Settings'); // Shows Settings tab
```

### 2. Navigate to Standalone Screen (Without Tabs)

When navigating to standalone screens, the bottom tab bar is hidden.

```javascript
// From BusinessHomeScreen or any tab screen
navigation.navigate('PaymentDetails', { paymentId: '123' });
navigation.navigate('Profile');
navigation.navigate('TransactionHistory');
```

### 3. Navigate Back

```javascript
// Go back to previous screen
navigation.goBack();

// Or navigate to specific tab
navigation.navigate('Home');
```

## Adding New Screens

### Add a Tab Screen

Edit `src/business/navigation/BusinessNavigator.js` inside the `BusinessTabNavigator`:

```javascript
<Tab.Screen
  name="YourTabName"
  component={YourScreenComponent}
  options={{
    tabBarLabel: "التسمية العربية",
    tabBarIcon: ({ color, size }) => (
      <Feather name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

### Add a Standalone Screen (Without Tabs)

Edit `src/business/navigation/BusinessNavigator.js` inside the main `BusinessNavigator`:

```javascript
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="BusinessTabs" component={BusinessTabNavigator} />

  {/* Add your standalone screens here */}
  <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
  <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
</Stack.Navigator>
```

## Example: Creating a Payment Details Screen

### Step 1: Create the Screen Component

Create `src/business/screens/PaymentDetailsScreen.js`:

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PaymentDetailsScreen = ({ navigation, route }) => {
  const { paymentId } = route.params || {};

  return (
    <View className="flex-1 bg-white" style={{ direction: 'ltr' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0055aa" />

      {/* Header with Back Button */}
      <View className="bg-[#0055aa] pt-12 pb-4 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-right" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold mr-4">
            تفاصيل الدفع
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 p-6">
        <Text className="text-lg">Payment ID: {paymentId}</Text>
        {/* Add your payment details UI here */}
      </View>
    </View>
  );
};

export default PaymentDetailsScreen;
```

### Step 2: Add to Navigation

In `src/business/navigation/BusinessNavigator.js`:

```javascript
import { BusinessHomeScreen } from "../screens";
import PaymentDetailsScreen from "../screens/PaymentDetailsScreen";

// ... in BusinessNavigator
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="BusinessTabs" component={BusinessTabNavigator} />
  <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
</Stack.Navigator>
```

### Step 3: Navigate to the Screen

From any component:

```javascript
<TouchableOpacity
  onPress={() => navigation.navigate('PaymentDetails', { paymentId: '123' })}
>
  <Text>View Payment Details</Text>
</TouchableOpacity>
```

## Example: Navigate from Home to Payment Details

In `BusinessHomeScreen.js`:

```javascript
import { TouchableOpacity } from 'react-native';

const BusinessHomeScreen = ({ navigation }) => {
  const handleViewPayment = (paymentId) => {
    // Navigate to standalone screen without tabs
    navigation.navigate('PaymentDetails', { paymentId });
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleViewPayment('123')}>
        <Text>View Payment</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Navigation Props Available

All screens receive the `navigation` prop with these methods:

```javascript
// Navigate to a screen
navigation.navigate('ScreenName', { params });

// Go back
navigation.goBack();

// Replace current screen
navigation.replace('ScreenName');

// Reset navigation stack
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});

// Check if can go back
navigation.canGoBack();
```

## Route Params

Access route parameters in any screen:

```javascript
const MyScreen = ({ route }) => {
  const { userId, data } = route.params || {};

  return <Text>User ID: {userId}</Text>;
};

// Navigate with params
navigation.navigate('MyScreen', { userId: '123', data: {...} });
```

## Best Practices

### 1. Use Tab Navigation for Main Features
- Home dashboard
- Main feature sections
- Always-accessible screens

### 2. Use Standalone Navigation for:
- Detail views (payment details, transaction details)
- Forms and creation screens
- Profile and settings subpages
- Modal-like experiences

### 3. Back Navigation
Always provide a way to go back from standalone screens:

```javascript
<TouchableOpacity onPress={() => navigation.goBack()}>
  <Feather name="arrow-right" size={24} color="white" />
</TouchableOpacity>
```

### 4. Deep Linking
When implementing deep links, use the full path:

```javascript
// Link to tab screen
navigation.navigate('BusinessTabs', { screen: 'Home' });

// Link to standalone screen
navigation.navigate('PaymentDetails', { paymentId: '123' });
```

## Common Navigation Patterns

### Pattern 1: Tab to Detail Screen

```javascript
// In Home tab
<TouchableOpacity onPress={() => navigation.navigate('PaymentDetails', { id: '123' })}>
  <Text>View Payment</Text>
</TouchableOpacity>
```

### Pattern 2: Detail Back to Tab

```javascript
// In PaymentDetails screen
<TouchableOpacity onPress={() => navigation.goBack()}>
  <Text>Back to Home</Text>
</TouchableOpacity>

// Or navigate to specific tab
<TouchableOpacity onPress={() => navigation.navigate('Home')}>
  <Text>Go to Home</Text>
</TouchableOpacity>
```

### Pattern 3: Tab to Tab

```javascript
// Switch between tabs
navigation.navigate('Payments');
navigation.navigate('Settings');
```

## Troubleshooting

### Tabs Not Showing
- Check if you're navigating to a screen inside `BusinessTabNavigator`
- Ensure the screen is registered as a `Tab.Screen` not `Stack.Screen`

### Can't Navigate to Screen
- Verify the screen is registered in `BusinessNavigator`
- Check the screen name matches exactly (case-sensitive)
- Ensure the component is imported correctly

### Back Button Not Working
- Use `navigation.goBack()` for standard back navigation
- For tabs, navigate to specific tab: `navigation.navigate('Home')`

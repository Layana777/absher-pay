# React Native Multi-App Clean Architecture Skill

## Overview
This skill guides you in building scalable, maintainable React Native applications with **multi-app architecture** supporting separate Business and Single (Customer) sides. Each side has its own screens, components, and navigation while sharing common utilities, services, and reusable components.

**Tech Stack:**
- **Database**: Firebase Realtime Database
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Architecture**: Clean Architecture with separation of concerns

## Important Notes
- All styling uses **NativeWind** (Tailwind classes) instead of StyleSheet
- All data operations use **Firebase Realtime Database** instead of REST APIs
- API services are replaced with Firebase service layers

## Multi-App Project Structure

```
src/
├── common/                    # Shared across both apps
│   ├── components/           # Common reusable components
│   │   ├── ui/              # UI components used by both apps
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── Avatar.js
│   │   │   ├── Badge.js
│   │   │   ├── Loader.js
│   │   │   └── index.js
│   │   ├── layout/          # Layout components
│   │   │   ├── Container.js
│   │   │   ├── Row.js
│   │   │   ├── Column.js
│   │   │   └── index.js
│   │   ├── forms/           # Form components
│   │   │   ├── TextInput.js
│   │   │   ├── Checkbox.js
│   │   │   ├── RadioButton.js
│   │   │   ├── Dropdown.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── services/            # Shared API services
│   │   ├── api/
│   │   │   ├── apiClient.js
│   │   │   ├── endpoints.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── notificationService.js
│   │   │   └── index.js
│   │   ├── storage/
│   │   │   ├── asyncStorage.js
│   │   │   ├── secureStorage.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── hooks/               # Shared custom hooks
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useTheme.js
│   │   ├── useKeyboard.js
│   │   └── index.js
│   │
│   ├── utils/               # Shared utility functions
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── dateHelpers.js
│   │   ├── stringHelpers.js
│   │   ├── arrayHelpers.js
│   │   ├── permissions.js
│   │   └── index.js
│   │
│   ├── constants/           # Shared constants
│   │   ├── colors.js
│   │   ├── sizes.js
│   │   ├── fonts.js
│   │   ├── api.js
│   │   └── index.js
│   │
│   ├── context/             # Shared context providers
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   ├── LanguageContext.js
│   │   └── index.js
│   │
│   └── assets/              # Shared assets
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── business/                 # Business side application
│   ├── components/          # Business-specific components
│   │   ├── Dashboard/
│   │   │   ├── StatCard.js
│   │   │   ├── SalesChart.js
│   │   │   └── index.js
│   │   ├── Orders/
│   │   │   ├── OrderCard.js
│   │   │   ├── OrderFilter.js
│   │   │   └── index.js
│   │   ├── Products/
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductForm.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── screens/             # Business screens
│   │   ├── Dashboard/
│   │   │   ├── DashboardScreen.js
│   │   │   └── components/
│   │   ├── Orders/
│   │   │   ├── OrdersListScreen.js
│   │   │   ├── OrderDetailScreen.js
│   │   │   └── components/
│   │   ├── Products/
│   │   │   ├── ProductsListScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   ├── AddProductScreen.js
│   │   │   └── components/
│   │   ├── Inventory/
│   │   │   ├── InventoryScreen.js
│   │   │   └── components/
│   │   ├── Analytics/
│   │   │   ├── AnalyticsScreen.js
│   │   │   └── components/
│   │   ├── Settings/
│   │   │   ├── SettingsScreen.js
│   │   │   └── components/
│   │   ├── Auth/
│   │   │   ├── BusinessLoginScreen.js
│   │   │   ├── BusinessRegisterScreen.js
│   │   │   └── components/
│   │   └── index.js
│   │
│   ├── navigation/          # Business navigation
│   │   ├── BusinessNavigator.js
│   │   ├── BusinessTabNavigator.js
│   │   ├── BusinessAuthNavigator.js
│   │   └── index.js
│   │
│   ├── services/            # Business-specific services
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── inventoryService.js
│   │   ├── analyticsService.js
│   │   └── index.js
│   │
│   ├── hooks/               # Business-specific hooks
│   │   ├── useOrders.js
│   │   ├── useProducts.js
│   │   ├── useInventory.js
│   │   └── index.js
│   │
│   ├── constants/           # Business-specific constants
│   │   ├── routes.js
│   │   ├── orderStatus.js
│   │   └── index.js
│   │
│   └── context/             # Business-specific context
│       ├── BusinessContext.js
│       └── index.js
│
├── single/                   # Single (Customer) side application
│   ├── components/          # Customer-specific components
│   │   ├── Home/
│   │   │   ├── CategoryCard.js
│   │   │   ├── FeaturedProduct.js
│   │   │   ├── Banner.js
│   │   │   └── index.js
│   │   ├── Products/
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductGrid.js
│   │   │   ├── ProductFilter.js
│   │   │   └── index.js
│   │   ├── Cart/
│   │   │   ├── CartItem.js
│   │   │   ├── CartSummary.js
│   │   │   └── index.js
│   │   ├── Checkout/
│   │   │   ├── AddressForm.js
│   │   │   ├── PaymentMethod.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── screens/             # Customer screens
│   │   ├── Home/
│   │   │   ├── HomeScreen.js
│   │   │   └── components/
│   │   ├── Products/
│   │   │   ├── ProductsListScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   └── components/
│   │   ├── Cart/
│   │   │   ├── CartScreen.js
│   │   │   └── components/
│   │   ├── Checkout/
│   │   │   ├── CheckoutScreen.js
│   │   │   └── components/
│   │   ├── Orders/
│   │   │   ├── MyOrdersScreen.js
│   │   │   ├── OrderDetailScreen.js
│   │   │   └── components/
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.js
│   │   │   ├── EditProfileScreen.js
│   │   │   └── components/
│   │   ├── Favorites/
│   │   │   ├── FavoritesScreen.js
│   │   │   └── components/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── ForgotPasswordScreen.js
│   │   │   └── components/
│   │   └── index.js
│   │
│   ├── navigation/          # Customer navigation
│   │   ├── SingleNavigator.js
│   │   ├── SingleTabNavigator.js
│   │   ├── SingleAuthNavigator.js
│   │   └── index.js
│   │
│   ├── services/            # Customer-specific services
│   │   ├── cartService.js
│   │   ├── wishlistService.js
│   │   ├── checkoutService.js
│   │   └── index.js
│   │
│   ├── hooks/               # Customer-specific hooks
│   │   ├── useCart.js
│   │   ├── useWishlist.js
│   │   ├── useCheckout.js
│   │   └── index.js
│   │
│   ├── constants/           # Customer-specific constants
│   │   ├── routes.js
│   │   ├── categories.js
│   │   └── index.js
│   │
│   └── context/             # Customer-specific context
│       ├── CartContext.js
│       ├── WishlistContext.js
│       └── index.js
│
├── navigation/              # Root navigation
│   ├── RootNavigator.js    # Switches between Business/Single
│   └── index.js
│
└── App.js                   # Main app entry
```

## 1. Common Components (Shared Between Business & Single)

### Common Component File Structure
Common components are shared across both Business and Single apps. They should be generic and configurable.

```javascript
// src/common/components/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className,
  textClassName,
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-lg items-center justify-center flex-row';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-purple-600 active:bg-purple-700',
    outline: 'bg-transparent border border-blue-500 active:bg-blue-50',
    danger: 'bg-red-500 active:bg-red-600',
  };
  
  // Size classes
  const sizeClasses = {
    small: 'py-2 px-4',
    medium: 'py-3 px-6',
    large: 'py-4 px-8',
  };
  
  // Text variant classes
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-500',
    danger: 'text-white',
  };
  
  // Text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };
  
  // Disabled classes
  const disabledClasses = disabled || loading ? 'opacity-50' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className || ''}`;
  const buttonTextClasses = `${textVariantClasses[variant]} ${textSizeClasses[size]} font-semibold ${textClassName || ''}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={buttonTextClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
```

### Common Components Export Pattern
```javascript
// src/common/components/ui/index.js
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Avatar } from './Avatar';
export { default as Modal } from './Modal';
export { default as Badge } from './Badge';

// src/common/components/layout/index.js
export { default as Container } from './Container';
export { default as Row } from './Row';
export { default as Column } from './Column';

// src/common/components/forms/index.js
export { default as TextInput } from './TextInput';
export { default as Checkbox } from './Checkbox';
export { default as RadioButton } from './RadioButton';
export { default as Dropdown } from './Dropdown';

// src/common/components/index.js - Main export file
export * from './ui';
export * from './layout';
export * from './forms';
```

### Example: Common Card Component
```javascript
// src/common/components/ui/Card.js
import React from 'react';
import { View, TouchableOpacity } from 'react-native';

const Card = ({
  children,
  className,
  onPress,
  variant = 'default',
  ...props
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  // Base classes
  const baseClasses = 'bg-white rounded-xl overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: 'shadow-sm',
    outlined: 'border border-gray-200',
    elevated: 'shadow-lg',
  };
  
  // Combine classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className || ''}`;

  return (
    <CardComponent
      className={cardClasses}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
```

### Example: Common Input Component
```javascript
// src/common/components/ui/Input.js
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  leftIcon,
  rightIcon,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  className,
  inputClassName,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  // Container classes
  const containerClasses = `mb-4 ${className || ''}`;
  
  // Input container classes
  const inputContainerBaseClasses = 'flex-row items-center bg-gray-50 rounded-lg border px-4';
  const focusClasses = isFocused ? 'border-blue-500 bg-white' : 'border-gray-200';
  const errorClasses = error ? 'border-red-500' : '';
  const disabledClasses = disabled ? 'opacity-50 bg-gray-100' : '';
  const inputContainerClasses = `${inputContainerBaseClasses} ${focusClasses} ${errorClasses} ${disabledClasses}`;
  
  // Input classes
  const inputBaseClasses = 'flex-1 py-3 text-base text-gray-900';
  const multilineClasses = multiline ? 'min-h-[100px] text-top' : '';
  const finalInputClasses = `${inputBaseClasses} ${multilineClasses} ${inputClassName || ''}`;

  return (
    <View className={containerClasses}>
      {label && <Text className="text-sm font-semibold text-gray-900 mb-2">{label}</Text>}
      
      <View className={inputContainerClasses}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        
        <TextInput
          className={finalInputClasses}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
        
        {secureTextEntry && (
          <TouchableOpacity
            className="p-2"
            onPress={() => setIsSecure(!isSecure)}
          >
            <Text>{isSecure ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text className="text-xs text-red-500 mt-2">{error}</Text>}
    </View>
  );
};

export default Input;
```

## 2. App-Specific Components

### Business-Specific Component Example
```javascript
// src/business/components/Dashboard/StatCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../common/components'; // Import from common

const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
  const isPositive = trend === 'up';

  return (
    <Card className="flex-1 m-2 p-4" variant="elevated">
      <View className="flex-row justify-between items-center mb-4">
        <View 
          className="w-12 h-12 rounded-full justify-center items-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </View>
        {trend && (
          <View className="px-2 py-1 rounded-xl bg-gray-100">
            <Text className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {trendValue}
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-3xl font-bold text-gray-900 mb-2">{value}</Text>
      <Text className="text-sm text-gray-500">{title}</Text>
    </Card>
  );
};

export default StatCard;
```

```javascript
// src/business/components/index.js
export { default as StatCard } from './Dashboard/StatCard';
export { default as SalesChart } from './Dashboard/SalesChart';
export { default as OrderCard } from './Orders/OrderCard';
export { default as OrderFilter } from './Orders/OrderFilter';
export { default as ProductForm } from './Products/ProductForm';
```

### Single (Customer) Specific Component Example
```javascript
// src/single/components/Products/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card, Badge, Button } from '../../../common/components'; // Import from common

const ProductCard = ({ 
  product, 
  onPress, 
  onAddToCart, 
  onToggleFavorite,
  isFavorite = false,
}) => {
  return (
    <Card className="m-2 p-0" onPress={onPress}>
      <View className="relative w-full h-48">
        <Image 
          source={{ uri: product.image }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {product.discount && (
          <View className="absolute top-2 left-2">
            <Badge variant="danger" className="px-2 py-1">
              <Text className="text-white text-xs font-bold">-{product.discount}%</Text>
            </Badge>
          </View>
        )}
        
        <TouchableOpacity 
          className="absolute top-2 right-2 bg-white/90 w-9 h-9 rounded-full justify-center items-center"
          onPress={onToggleFavorite}
        >
          <Text className="text-xl">
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="p-4">
        <Text className="text-xs text-gray-500 uppercase mb-1">{product.category}</Text>
        <Text className="text-base font-semibold text-gray-900 mb-2" numberOfLines={2}>
          {product.name}
        </Text>
        
        <View className="flex-row items-center mb-4">
          <Text className="text-sm font-semibold text-gray-900">⭐ {product.rating}</Text>
          <Text className="text-sm text-gray-500 ml-1">({product.reviews})</Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {product.discount ? (
              <>
                <Text className="text-sm text-gray-500 line-through mr-2">
                  ${product.price}
                </Text>
                <Text className="text-lg font-bold text-blue-500">
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </Text>
              </>
            ) : (
              <Text className="text-lg font-bold text-blue-500">${product.price}</Text>
            )}
          </View>
          
          <Button
            title="Add"
            size="small"
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-6"
          />
        </View>
      </View>
    </Card>
  );
};

export default ProductCard;
```

```javascript
// src/single/components/index.js
export { default as CategoryCard } from './Home/CategoryCard';
export { default as FeaturedProduct } from './Home/FeaturedProduct';
export { default as ProductCard } from './Products/ProductCard';
export { default as ProductGrid } from './Products/ProductGrid';
export { default as CartItem } from './Cart/CartItem';
export { default as CartSummary } from './Cart/CartSummary';
```

## 3. Services Architecture (Firebase Realtime Database)

### Firebase Configuration
```javascript
// src/common/services/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
```

### Firebase Database Paths Constants
```javascript
// src/common/services/firebase/databasePaths.js
export const DB_PATHS = {
  // Authentication & Users
  USERS: 'users',
  USER: (uid) => `users/${uid}`,
  USER_PROFILE: (uid) => `users/${uid}/profile`,
  
  // Business paths
  BUSINESS: {
    ORDERS: 'business/orders',
    ORDER: (orderId) => `business/orders/${orderId}`,
    ORDER_STATUS: (orderId) => `business/orders/${orderId}/status`,
    PRODUCTS: 'business/products',
    PRODUCT: (productId) => `business/products/${productId}`,
    INVENTORY: 'business/inventory',
    INVENTORY_ITEM: (itemId) => `business/inventory/${itemId}`,
    ANALYTICS: 'business/analytics',
    STATS: 'business/stats',
  },
  
  // Customer paths
  CUSTOMER: {
    PRODUCTS: 'products',
    PRODUCT: (productId) => `products/${productId}`,
    CATEGORIES: 'categories',
    CART: (userId) => `carts/${userId}`,
    CART_ITEM: (userId, itemId) => `carts/${userId}/${itemId}`,
    WISHLIST: (userId) => `wishlists/${userId}`,
    WISHLIST_ITEM: (userId, productId) => `wishlists/${userId}/${productId}`,
    ORDERS: (userId) => `orders/${userId}`,
    ORDER: (userId, orderId) => `orders/${userId}/${orderId}`,
  },
  
  // Shared
  NOTIFICATIONS: (userId) => `notifications/${userId}`,
  NOTIFICATION: (userId, notificationId) => `notifications/${userId}/${notificationId}`,
};
```

### Common Auth Service (Firebase)
```javascript
// src/common/services/firebase/authService.js
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from './firebaseConfig';
import { DB_PATHS } from './databasePaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, password, userType = 'customer') => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from database
      const userRef = ref(database, DB_PATHS.USER(user.uid));
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      
      // Verify user type matches
      if (userData?.userType !== userType) {
        await signOut(auth);
        return {
          success: false,
          error: `Invalid login. Please use the ${userType} app.`
        };
      }
      
      // Store user type locally
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('userId', user.uid);
      
      return {
        success: true,
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            ...userData
          },
          userType
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  register: async (email, password, displayName, userType = 'customer', additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Create user data in database
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName,
        userType,
        createdAt: Date.now(),
        ...additionalData
      };
      
      await set(ref(database, DB_PATHS.USER(user.uid)), userData);
      
      // Store user type locally
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('userId', user.uid);
      
      return {
        success: true,
        data: {
          user: userData,
          userType
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      await AsyncStorage.multiRemove(['userType', 'userId']);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  getCurrentUser: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        
        if (user) {
          const userType = await AsyncStorage.getItem('userType');
          const userRef = ref(database, DB_PATHS.USER(user.uid));
          const snapshot = await get(userRef);
          const userData = snapshot.val();
          
          resolve({
            success: true,
            data: {
              user: {
                uid: user.uid,
                email: user.email,
                ...userData
              },
              userType
            }
          });
        } else {
          resolve({ success: false, error: 'No user logged in' });
        }
      });
    });
  },

  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        data: { message: 'Password reset email sent' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  updateUserProfile: async (userId, updates) => {
    try {
      const userRef = ref(database, DB_PATHS.USER(userId));
      await update(userRef, {
        ...updates,
        updatedAt: Date.now()
      });
      
      return { success: true, data: updates };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
```

### Business-Specific Services (Firebase)
```javascript
// src/business/services/orderService.js
import { ref, get, set, update, query, orderByChild, equalTo, push } from 'firebase/database';
import { database } from '../../common/services/firebase/firebaseConfig';
import { DB_PATHS } from '../../common/services/firebase/databasePaths';

export const orderService = {
  getOrders: async (filters = {}) => {
    try {
      const ordersRef = ref(database, DB_PATHS.BUSINESS.ORDERS);
      let ordersQuery = ordersRef;
      
      // Apply filters
      if (filters.status) {
        ordersQuery = query(ordersRef, orderByChild('status'), equalTo(filters.status));
      }
      
      const snapshot = await get(ordersQuery);
      
      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((child) => {
          orders.push({
            id: child.key,
            ...child.val()
          });
        });
        
        // Sort by date if needed
        if (filters.sortBy === 'recent') {
          orders.sort((a, b) => b.createdAt - a.createdAt);
        }
        
        return { success: true, data: orders };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  getOrderDetail: async (orderId) => {
    try {
      const orderRef = ref(database, DB_PATHS.BUSINESS.ORDER(orderId));
      const snapshot = await get(orderRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: {
            id: orderId,
            ...snapshot.val()
          }
        };
      }
      
      return { success: false, error: 'Order not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = ref(database, DB_PATHS.BUSINESS.ORDER(orderId));
      await update(orderRef, {
        status,
        statusUpdatedAt: Date.now()
      });
      
      return { success: true, data: { orderId, status } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getOrderStats: async (period = 'week') => {
    try {
      const ordersRef = ref(database, DB_PATHS.BUSINESS.ORDERS);
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((child) => {
          orders.push(child.val());
        });
        
        // Calculate stats based on period
        const now = Date.now();
        const periodInMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        const startDate = now - periodInMs;
        
        const filteredOrders = orders.filter(order => order.createdAt >= startDate);
        
        const stats = {
          total: filteredOrders.length,
          pending: filteredOrders.filter(o => o.status === 'pending').length,
          completed: filteredOrders.filter(o => o.status === 'completed').length,
          cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
        };
        
        return { success: true, data: stats };
      }
      
      return { success: true, data: { total: 0, pending: 0, completed: 0, cancelled: 0 } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// src/business/services/productService.js
import { ref, get, set, update, remove, push, query, orderByChild } from 'firebase/database';
import { database } from '../../common/services/firebase/firebaseConfig';
import { DB_PATHS } from '../../common/services/firebase/databasePaths';

export const productService = {
  getProducts: async (filters = {}) => {
    try {
      const productsRef = ref(database, DB_PATHS.BUSINESS.PRODUCTS);
      const snapshot = await get(productsRef);
      
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach((child) => {
          products.push({
            id: child.key,
            ...child.val()
          });
        });
        
        // Apply filters
        let filteredProducts = products;
        
        if (filters.category) {
          filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }
        
        if (filters.inStock !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.stock > 0);
        }
        
        return { success: true, data: filteredProducts };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  createProduct: async (productData) => {
    try {
      const productsRef = ref(database, DB_PATHS.BUSINESS.PRODUCTS);
      const newProductRef = push(productsRef);
      
      const product = {
        ...productData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await set(newProductRef, product);
      
      return {
        success: true,
        data: {
          id: newProductRef.key,
          ...product
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const productRef = ref(database, DB_PATHS.BUSINESS.PRODUCT(productId));
      
      await update(productRef, {
        ...productData,
        updatedAt: Date.now()
      });
      
      return {
        success: true,
        data: { id: productId, ...productData }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (productId) => {
    try {
      const productRef = ref(database, DB_PATHS.BUSINESS.PRODUCT(productId));
      await remove(productRef);
      
      return { success: true, data: { productId } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// src/business/services/index.js
export { orderService } from './orderService';
export { productService } from './productService';
export { inventoryService } from './inventoryService';
export { analyticsService } from './analyticsService';
```

### Customer-Specific Services (Firebase)
```javascript
// src/single/services/cartService.js
import { ref, get, set, update, remove } from 'firebase/database';
import { database } from '../../common/services/firebase/firebaseConfig';
import { DB_PATHS } from '../../common/services/firebase/databasePaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cartService = {
  getCart: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const cartRef = ref(database, DB_PATHS.CUSTOMER.CART(userId));
      const snapshot = await get(cartRef);
      
      if (snapshot.exists()) {
        const cart = [];
        snapshot.forEach((child) => {
          cart.push({
            id: child.key,
            ...child.val()
          });
        });
        return { success: true, data: cart };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // Get product details
      const productRef = ref(database, DB_PATHS.CUSTOMER.PRODUCT(productId));
      const productSnapshot = await get(productRef);
      
      if (!productSnapshot.exists()) {
        return { success: false, error: 'Product not found' };
      }
      
      const product = productSnapshot.val();
      
      // Add to cart
      const cartItemRef = ref(database, DB_PATHS.CUSTOMER.CART_ITEM(userId, productId));
      const cartItem = {
        productId,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity,
        addedAt: Date.now()
      };
      
      await set(cartItemRef, cartItem);
      
      // Return updated cart
      return await cartService.getCart();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateCartItem: async (itemId, quantity) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const cartItemRef = ref(database, DB_PATHS.CUSTOMER.CART_ITEM(userId, itemId));
      
      if (quantity <= 0) {
        await remove(cartItemRef);
      } else {
        await update(cartItemRef, { quantity, updatedAt: Date.now() });
      }
      
      return await cartService.getCart();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeFromCart: async (itemId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const cartItemRef = ref(database, DB_PATHS.CUSTOMER.CART_ITEM(userId, itemId));
      await remove(cartItemRef);
      
      return await cartService.getCart();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearCart: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const cartRef = ref(database, DB_PATHS.CUSTOMER.CART(userId));
      await remove(cartRef);
      
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// src/single/services/wishlistService.js
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../../common/services/firebase/firebaseConfig';
import { DB_PATHS } from '../../common/services/firebase/databasePaths';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const wishlistService = {
  getWishlist: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const wishlistRef = ref(database, DB_PATHS.CUSTOMER.WISHLIST(userId));
      const snapshot = await get(wishlistRef);
      
      if (snapshot.exists()) {
        const wishlist = [];
        snapshot.forEach((child) => {
          wishlist.push({
            productId: child.key,
            ...child.val()
          });
        });
        return { success: true, data: wishlist };
      }
      
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addToWishlist: async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // Get product details
      const productRef = ref(database, DB_PATHS.CUSTOMER.PRODUCT(productId));
      const productSnapshot = await get(productRef);
      
      if (!productSnapshot.exists()) {
        return { success: false, error: 'Product not found' };
      }
      
      const product = productSnapshot.val();
      
      // Add to wishlist
      const wishlistItemRef = ref(database, DB_PATHS.CUSTOMER.WISHLIST_ITEM(userId, productId));
      await set(wishlistItemRef, {
        productName: product.name,
        productImage: product.image,
        price: product.price,
        addedAt: Date.now()
      });
      
      return await wishlistService.getWishlist();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const wishlistItemRef = ref(database, DB_PATHS.CUSTOMER.WISHLIST_ITEM(userId, productId));
      await remove(wishlistItemRef);
      
      return await wishlistService.getWishlist();
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// src/single/services/index.js
export { cartService } from './cartService';
export { wishlistService } from './wishlistService';
export { checkoutService } from './checkoutService';
```

### Common Services Export
```javascript
// src/common/services/index.js
export { authService } from './firebase/authService';
export { database, auth, storage } from './firebase/firebaseConfig';
export { DB_PATHS } from './firebase/databasePaths';
```

## 4. Screen Structure (Business & Single Apps)

### Business Screen Example
```javascript
// src/business/screens/Dashboard/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { StatCard } from '../../components';
import { orderService, analyticsService } from '../../services';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    const [ordersResult, analyticsResult] = await Promise.all([
      orderService.getOrderStats(),
      analyticsService.getOverview(),
    ]);
    
    if (ordersResult.success && analyticsResult.success) {
      setStats({
        orders: ordersResult.data,
        analytics: analyticsResult.data,
      });
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerClassName="p-4"
      >
        <Text className="text-3xl font-bold text-gray-900 mb-6">Dashboard</Text>
        
        <View className="flex-row flex-wrap -mx-2">
          <StatCard
            title="Total Sales"
            value={`$${stats?.analytics.totalSales || 0}`}
            icon={<Text className="text-2xl">💰</Text>}
            trend="up"
            trendValue="12%"
            color="#10B981"
          />
          
          <StatCard
            title="Orders"
            value={stats?.orders.total || 0}
            icon={<Text className="text-2xl">📦</Text>}
            trend="up"
            trendValue="8%"
            color="#3B82F6"
          />
          
          <StatCard
            title="Products"
            value={stats?.analytics.totalProducts || 0}
            icon={<Text className="text-2xl">🏷️</Text>}
            color="#8B5CF6"
          />
          
          <StatCard
            title="Customers"
            value={stats?.analytics.totalCustomers || 0}
            icon={<Text className="text-2xl">👥</Text>}
            trend="up"
            trendValue="15%"
            color="#F59E0B"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
```

```javascript
// src/business/screens/Orders/OrdersListScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Container, Button } from '../../../common/components';
import { OrderCard, OrderFilter } from '../../components';
import { orderService } from '../../services';
import { SIZES } from '../../../common/constants';

const OrdersListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'recent',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await orderService.getOrders(filters);
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  const handleOrderPress = (orderId) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  return (
    <Container>
      <OrderFilter 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderCard 
            order={item} 
            onPress={() => handleOrderPress(item.id)} 
          />
        )}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchOrders}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: SIZES.medium,
  },
});

export default OrdersListScreen;
```

```javascript
// src/business/screens/index.js
export { default as DashboardScreen } from './Dashboard/DashboardScreen';
export { default as OrdersListScreen } from './Orders/OrdersListScreen';
export { default as OrderDetailScreen } from './Orders/OrderDetailScreen';
export { default as ProductsListScreen } from './Products/ProductsListScreen';
export { default as ProductDetailScreen } from './Products/ProductDetailScreen';
export { default as AddProductScreen } from './Products/AddProductScreen';
export { default as InventoryScreen } from './Inventory/InventoryScreen';
export { default as AnalyticsScreen } from './Analytics/AnalyticsScreen';
export { default as BusinessLoginScreen } from './Auth/BusinessLoginScreen';
```

### Single (Customer) Screen Example
```javascript
// src/single/screens/Home/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Container } from '../../../common/components';
import { CategoryCard, FeaturedProduct, Banner } from '../../components';
import { productService } from '../../../common/services/api/productService';
import { SIZES } from '../../../common/constants';

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    
    // Fetch categories and featured products
    const [categoriesResult, productsResult] = await Promise.all([
      productService.getCategories(),
      productService.getFeaturedProducts(),
    ]);
    
    if (categoriesResult.success) {
      setCategories(categoriesResult.data);
    }
    
    if (productsResult.success) {
      setFeaturedProducts(productsResult.data);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId) => {
    navigation.navigate('ProductsList', { categoryId });
  };

  const handleProductPress = (productId) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}
      >
        <Banner />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <FeaturedProduct
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: SIZES.large,
  },
  section: {
    marginTop: SIZES.large,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  categoriesScroll: {
    paddingHorizontal: SIZES.medium,
  },
  productsGrid: {
    paddingHorizontal: SIZES.medium,
  },
});

export default HomeScreen;
```

```javascript
// src/single/screens/Cart/CartScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Container, Button } from '../../../common/components';
import { CartItem, CartSummary } from '../../components';
import { useCart } from '../../hooks/useCart';
import { COLORS, SIZES } from '../../../common/constants';

const CartScreen = ({ navigation }) => {
  const { 
    cart, 
    loading, 
    updateQuantity, 
    removeItem, 
    totalAmount 
  } = useCart();

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (cart.length === 0) {
    return (
      <Container style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Button
          title="Start Shopping"
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        />
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        ListFooterComponent={
          <CartSummary
            subtotal={totalAmount}
            onCheckout={handleCheckout}
          />
        }
        contentContainerStyle={styles.list}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: SIZES.large,
  },
  shopButton: {
    minWidth: 200,
  },
  list: {
    padding: SIZES.medium,
  },
});

export default CartScreen;
```

```javascript
// src/single/screens/index.js
export { default as HomeScreen } from './Home/HomeScreen';
export { default as ProductsListScreen } from './Products/ProductsListScreen';
export { default as ProductDetailScreen } from './Products/ProductDetailScreen';
export { default as CartScreen } from './Cart/CartScreen';
export { default as CheckoutScreen } from './Checkout/CheckoutScreen';
export { default as MyOrdersScreen } from './Orders/MyOrdersScreen';
export { default as OrderDetailScreen } from './Orders/OrderDetailScreen';
export { default as ProfileScreen } from './Profile/ProfileScreen';
export { default as FavoritesScreen } from './Favorites/FavoritesScreen';
export { default as LoginScreen } from './Auth/LoginScreen';
export { default as RegisterScreen } from './Auth/RegisterScreen';
```

## 5. Navigation Architecture

### Root Navigator (App Selection)
```javascript
// src/navigation/RootNavigator.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessNavigator } from '../business/navigation';
import { SingleNavigator } from '../single/navigation';

const RootNavigator = () => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      const token = await AsyncStorage.getItem('authToken');
      
      if (storedUserType && token) {
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Route to appropriate app based on user type
  if (userType === 'business') {
    return <BusinessNavigator />;
  }
  
  // Default to customer app
  return <SingleNavigator />;
};

export default RootNavigator;
```

### Business App Navigator
```javascript
// src/business/navigation/BusinessNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../common/hooks/useAuth';
import BusinessAuthNavigator from './BusinessAuthNavigator';
import BusinessTabNavigator from './BusinessTabNavigator';

const Stack = createNativeStackNavigator();

const BusinessNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="BusinessMain" component={BusinessTabNavigator} />
      ) : (
        <Stack.Screen name="BusinessAuth" component={BusinessAuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default BusinessNavigator;
```

```javascript
// src/business/navigation/BusinessTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DashboardScreen,
  OrdersListScreen,
  ProductsListScreen,
  AnalyticsScreen,
  SettingsScreen,
} from '../screens';
import { COLORS } from '../../common/constants';

const Tab = createBottomTabNavigator();

const BusinessTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        }}
      />
      
      <Tab.Screen
        name="Orders"
        component={OrdersListScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>📦</Text>,
        }}
      />
      
      <Tab.Screen
        name="Products"
        component={ProductsListScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏷️</Text>,
        }}
      />
      
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>📈</Text>,
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default BusinessTabNavigator;
```

```javascript
// src/business/navigation/BusinessAuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BusinessLoginScreen, BusinessRegisterScreen } from '../screens';

const Stack = createNativeStackNavigator();

const BusinessAuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BusinessLogin" 
        component={BusinessLoginScreen}
        options={{ title: 'Business Login' }}
      />
      <Stack.Screen 
        name="BusinessRegister" 
        component={BusinessRegisterScreen}
        options={{ title: 'Business Registration' }}
      />
    </Stack.Navigator>
  );
};

export default BusinessAuthNavigator;
```

```javascript
// src/business/navigation/index.js
export { default as BusinessNavigator } from './BusinessNavigator';
export { default as BusinessTabNavigator } from './BusinessTabNavigator';
export { default as BusinessAuthNavigator } from './BusinessAuthNavigator';
```

### Single (Customer) App Navigator
```javascript
// src/single/navigation/SingleNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../common/hooks/useAuth';
import SingleAuthNavigator from './SingleAuthNavigator';
import SingleTabNavigator from './SingleTabNavigator';

const Stack = createNativeStackNavigator();

const SingleNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="SingleMain" component={SingleTabNavigator} />
      ) : (
        <Stack.Screen name="SingleAuth" component={SingleAuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default SingleNavigator;
```

```javascript
// src/single/navigation/SingleTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  ProductsListScreen,
  CartScreen,
  FavoritesScreen,
  ProfileScreen,
} from '../screens';
import { COLORS } from '../../common/constants';
import { useCart } from '../hooks/useCart';

const Tab = createBottomTabNavigator();

const SingleTabNavigator = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      
      <Tab.Screen
        name="Shop"
        component={ProductsListScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🛍️</Text>,
        }}
      />
      
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🛒</Text>,
          tabBarBadge: itemCount > 0 ? itemCount : null,
        }}
      />
      
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>❤️</Text>,
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default SingleTabNavigator;
```

```javascript
// src/single/navigation/SingleAuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../screens';

const Stack = createNativeStackNavigator();

const SingleAuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
};

export default SingleAuthNavigator;
```

```javascript
// src/single/navigation/index.js
export { default as SingleNavigator } from './SingleNavigator';
export { default as SingleTabNavigator } from './SingleTabNavigator';
export { default as SingleAuthNavigator } from './SingleAuthNavigator';
```

### App.js Entry Point
```javascript
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/common/context/AuthContext';
import { ThemeProvider } from './src/common/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default App;
```

## 6. Shared Utilities & Common Hooks

### Common Utility Functions
```javascript
// src/common/utils/validation.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// src/common/utils/formatting.js
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString();
  } else if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleString();
};

// src/common/utils/index.js
export * from './validation';
export * from './formatting';
export * from './stringHelpers';
export * from './arrayHelpers';
```

### Common Hooks (Used by Both Apps)
```javascript
// src/common/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// src/common/hooks/index.js
export { useApi } from './useApi';
export { useAuth } from './useAuth';
export { useDebounce } from './useDebounce';
export { useKeyboard } from './useKeyboard';
export { useTheme } from './useTheme';
```

## 7. Custom Hooks for API Calls
import { useState, useEffect } from 'react';

export const useApi = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...params) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...params);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute, refetch: execute };
};

// Usage in screen:
// const { data: products, loading, error, refetch } = useApi(productService.getProducts);
```

## 8. Best Practices for Multi-App Architecture

### Component Guidelines
1. **Common vs App-Specific**: Place truly reusable components in `common/components`, app-specific ones in their respective app folders
2. **Single Responsibility**: Each component should do one thing well
3. **Props Validation**: Use PropTypes or TypeScript for type checking
4. **Default Props**: Always provide default values for optional props
5. **Naming**: Use PascalCase for components, camelCase for functions
6. **File Organization**: One component per file
7. **Import from Common**: App-specific components should import common components, never the reverse

### Service Guidelines
1. **Shared Services**: Auth, user, and notification services go in `common/services`
2. **App-Specific Services**: Business operations and customer operations in their respective folders
3. **Error Handling**: Always wrap API calls in try-catch
4. **Consistent Response**: Return standardized { success, data, error } format
5. **Authentication**: Handle token management in common API client interceptors
6. **Reuse API Client**: Both apps use the same `common/services/api/apiClient.js`

### Screen Guidelines
1. **Separation**: Keep business and single screens completely separate
2. **Business Logic**: Keep complex logic in custom hooks or services
3. **Loading States**: Always show loading indicators
4. **Error States**: Display user-friendly error messages
5. **Empty States**: Handle empty data gracefully
6. **Component Reuse**: Import common components, not cross-app components

### Navigation Guidelines
1. **Root Navigation**: Use RootNavigator to switch between Business and Single apps
2. **User Type**: Store user type in AsyncStorage to determine which app to show
3. **Auth State**: Each app has its own Auth navigator for login/register
4. **Deep Linking**: Configure deep links for both apps separately
5. **Tab Icons**: Use different icons for Business vs Single to maintain unique identities

### Utility & Hook Guidelines
1. **Common Utilities**: Place shared utility functions in `common/utils`
2. **Common Hooks**: Place shared hooks (useApi, useAuth, useDebounce) in `common/hooks`
3. **App-Specific Hooks**: Create app-specific hooks (useCart, useOrders) in their respective folders
4. **No Cross-Imports**: Business hooks should never import from Single, and vice versa
5. **Share Through Common**: If both apps need something, elevate it to `common`

### Code Quality Rules
1. **No Magic Numbers**: Use constants for all hardcoded values
2. **DRY Principle**: Don't repeat yourself - extract common logic to `common` folder
3. **Meaningful Names**: Use descriptive variable and function names
4. **Comments**: Comment complex logic, not obvious code
5. **Consistent Formatting**: Use ESLint and Prettier
6. **Path Aliases**: Use absolute imports for better readability

### File Organization Rules
1. **Common First**: When creating new code, ask "Can both apps use this?"
2. **Move Up When Needed**: If both apps need something, move it to `common`
3. **Keep Specific Separate**: Don't pollute `common` with app-specific code
4. **Index Exports**: Always create `index.js` files for clean imports
5. **Grouping**: Group related files in subdirectories

### Constants Organization
```javascript
// src/common/constants/colors.js - Shared colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
};

// src/common/constants/sizes.js - Shared sizes
export const SIZES = {
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
  borderRadius: 8,
};

// src/business/constants/routes.js - Business routes
export const BUSINESS_ROUTES = {
  DASHBOARD: 'Dashboard',
  ORDERS: 'Orders',
  ORDER_DETAIL: 'OrderDetail',
  PRODUCTS: 'Products',
  ADD_PRODUCT: 'AddProduct',
  ANALYTICS: 'Analytics',
};

// src/single/constants/routes.js - Customer routes
export const SINGLE_ROUTES = {
  HOME: 'Home',
  SHOP: 'Shop',
  PRODUCT_DETAIL: 'ProductDetail',
  CART: 'Cart',
  CHECKOUT: 'Checkout',
  PROFILE: 'Profile',
};
```

## 9. Testing Structure

```javascript
// src/common/components/ui/__tests__/Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} />);
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <Button title="Click Me" loading={true} testID="loading-button" />
    );
    expect(getByTestId('loading-button')).toBeTruthy();
  });
});
```

## 10. Quick Start Guide

### Setting Up a New Feature

**For Business App:**
1. Create screen in `src/business/screens/[FeatureName]/`
2. Create components in `src/business/components/[FeatureName]/`
3. Create service in `src/business/services/[featureName]Service.js`
4. Create hook (if needed) in `src/business/hooks/use[FeatureName].js`
5. Add route to `src/business/navigation/`
6. Export everything through index files

**For Single App:**
1. Create screen in `src/single/screens/[FeatureName]/`
2. Create components in `src/single/components/[FeatureName]/`
3. Create service in `src/single/services/[featureName]Service.js`
4. Create hook (if needed) in `src/single/hooks/use[FeatureName].js`
5. Add route to `src/single/navigation/`
6. Export everything through index files

**For Shared Functionality:**
1. Add to `src/common/components/` for UI components
2. Add to `src/common/services/` for API services
3. Add to `src/common/hooks/` for reusable hooks
4. Add to `src/common/utils/` for utility functions

### Import Examples

```javascript
// Importing common components (from anywhere)
import { Button, Input, Card } from '../../common/components';

// Importing common services (from anywhere)
import { authService, userService } from '../../common/services';

// Importing common hooks (from anywhere)
import { useApi, useAuth } from '../../common/hooks';

// Importing business components (within business app only)
import { StatCard, OrderCard } from '../components';

// Importing business services (within business app only)
import { orderService, productService } from '../services';

// Importing single components (within single app only)
import { ProductCard, CartItem } from '../components';

// Importing single services (within single app only)
import { cartService, wishlistService } from '../services';
```

## Summary

This multi-app architecture provides:

✅ **Clear Separation**: Business and Single apps are completely separate
✅ **Code Reusability**: Common components, services, and utilities shared efficiently
✅ **Scalability**: Easy to add new features to either app independently
✅ **Maintainability**: Clear structure makes code easy to understand and modify
✅ **Flexibility**: Can deploy as single app or separate apps
✅ **Type Safety**: Can easily add TypeScript to any layer
✅ **Team Collaboration**: Teams can work on Business and Single apps independently
✅ **Clean Architecture**: Proper separation of concerns at every level
✅ **Easy Testing**: Clear boundaries make unit and integration testing straightforward
✅ **Performance**: Only load what's needed for each app

### Key Principles to Remember:

1. **Common First**: Ask "Can both apps use this?" before creating app-specific code
2. **No Cross-Imports**: Business never imports from Single, and vice versa
3. **Share Through Common**: Elevate shared code to `common` folder
4. **One Component, One File**: Keep files focused and manageable
5. **Consistent Patterns**: Follow the same patterns throughout the codebase
6. **Export Through Index**: Always create clean export paths
7. **Service Layer**: All API calls go through services, never directly in components
8. **Hooks for Logic**: Extract complex logic into custom hooks
9. **Constants for Values**: Never hardcode values that might change
10. **Test Everything**: Write tests for common components and critical business logic

Follow these patterns consistently across your React Native multi-app application for maximum maintainability, scalability, and developer experience!

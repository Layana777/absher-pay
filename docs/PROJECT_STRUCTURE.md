# Project Structure

This document outlines the complete folder structure of the Absher Pay application.

## Overview

```
absher-pay/
├── src/                          # Source code
│   ├── common/                   # Shared across both apps
│   ├── business/                 # Business side application
│   ├── single/                   # Customer side application
│   └── navigation/               # Root navigation
├── assets/                       # Static assets
├── docs/                         # Documentation
├── App.js                        # Main app entry point
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS configuration
├── babel.config.js               # Babel configuration
└── README.md                     # Project readme
```

## Detailed Structure

### Common (Shared)
```
src/common/
├── components/
│   ├── ui/                      # UI components (Button, Input, Card, etc.)
│   ├── layout/                  # Layout components (Container, Row, Column)
│   ├── forms/                   # Form components (TextInput, Checkbox, etc.)
│   └── index.js                 # Main export
│
├── services/
│   ├── firebase/                # Firebase configuration & services
│   │   ├── firebaseConfig.js    # Firebase initialization
│   │   ├── databasePaths.js     # Database path constants
│   │   └── index.js
│   ├── api/                     # API services
│   ├── storage/                 # AsyncStorage helpers
│   └── index.js
│
├── hooks/                       # Custom hooks (useApi, useAuth, useDebounce)
├── utils/                       # Utility functions (validation, formatting, i18n)
├── constants/                   # Constants (colors, sizes, fonts)
├── context/                     # Context providers (ThemeContext, AuthContext)
└── assets/                      # Shared assets (images, icons, fonts)
```

### Business Side
```
src/business/
├── components/
│   ├── Dashboard/               # Dashboard components (StatCard, SalesChart)
│   ├── Orders/                  # Order components (OrderCard, OrderFilter)
│   ├── Products/                # Product components (ProductForm)
│   └── index.js
│
├── screens/
│   ├── Dashboard/               # Dashboard screen
│   ├── Orders/                  # Orders screens (List, Detail)
│   ├── Products/                # Products screens (List, Detail, Add)
│   ├── Inventory/               # Inventory screen
│   ├── Analytics/               # Analytics screen
│   ├── Settings/                # Settings screen
│   ├── Auth/                    # Auth screens (Login, Register)
│   └── index.js
│
├── navigation/                  # Business navigation
│   ├── BusinessNavigator.js
│   ├── BusinessTabNavigator.js
│   ├── BusinessAuthNavigator.js
│   └── index.js
│
├── services/                    # Business services
│   ├── orderService.js
│   ├── productService.js
│   ├── inventoryService.js
│   ├── analyticsService.js
│   └── index.js
│
├── hooks/                       # Business hooks (useOrders, useProducts, useInventory)
├── constants/                   # Business constants (routes, orderStatus)
└── context/                     # Business context (BusinessContext)
```

### Customer Side
```
src/single/
├── components/
│   ├── Home/                    # Home components (CategoryCard, FeaturedProduct, Banner)
│   ├── Products/                # Product components (ProductCard, ProductGrid, ProductFilter)
│   ├── Cart/                    # Cart components (CartItem, CartSummary)
│   ├── Checkout/                # Checkout components (AddressForm, PaymentMethod)
│   └── index.js
│
├── screens/
│   ├── Home/                    # Home screen
│   ├── Products/                # Product screens (List, Detail)
│   ├── Cart/                    # Cart screen
│   ├── Checkout/                # Checkout screen
│   ├── Orders/                  # Orders screens (MyOrders, Detail)
│   ├── Profile/                 # Profile screens (Profile, EditProfile)
│   ├── Favorites/               # Favorites screen
│   ├── Auth/                    # Auth screens (Login, Register, ForgotPassword)
│   └── index.js
│
├── navigation/                  # Customer navigation
│   ├── SingleNavigator.js
│   ├── SingleTabNavigator.js
│   ├── SingleAuthNavigator.js
│   └── index.js
│
├── services/                    # Customer services
│   ├── cartService.js
│   ├── wishlistService.js
│   ├── checkoutService.js
│   └── index.js
│
├── hooks/                       # Customer hooks (useCart, useWishlist, useCheckout)
├── constants/                   # Customer constants (routes, categories)
└── context/                     # Customer context (CartContext, WishlistContext)
```

### Navigation
```
src/navigation/
├── RootNavigator.js            # Root navigation (switches between Business/Single)
└── index.js
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.js`, `ProductCard.js`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `HomeScreen.js`, `DashboardScreen.js`)
- **Services**: camelCase with "Service" suffix (e.g., `authService.js`, `cartService.js`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.js`, `useCart.js`)
- **Context**: PascalCase with "Context" suffix (e.g., `ThemeContext.js`, `AuthContext.js`)
- **Utils**: camelCase (e.g., `validation.js`, `formatting.js`)
- **Constants**: camelCase (e.g., `colors.js`, `sizes.js`)

## Import Path Examples

### Common Components
```javascript
import { Button, Input, Card } from '../../common/components';
```

### Common Services
```javascript
import { database, auth, DB_PATHS } from '../../common/services';
```

### Common Hooks
```javascript
import { useAuth, useApi } from '../../common/hooks';
```

### Business Components (within business app)
```javascript
import { StatCard, OrderCard } from '../components';
```

### Single Components (within single app)
```javascript
import { ProductCard, CartItem } from '../components';
```

## Key Principles

1. **Separation of Concerns**: Business and Single apps are completely separate
2. **Code Reusability**: Common components/services/utilities are shared
3. **Clear Boundaries**: No cross-imports between Business and Single
4. **Scalability**: Easy to add new features to either app
5. **Maintainability**: Clear structure makes code easy to find and modify

## Adding New Features

### For Business App
1. Create screen in `src/business/screens/[FeatureName]/`
2. Create components in `src/business/components/[FeatureName]/`
3. Create service in `src/business/services/[featureName]Service.js`
4. Create hook (if needed) in `src/business/hooks/use[FeatureName].js`
5. Add navigation route
6. Export through index files

### For Customer App
1. Create screen in `src/single/screens/[FeatureName]/`
2. Create components in `src/single/components/[FeatureName]/`
3. Create service in `src/single/services/[featureName]Service.js`
4. Create hook (if needed) in `src/single/hooks/use[FeatureName].js`
5. Add navigation route
6. Export through index files

### For Shared Functionality
1. Add to `src/common/components/` for UI components
2. Add to `src/common/services/` for services
3. Add to `src/common/hooks/` for hooks
4. Add to `src/common/utils/` for utilities

---

For more details, see the [Clean Architecture Skill Guide](./react-native-clean-architecture-skill.md)

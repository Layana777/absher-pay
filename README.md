# Absher Pay - React Native Multi-App Architecture

A scalable React Native application with clean architecture supporting both Business and Customer sides.

## 🏗️ Architecture

This project follows a **multi-app clean architecture** with:
- **Business Side**: Dashboard, orders, products, inventory, analytics
- **Customer Side**: Shopping, cart, checkout, orders, profile
- **Shared Common Layer**: Components, services, utilities, hooks

## 📁 Project Structure

```
src/
├── common/                    # Shared across both apps
│   ├── components/           # Reusable UI components
│   ├── services/             # Firebase & API services
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utility functions
│   ├── constants/            # App constants (colors, sizes, fonts)
│   ├── context/              # Context providers
│   └── assets/               # Images, icons, fonts
│
├── business/                 # Business side application
│   ├── components/           # Business-specific components
│   ├── screens/              # Business screens
│   ├── navigation/           # Business navigation
│   ├── services/             # Business services
│   ├── hooks/                # Business hooks
│   ├── constants/            # Business constants
│   └── context/              # Business context
│
├── single/                   # Customer side application
│   ├── components/           # Customer-specific components
│   ├── screens/              # Customer screens
│   ├── navigation/           # Customer navigation
│   ├── services/             # Customer services
│   ├── hooks/                # Customer hooks
│   ├── constants/            # Customer constants
│   └── context/              # Customer context
│
└── navigation/               # Root navigation
    └── RootNavigator.js      # Switches between Business/Customer
```

## 🚀 Tech Stack

- **Framework**: React Native (Expo)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Database**: Firebase Realtime Database
- **Navigation**: React Navigation
- **State Management**: Context API
- **Internationalization**: i18next (RTL support)
- **Storage**: AsyncStorage

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd absher-pay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Copy your Firebase configuration
   - Update `src/common/services/firebase/firebaseConfig.js` with your credentials

4. **Start the development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### NativeWind Setup
NativeWind is already configured in:
- `tailwind.config.js` - Tailwind configuration
- `babel.config.js` - Babel plugin for NativeWind

### RTL Support
RTL is configured using i18next. Language can be switched in the app settings.
- Default language: Arabic (RTL)
- Fallback language: English (LTR)

### Firebase Configuration
Update the following file with your Firebase credentials:
```javascript
// src/common/services/firebase/firebaseConfig.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Features

### Business Side
- Dashboard with analytics
- Order management
- Product management
- Inventory tracking
- Sales analytics
- Business settings

### Customer Side
- Product browsing
- Shopping cart
- Wishlist/Favorites
- Checkout process
- Order tracking
- User profile

### Shared Features
- Authentication (Login/Register)
- Real-time updates (Firebase)
- Notifications
- Multi-language support (Arabic/English)
- RTL support
- Theme switching (Light/Dark)

## 🎨 Styling

This project uses **NativeWind** for styling. Use Tailwind CSS classes directly in your components:

```jsx
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-bold text-primary">Hello World</Text>
  <Button className="bg-primary py-3 px-6 rounded-lg" />
</View>
```

### Theme Colors
Available in `src/common/constants/colors.js`:
- Primary: `#007AFF`
- Secondary: `#5856D6`
- Success: `#34C759`
- Danger: `#FF3B30`
- Warning: `#FF9500`

## 📚 Documentation

Detailed architecture documentation is available in:
- `docs/react-native-clean-architecture-skill.md` - Complete architecture guide

## 🧪 Development

### Adding a New Feature (Business)
1. Create screen in `src/business/screens/[FeatureName]/`
2. Create components in `src/business/components/[FeatureName]/`
3. Create service in `src/business/services/[featureName]Service.js`
4. Add navigation route in `src/business/navigation/`
5. Export through index files

### Adding a New Feature (Customer)
1. Create screen in `src/single/screens/[FeatureName]/`
2. Create components in `src/single/components/[FeatureName]/`
3. Create service in `src/single/services/[featureName]Service.js`
4. Add navigation route in `src/single/navigation/`
5. Export through index files

### Shared Components
Place truly reusable components in `src/common/components/`

## 🌐 Internationalization

Switch between languages:
```javascript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
i18n.changeLanguage('ar'); // Switch to Arabic
i18n.changeLanguage('en'); // Switch to English
```

## 🔒 Firebase Security Rules

Make sure to configure proper security rules for your Firebase Realtime Database.

## 📄 License

This project is private and proprietary.

## 👥 Contributors

- Your Name / Team

## 🆘 Support

For issues and questions, please contact the development team.

---

Built with ❤️ using React Native & Clean Architecture

# Quick Start Guide

Get started with Absher Pay in minutes!

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd absher-pay

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Firebase Services**
   - **Authentication**: Enable Email/Password authentication
   - **Realtime Database**: Create a database
   - **Storage**: Enable for file uploads

3. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

4. **Update Configuration**
   - Open `src/common/services/firebase/firebaseConfig.js`
   - Replace the placeholder values with your Firebase config:
   ```javascript
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

### 3. Start Development Server

```bash
# Start the Expo development server
npm start

# Or with yarn
yarn start
```

This will open the Expo Developer Tools in your browser.

### 4. Run on Device/Emulator

**iOS (Mac only)**
```bash
npm run ios
# Or press 'i' in the Expo terminal
```

**Android**
```bash
npm run android
# Or press 'a' in the Expo terminal
```

**Expo Go App**
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Scan the QR code from the terminal
3. App will load on your device

## Project Structure Overview

```
src/
├── common/          # Shared code (components, services, hooks)
├── business/        # Business side (dashboard, orders, products)
├── single/          # Customer side (shopping, cart, checkout)
└── navigation/      # Root navigation
```

## Configuration Files

### Tailwind CSS
`tailwind.config.js` - Configure theme colors, spacing, fonts

### Babel
`babel.config.js` - Babel configuration with NativeWind plugin

### Package
`package.json` - Dependencies and scripts

## Available Scripts

```bash
# Start development server
npm start

# Start with cleared cache
npm start -- --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Environment Setup

### RTL Support
The app supports RTL (Right-to-Left) for Arabic language.
- Default language: Arabic (RTL)
- Change in: `src/common/utils/i18n.js`

### Theme
Theme configuration is in:
- Colors: `src/common/constants/colors.js`
- Sizes: `src/common/constants/sizes.js`
- Fonts: `src/common/constants/fonts.js`

## Next Steps

### 1. Set Up Firebase Security Rules
Add security rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "business": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('userType').val() === 'business'"
    },
    "products": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('userType').val() === 'business'"
    },
    "carts": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 2. Create Your First Component

**Common Component Example:**
```javascript
// src/common/components/ui/Card.js
import React from 'react';
import { View } from 'react-native';

const Card = ({ children, className }) => {
  return (
    <View className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
};

export default Card;
```

**Export it:**
```javascript
// src/common/components/ui/index.js
export { default as Button } from './Button';
export { default as Card } from './Card'; // Add this line
```

### 3. Create Your First Screen

**Business Screen Example:**
```javascript
// src/business/screens/Dashboard/DashboardScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../../common/components';

const DashboardScreen = () => {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-text mb-4">
        Dashboard
      </Text>
      <Button title="Click Me" onPress={() => alert('Hello!')} />
    </View>
  );
};

export default DashboardScreen;
```

### 4. Add Navigation

See navigation examples in:
- `src/navigation/RootNavigator.js`
- `src/business/navigation/`
- `src/single/navigation/`

## Common Issues & Solutions

### Issue: Metro bundler not starting
**Solution:**
```bash
npm start -- --clear
# Or delete .expo folder and restart
```

### Issue: Firebase not connecting
**Solution:**
- Check Firebase configuration in `firebaseConfig.js`
- Ensure Firebase services are enabled in console
- Check internet connection

### Issue: Styles not applying
**Solution:**
- Ensure NativeWind is configured in `babel.config.js`
- Restart Metro bundler
- Clear cache: `npm start -- --clear`

### Issue: RTL not working
**Solution:**
- Check `i18n.js` configuration
- Ensure language is set correctly
- Restart the app after changing language

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation Docs](https://reactnavigation.org/)

## Support

For issues and questions:
1. Check the [documentation](./react-native-clean-architecture-skill.md)
2. Review the [project structure](./PROJECT_STRUCTURE.md)
3. Contact the development team

## What's Next?

- [ ] Configure Firebase Security Rules
- [ ] Set up authentication flows
- [ ] Create business screens
- [ ] Create customer screens
- [ ] Add real-time data sync
- [ ] Implement push notifications
- [ ] Add payment integration
- [ ] Set up analytics

---

Happy coding! 🚀

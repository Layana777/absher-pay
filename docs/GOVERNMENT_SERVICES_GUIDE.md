# Government Services Guide

This guide explains the Government Services feature in Absher Pay, which enables users to pay for various Saudi Arabian government services directly through the application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Structure](#data-structure)
- [Available Services](#available-services)
- [Implementation Guide](#implementation-guide)
- [Seeding Data](#seeding-data)
- [API Reference](#api-reference)
- [Adding New Services](#adding-new-services)

---

## Overview

The Government Services feature provides a centralized system for managing and processing payments for Saudi Arabian government services. Services are organized by ministry and category, making it easy for users to find and pay for the services they need.

### Key Features

- **Comprehensive Coverage**: Includes services from multiple ministries (MOI, MOC)
- **Bilingual Support**: All services available in Arabic and English
- **User Type Filtering**: Services filtered by user type (Personal/Business)
- **Detailed Information**: Each service includes fees, processing time, and required documents
- **Extensible**: Easy to add new services and ministries

---

## Architecture

### File Structure

```
src/common/services/firebase/
├── databasePaths.js              # Database path constants
├── governmentServicesData.js     # Service data structure
└── firebaseConfig.js             # Firebase configuration

scripts/
└── seedGovernmentServices.mjs    # Seeding script

docs/
└── GOVERNMENT_SERVICES_GUIDE.md  # This file
```

### Database Structure

Government services are stored in Firebase Realtime Database under the `governmentServices` node:

```
governmentServices/
├── passports/
│   ├── nameAr: "جوازات السفر"
│   ├── nameEn: "Passports"
│   ├── category: "moi_passports"
│   ├── ministry: "MOI"
│   ├── icon: "🛂"
│   └── subTypes/
│       ├── issue_new_passport/
│       │   ├── nameAr: "إصدار جواز سفر جديد"
│       │   ├── fee: 300.00
│       │   └── ...
│       └── renew_passport/
│           └── ...
├── traffic/
├── civil_affairs/
└── commerce/
```

---

## Data Structure

### Service Object

Each government service has the following structure:

```javascript
{
  nameAr: string,              // Arabic name
  nameEn: string,              // English name
  category: string,            // Category identifier
  icon: string,                // Emoji or icon identifier
  ministry: string,            // Ministry code (MOI, MOC, etc.)
  ministryName: {
    ar: string,
    en: string
  },
  description: {
    ar: string,
    en: string
  },
  subTypes: {                  // Available operations
    [subTypeId]: SubType
  }
}
```

### SubType Object

Each sub-type (specific service operation) has:

```javascript
{
  nameAr: string,
  nameEn: string,
  fee: number,                 // Fee in SAR
  currency: "SAR",
  availableFor: string[],      // ["personal"] or ["business"] or both
  processingTime: string,      // e.g., "instant", "3-5 business days"
  icon: string,
  description: {
    ar: string,
    en: string
  },
  requiredDocuments: [         // Optional
    {
      ar: string,
      en: string
    }
  ]
}
```

---

## Available Services

### 1. Ministry of Interior (MOI)

#### Passports (جوازات السفر)
- **Issue New Passport** - 300 SAR
- **Renew Passport** - 300 SAR
- **Issue Driving License** - 400 SAR
- **Renew Driving License** - 200 SAR

#### Traffic Department (إدارة المرور)
- **Traffic Violations** - Variable fees
  - Minor Speeding: 150 SAR
  - Major Speeding: 500 SAR
  - Red Light Violation: 300 SAR
  - No Seatbelt: 150 SAR
  - Parking Violation: 100 SAR
  - Using Phone While Driving: 500 SAR
- **Vehicle Registration Renewal** - 150 SAR
- **Periodic Vehicle Inspection** - 50 SAR

#### Civil Affairs (الأحوال المدنية)
- **Issue National ID** - 100 SAR
- **Renew National ID** - 100 SAR
- **Birth Certificate** - 50 SAR
- **Family Book** - 100 SAR
- **Marriage Certificate** - 50 SAR
- **Issue Iqama** - 2,000 SAR (Business only)
- **Renew Iqama** - 2,000 SAR (Business only)
- **Exit Re-entry Visa** - 200-500 SAR (Business only)

### 2. Ministry of Commerce (MOC)

#### Commerce Services (خدمات التجارة)
- **Commercial Registration** - 200 SAR (Business only)
- **Renew Commercial Registration** - 200 SAR (Business only)
- **Business License** - 300 SAR (Business only)

---

## Implementation Guide

### 1. Importing Services Data

```javascript
import GOVERNMENT_SERVICES_DATA, {
  getServiceCategories,
  getServicesByMinistry,
  getServicesForUserType,
  MINISTRIES
} from '../common/services/firebase/governmentServicesData';
```

### 2. Getting All Services

```javascript
// Get all services
const allServices = GOVERNMENT_SERVICES_DATA;

// Get service categories (keys)
const categories = getServiceCategories();
// Returns: ['passports', 'traffic', 'civil_affairs', ...]
```

### 3. Filtering Services

```javascript
// Get services for personal users only
const personalServices = getServicesForUserType('personal');

// Get services for business users only
const businessServices = getServicesForUserType('business');

// Get services by ministry
const moiServices = getServicesByMinistry('MOI');
```

### 4. Accessing Service Data

```javascript
// Get a specific service
const passportService = GOVERNMENT_SERVICES_DATA.passports;

// Access sub-types
const renewPassport = passportService.subTypes.renew_passport;

// Get fee
const fee = renewPassport.fee; // 300.00

// Get processing time
const processingTime = renewPassport.processingTime; // "3-5 business days"

// Get required documents
const docs = renewPassport.requiredDocuments;
```

### 5. Displaying Services in UI

```javascript
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { getServicesForUserType } from '../services/firebase/governmentServicesData';

const ServicesScreen = ({ userType }) => {
  const services = getServicesForUserType(userType); // 'personal' or 'business'

  return (
    <FlatList
      data={Object.entries(services)}
      keyExtractor={([key]) => key}
      renderItem={({ item: [serviceKey, service] }) => (
        <View>
          <Text>{service.nameAr}</Text>
          <Text>{service.nameEn}</Text>
          <Text>{service.icon}</Text>
          {/* Render sub-types */}
          {Object.entries(service.subTypes).map(([subKey, subType]) => (
            <View key={subKey}>
              <Text>{subType.nameAr}</Text>
              <Text>{subType.fee} {subType.currency}</Text>
            </View>
          ))}
        </View>
      )}
    />
  );
};
```

### 6. Creating a Service Payment

```javascript
import { database } from '../services/firebase';
import { ref, push } from 'firebase/database';
import { DB_PATHS } from '../services/firebase/databasePaths';

async function processServicePayment(userId, walletId, serviceData) {
  const transactionData = {
    userId,
    walletId,
    serviceId: serviceData.serviceId,
    subTypeId: serviceData.subTypeId,
    amount: serviceData.fee,
    currency: 'SAR',
    status: 'pending',
    type: 'government_service',
    createdAt: Date.now(),
    metadata: {
      serviceName: serviceData.serviceName,
      subTypeName: serviceData.subTypeName,
      ministry: serviceData.ministry
    }
  };

  const transactionRef = ref(
    database,
    DB_PATHS.WALLET_TRANSACTIONS(walletId)
  );

  return await push(transactionRef, transactionData);
}
```

---

## Seeding Data

### Running the Seed Script

To populate Firebase with all government services:

```bash
node scripts/seedGovernmentServices.mjs
```

### Script Features

- ✅ Validates data structure before seeding
- ✅ Shows detailed statistics
- ✅ Adds metadata (createdAt, updatedAt, isActive)
- ✅ Can be run multiple times (updates existing data)
- ✅ Provides detailed progress and error reporting

### Expected Output

```
🌱 Starting Government Services seeding process...
======================================================================
🔍 Validating data structure...
   ✅ Data structure is valid

📊 DATA STATISTICS
======================================================================
   Total Services: 4
   Total Sub-types: 20
   Services by Ministry:
      - MOI: 3
      - MOC: 1
   Services by User Type:
      - Personal: 12
      - Business: 13
======================================================================

🌱 Seeding services to Firebase...

📝 Seeding: Passports (passports)
   ✅ Successfully seeded
...

📈 SEEDING SUMMARY
======================================================================
✅ Seeded: 4
❌ Failed: 0
📊 Total: 4
======================================================================

✨ Government services successfully seeded to Firebase!
```

---

## API Reference

### Helper Functions

#### `getServiceCategories()`

Returns an array of all service category keys.

```javascript
const categories = getServiceCategories();
// ['passports', 'traffic', 'civil_affairs', 'commerce']
```

#### `getServicesByMinistry(ministry: string)`

Returns all services from a specific ministry.

```javascript
const moiServices = getServicesByMinistry('MOI');
// Returns: { passports: {...}, traffic: {...}, civil_affairs: {...} }
```

**Parameters:**
- `ministry`: Ministry code ('MOI', 'MOC')

#### `getServicesForUserType(userType: string)`

Returns services available for a specific user type.

```javascript
const personalServices = getServicesForUserType('personal');
const businessServices = getServicesForUserType('business');
```

**Parameters:**
- `userType`: User type ('personal' or 'business')

### Database Paths

Use the predefined database paths from `databasePaths.js`:

```javascript
import { DB_PATHS } from '../services/firebase/databasePaths';

// All services
DB_PATHS.GOVERNMENT_SERVICES // 'governmentServices'

// Specific service
DB_PATHS.GOVERNMENT_SERVICE('passports') // 'governmentServices/passports'

// Service category
DB_PATHS.GOVERNMENT_SERVICE_CATEGORY('moi_passports')

// Specific sub-type
DB_PATHS.GOVERNMENT_SERVICE_SUBTYPE('passports', 'renew_passport')
// 'governmentServices/passports/subTypes/renew_passport'
```

---

## Adding New Services

### Step 1: Add to Data File

Edit `src/common/services/firebase/governmentServicesData.js`:

```javascript
export const GOVERNMENT_SERVICES_DATA = {
  // ... existing services

  // New service
  new_service: {
    nameAr: "اسم الخدمة",
    nameEn: "Service Name",
    category: "category_code",
    icon: "📋",
    ministry: "MINISTRY_CODE",
    ministryName: {
      ar: "اسم الوزارة",
      en: "Ministry Name"
    },
    description: {
      ar: "وصف الخدمة",
      en: "Service description"
    },
    subTypes: {
      sub_type_1: {
        nameAr: "نوع فرعي",
        nameEn: "Sub Type",
        fee: 100.00,
        currency: "SAR",
        availableFor: ["personal"], // or ["business"] or both
        processingTime: "instant",
        icon: "📝",
        description: {
          ar: "وصف النوع الفرعي",
          en: "Sub type description"
        },
        requiredDocuments: [
          { ar: "مستند 1", en: "Document 1" }
        ]
      }
    }
  }
};
```

### Step 2: Add Ministry (if new)

If adding a service from a new ministry, add it to the `MINISTRIES` object:

```javascript
export const MINISTRIES = {
  // ... existing ministries

  NEW_CODE: {
    code: "NEW_CODE",
    nameAr: "اسم الوزارة",
    nameEn: "Ministry Name",
    icon: "🏛️"
  }
};
```

### Step 3: Run Seed Script

```bash
node scripts/seedGovernmentServices.mjs
```

The script will automatically:
- Validate the new service structure
- Seed it to Firebase
- Report success or errors

### Step 4: Verify in Firebase Console

1. Go to Firebase Console
2. Navigate to Realtime Database
3. Check `governmentServices/your_new_service`
4. Verify all fields are present

---

## Best Practices

### 1. Data Consistency

- Always use bilingual content (Arabic and English)
- Keep fees in SAR (Saudi Riyals)
- Use consistent naming conventions for IDs

### 2. User Type Filtering

- Clearly mark services as `["personal"]`, `["business"]`, or both
- Business-only services: Iqama, Work Permits, Commercial Registration
- Personal-only services: Most citizen services
- Both: Some legal services (Power of Attorney, Property Deeds)

### 3. Processing Time

Use consistent terminology:
- "instant" - Immediate processing
- "same day" - Within 24 hours
- "1-3 business days" - Specific timeframe
- "5-7 business days" - Longer processing

### 4. Required Documents

- Always provide bilingual document names
- List only essential documents
- Keep the list concise and clear

### 5. Icons

- Use relevant emoji icons for visual identification
- Keep icons consistent across similar services
- Icons help users quickly identify services

---

## Troubleshooting

### Common Issues

#### Issue: Data not appearing in app

**Solution:**
1. Check Firebase connection
2. Verify database rules allow read access
3. Check the database path is correct
4. Ensure data was seeded successfully

#### Issue: Missing translations

**Solution:**
- All services must have both `nameAr` and `nameEn`
- Check the data structure for missing language fields
- Run validation before seeding

#### Issue: Wrong user type sees unavailable services

**Solution:**
- Use `getServicesForUserType()` to filter services
- Check `availableFor` array in sub-types
- Implement proper filtering in UI components

---

## Future Enhancements

Potential features to add:

1. **Service Status Tracking**: Track service request status in real-time
2. **Document Upload**: Allow users to upload required documents
3. **Appointment Booking**: Schedule appointments for services requiring in-person visits
4. **Service History**: Track user's past service requests
5. **Notifications**: Notify users when service is processed
6. **Multi-payment**: Pay for multiple services in one transaction
7. **Favorites**: Allow users to save frequently used services
8. **Search**: Full-text search across all services
9. **Filters**: Advanced filtering by ministry, fee range, processing time
10. **Service Bundles**: Package related services together with discounts

---

## Related Documentation

- [Firebase Configuration](../src/common/services/firebase/firebaseConfig.js)
- [Database Paths](../src/common/services/firebase/databasePaths.js)
- [Transaction Guide](./TRANSACTIONS_GUIDE.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Redux Guide](./REDUX_GUIDE.md)

---

## Support

For questions or issues:
1. Check this documentation
2. Review the data structure file
3. Check Firebase Console for data integrity
4. Verify database rules and permissions

---

**Last Updated:** December 2024
**Version:** 1.0.0

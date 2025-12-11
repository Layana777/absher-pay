# Absher Pay - Seeding Scripts

This directory contains seeding scripts for populating Firebase with test data for development and testing purposes.

## Available Scripts

1. **seedUsers.mjs** - Creates test users in Firebase Authentication and Database
2. **seedGovernmentServices.mjs** - Populates government services data in Firebase
3. **seedBills.mjs** - Generates government bills for users and wallets
4. **seedTransactions.mjs** - Creates transaction history for wallets

---

## Environment Setup

### Prerequisites

Before running any seeding scripts, you need to set up your environment variables:

1. **Copy the environment example file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Firebase credentials** to the `.env` file:
   ```env
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

### Security Notes

- **Never commit the `.env` file** to version control (it's already in `.gitignore`)
- The `.env.example` file contains placeholder values and should be committed
- All scripts will validate Firebase configuration before running
- If environment variables are missing, scripts will exit with an error message

---

# 1. Seed Users Script

This script creates test users in Firebase Authentication and Realtime Database for development and testing purposes.

## ⚠️ Important

**Users must be created via this script before they can log in.** The app no longer auto-creates users during login. This ensures better control over user data and security.

## Features

- ✅ Creates users in both Firebase Auth and Database
- ✅ Supports both Business and Single user types
- ✅ Auto-generates random Arabic names, cities, and phone numbers
- ✅ Easy to customize National IDs
- ✅ Same password for all users (for easy testing)
- ✅ Skips users that already exist
- ✅ Shows detailed progress and summary

## Prerequisites

- Node.js installed (v14 or higher)
- Firebase project configured
- Internet connection

## Configuration

### 1. Edit the USERS Array

Open `scripts/seedUsers.mjs` and modify the `USERS` array:

```javascript
const USERS = [
  { nationalId: "1234567890", isBusiness: true },
  { nationalId: "0987654321", isBusiness: true },
  { nationalId: "1122334455", isBusiness: false },
  { nationalId: "5544332211", isBusiness: false },
  // Add more users here
];
```

**Requirements:**
- National ID must be exactly 10 digits
- National ID must be unique
- Set `isBusiness: true` for business users
- Set `isBusiness: false` for individual/single users

### 2. Password

All users will be created with the same password: **1122334455**

You can change this by editing the `PASSWORD` constant in the script.

## Usage

### Run the Script

From the project root directory:

```bash
node scripts/seedUsers.mjs
```

### Expected Output

```
🌱 Starting user seeding process...
📊 Total users to create: 5
🔑 Password for all users: 1122334455
============================================================

📝 Creating user: 1234567890 (Business)
   Email: 1234567890@absher.business
   Name: محمد بن عبدالله العتيبي
   City: الرياض
   Phone: +96651234567
   ✅ Auth account created (UID: abc123...)
   ✅ Database record created
   ✓ User created successfully!

...

============================================================
📈 SEEDING SUMMARY
============================================================
✅ Created: 5
⚠️  Skipped (already exist): 0
❌ Failed: 0
📊 Total: 5
============================================================

✨ Users successfully seeded to Firebase!
🔑 Login with any National ID and password: 1122334455
```

## User Data Structure

Each user is created with the following fields:

```javascript
{
  uid: "firebase-generated-uid",
  nationalId: "1234567890",
  email: "1234567890@absher.business", // or @absher.pay for single users
  firstName: "محمد",                   // Random Arabic name
  middleName: "بن عبدالله",            // Random middle name
  lastName: "العتيبي",                 // Random family name
  city: "الرياض",                      // Random Saudi city
  phoneNumber: "+9665XXXXXXXX",         // Random phone number
  passCode: "0000",
  isActive: true,
  isBusiness: true,                    // or false
  createdAt: 1234567890,               // Timestamp
  lastLogin: 1234567890                // Timestamp
}
```

## Testing the Seeded Users

### Business Login

1. Open the app
2. Navigate to Business Login
3. Enter National ID: `1234567890` (or any business user you created)
4. Enter Password: `1122334455`
5. Click Login
6. Enter any 4-digit OTP
7. ✅ Logged in!

### Single User Login

1. Open the app
2. Navigate to Single Login
3. Enter National ID: `1122334455` (or any single user you created)
4. Enter Password: `1122334455`
5. Click Login
6. Enter any 4-digit OTP
7. ✅ Logged in!

## Troubleshooting

### Error: "Invalid National ID or Password" when logging in

This error appears when:
1. **User doesn't exist**: Run this script to create the user first
2. **Wrong password**: Make sure you're using `1122334455`
3. **Wrong National ID**: Check that the National ID matches exactly (10 digits)

**Solution**: Run the seed script to create users before attempting to log in.

### Error: "email-already-in-use"

This means the user already exists. The script will automatically skip them.

### Error: "PERMISSION_DENIED"

Your Firebase Realtime Database rules need to be updated. Make sure you have the correct rules set in Firebase Console:

```json
{
  "rules": {
    "users": {
      ".indexOn": ["phoneNumber", "email", "nationalId", "isBusiness"],
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Error: "Network request failed"

Check your internet connection and Firebase configuration.

### Script hangs or is very slow

This is normal. The script adds a 500ms delay between each user creation to avoid rate limiting.

## Tips

- **Start Small**: Test with 2-3 users first before creating many
- **Unique IDs**: Make sure all National IDs are unique (10 digits)
- **Re-run Safe**: You can run the script multiple times - it will skip existing users
- **Clean Database**: If you want to start fresh, delete users from Firebase Console

## Example National IDs for Testing

Here are some example 10-digit National IDs you can use:

```javascript
// Business users
{ nationalId: "1234567890", isBusiness: true }
{ nationalId: "2345678901", isBusiness: true }
{ nationalId: "3456789012", isBusiness: true }

// Single users
{ nationalId: "4567890123", isBusiness: false }
{ nationalId: "5678901234", isBusiness: false }
{ nationalId: "6789012345", isBusiness: false }
```

## Need Help?

If you encounter any issues:
1. Check the error message in the terminal
2. Verify your Firebase configuration
3. Ensure your internet connection is stable
4. Check Firebase Console for any issues

---

# 2. Seed Government Services Script

This script populates Firebase Realtime Database with all Saudi Arabian government services available through Absher Pay.

## Features

- ✅ Seeds all government services with complete data
- ✅ Organized by ministry and category
- ✅ Includes all sub-types, fees, and processing times
- ✅ Validates data structure before seeding
- ✅ Shows detailed statistics and progress
- ✅ Can be run multiple times (updates existing data)
- ✅ Bilingual support (Arabic and English)

## Prerequisites

- Node.js installed (v14 or higher)
- Firebase project configured
- Internet connection

## Services Included

### Ministry of Interior (MOI)
- **Passports** - Passport issuance and renewal, driving licenses
- **Traffic Department** - Traffic violations, vehicle registration
- **Civil Affairs** - National ID, birth certificates, family book, Iqama services, exit re-entry visas

### Ministry of Commerce (MOC)
- **Commerce Services** - Commercial registration, business licenses

## Usage

### Run the Script

From the project root directory:

```bash
node scripts/seedGovernmentServices.mjs
```

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
📝 Seeding: Traffic Department (traffic)
   ✅ Successfully seeded
...

======================================================================
📈 SEEDING SUMMARY
======================================================================
✅ Seeded: 6
❌ Failed: 0
📊 Total: 6
======================================================================

✨ Government services successfully seeded to Firebase!
🔍 Check Firebase Console to verify the data.
```

## Data Structure

Services are stored in Firebase under `governmentServices/`:

```
governmentServices/
├── passports/
│   ├── nameAr: "جوازات السفر"
│   ├── nameEn: "Passports"
│   ├── ministry: "MOI"
│   └── subTypes/
│       ├── issue_new_passport/
│       │   ├── fee: 300.00
│       │   └── ...
│       └── renew_passport/
├── traffic/
├── civil_affairs/
└── commerce/
```

## Verifying Seeded Data

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database**
4. Expand the `governmentServices` node
5. Verify all 4 services are present

### In the App

Services can be accessed using:

```javascript
import { database } from '../common/services/firebase';
import { ref, get } from 'firebase/database';

// Get all government services
const servicesRef = ref(database, 'governmentServices');
const snapshot = await get(servicesRef);
const services = snapshot.val();
```

## Adding New Services

To add new government services:

1. **Edit the data file**: `src/common/services/firebase/governmentServicesData.js`
2. **Add your service** following the existing structure
3. **Run the seed script** to update Firebase
4. **Verify** in Firebase Console

Example:

```javascript
// In governmentServicesData.js
export const GOVERNMENT_SERVICES_DATA = {
  // ... existing services

  new_service: {
    nameAr: "خدمة جديدة",
    nameEn: "New Service",
    category: "category_code",
    icon: "📋",
    ministry: "MOI",
    ministryName: {
      ar: "وزارة الداخلية",
      en: "Ministry of Interior"
    },
    subTypes: {
      sub_type_1: {
        nameAr: "نوع فرعي",
        nameEn: "Sub Type",
        fee: 100.00,
        currency: "SAR",
        availableFor: ["personal"],
        processingTime: "instant",
        icon: "📝"
      }
    }
  }
};
```

Then run:

```bash
node scripts/seedGovernmentServices.mjs
```

## Troubleshooting

### Error: "Data validation failed"

This means there's an issue with the data structure. Check:
- All required fields are present (nameAr, nameEn, category, ministry, subTypes)
- Sub-types have required fields (nameAr, nameEn, fee)
- No syntax errors in the data file

### Error: "PERMISSION_DENIED"

Your Firebase Realtime Database rules need to allow write access. Update rules in Firebase Console:

```json
{
  "rules": {
    "governmentServices": {
      ".read": true,
      ".write": true  // For seeding only - restrict in production
    }
  }
}
```

**Important**: After seeding, update the rules to restrict write access in production.

### Script shows "Failed: X"

Check the error messages above the summary for specific failures. Common causes:
- Network connection issues
- Firebase configuration problems
- Rate limiting (wait a few seconds and try again)

## Service Fees Summary

### Personal Services (Sample)
- National ID Issue/Renew: 100 SAR
- Passport Issue/Renew: 300 SAR
- Driving License Issue: 400 SAR
- Driving License Renew: 200 SAR
- Traffic Violations: 100-500 SAR
- Birth Certificate: 50 SAR

### Business Services (Sample)
- Iqama Issue/Renew: 2,000 SAR
- Work Permit Issue/Renew: 2,000 SAR
- Exit Re-entry Visa: 200-500 SAR
- Commercial Registration: 200 SAR
- Business License: 300 SAR

## Related Documentation

For more details, see:
- [Government Services Guide](../docs/GOVERNMENT_SERVICES_GUIDE.md)
- [Firebase Configuration](../src/common/services/firebase/firebaseConfig.js)
- [Data Structure](../src/common/services/firebase/governmentServicesData.js)

---

## Running Both Scripts

To set up a complete development environment:

```bash
# 1. Create test users
node scripts/seedUsers.mjs

# 2. Populate government services
node scripts/seedGovernmentServices.mjs

# 3. Generate bills for specific users
node scripts/seedBills.mjs --userId="YOUR_USER_ID" --walletId="YOUR_WALLET_ID"
```

This will give you a fully functional development environment with test users, government services, and bills ready to use!

---

# 3. Seed Government Bills Script

This script generates and populates test bills in Firebase for specific users and wallets.

## Features

- ✅ Accepts userId and walletId as command-line parameters
- ✅ Auto-detects wallet type (personal/business) from Firebase
- ✅ Generates realistic bills based on wallet type
- ✅ Supports multiple bill statuses (paid, unpaid, overdue, upcoming)
- ✅ Validates data before seeding
- ✅ Shows detailed progress and summary
- ✅ Can be run multiple times for different users

## Prerequisites

- Node.js installed (v14 or higher)
- Firebase project configured
- User and wallet must exist in Firebase
- Internet connection

## Usage

### Basic Usage

Generate 5 bills for a user's wallet:

```bash
node scripts/seedBills.mjs --userId="abc123xyz" --walletId="wallet_personal_1234567890"
```

### With Options

Generate custom number of bills with specific statuses:

```bash
# Generate 10 bills
node scripts/seedBills.mjs --userId="abc123xyz" --walletId="wallet_business_7001234567" --count=10

# Generate only unpaid and overdue bills
node scripts/seedBills.mjs --userId="abc123xyz" --walletId="wallet_personal_1234567890" --count=8 --statuses="unpaid,overdue"
```

## Command-Line Options

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `--userId` | **Yes** | - | Firebase user ID (UID) |
| `--walletId` | **Yes** | - | Wallet ID (wallet_personal_* or wallet_business_*) |
| `--count` | No | 5 | Number of bills to generate |
| `--statuses` | No | unpaid,paid,overdue,upcoming | Comma-separated list of bill statuses |

## How It Works

1. **Validates Parameters**: Checks that userId and walletId are provided
2. **Fetches Wallet Data**: Retrieves wallet from Firebase to determine type (personal/business)
3. **Generates Bills**: Creates random bills appropriate for the wallet type
   - Personal wallets get: Passport, Traffic, Civil Affairs bills
   - Business wallets get: Iqama, Commerce, Justice bills
4. **Seeds to Firebase**: Saves bills to `governmentBills/{userId}/{billId}`
5. **Shows Summary**: Displays statistics and results

## Expected Output

```
🌱 Starting Government Bills seeding process...
======================================================================

📊 CONFIGURATION
======================================================================
   User ID: abc123xyz
   Wallet ID: wallet_personal_1234567890
   Bills to generate: 5
   Statuses: unpaid, paid, overdue, upcoming

🔍 Fetching wallet data...
   ✅ Wallet found: personal wallet
   Balance: 2500 SAR

🎲 Generating bills...
   ✅ Generated 5 bills

📋 BILL SUMMARY
======================================================================
   Total Bills: 5
   Total Amount: 1150.00 SAR
   By Status:
      - unpaid: 2
      - paid: 1
      - overdue: 1
      - upcoming: 1

🌱 Seeding bills to Firebase...

   ✅ Bill bill_123_abc created (Renew Passport)
   ✅ Bill bill_124_def created (Traffic Violation)
   ✅ Bill bill_125_ghi created (Renew National ID)
   ✅ Bill bill_126_jkl created (Traffic Violation)
   ✅ Bill bill_127_mno created (Renew Passport)

======================================================================
📈 SEEDING SUMMARY
======================================================================
✅ Seeded: 5
❌ Failed: 0
📊 Total: 5
======================================================================

✨ Bills successfully seeded to Firebase!
🔍 Check Firebase Console to verify the data.
📂 Path: governmentBills/abc123xyz
```

## Bill Types by Wallet

### Personal Wallet Bills
- **Passports**: Passport renewal, driving license (300-400 SAR)
- **Traffic**: Traffic violations, vehicle registration (100-500 SAR)
- **Civil Affairs**: National ID renewal (100 SAR)

### Business Wallet Bills
- **Human Resources**: Iqama renewal, work permits (2,000 SAR)
- **Commerce**: Commercial registration (200 SAR)
- **Justice**: Contract notarization (50 SAR)

## Bill Statuses

### 1. Paid
- Issued 60 days ago
- Due date was 30 days ago
- Paid 35 days ago
- Has payment transaction ID

### 2. Unpaid
- Issued 15 days ago
- Due in 15 days
- Payment pending

### 3. Overdue
- Issued 45 days ago
- 5 days past due date
- Includes 10% late fee penalty

### 4. Upcoming
- Will be issued in 10 days
- Due in 40 days
- Future bill (not yet active)

## Getting User ID and Wallet ID

### Find User ID
After running `seedUsers.mjs`, the output shows the UID:
```
✅ Auth account created (UID: abc123xyz)
```

Or check Firebase Console → Authentication → Users → UID column

### Find Wallet ID
Check Firebase Console → Realtime Database → wallets
- Personal wallet: `wallet_personal_[nationalId]`
- Business wallet: `wallet_business_[nationalId]`

Or run this query:
```javascript
const wallets = await get(ref(database, `users/${userId}/wallets`));
console.log(wallets.val()); // { personal: "wallet_id", business: "wallet_id" }
```

## Example Workflows

### 1. Seed Bills for Test User

```bash
# First, create a user
node scripts/seedUsers.mjs
# Output shows: UID: abc123xyz

# Then, seed bills for that user's personal wallet
node scripts/seedBills.mjs --userId="abc123xyz" --walletId="wallet_personal_1234567890" --count=10
```

### 2. Create Overdue Bills for Testing

```bash
node scripts/seedBills.mjs --userId="abc123xyz" --walletId="wallet_personal_1234567890" --count=5 --statuses="overdue"
```

### 3. Generate Business Bills

```bash
node scripts/seedBills.mjs --userId="xyz789abc" --walletId="wallet_business_7001234567" --count=8
```

## Verifying Seeded Bills

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Realtime Database**
3. Expand `governmentBills → {userId}`
4. Verify bills are present

### In the App

Use the bills service to fetch bills:

```javascript
import { getUserBills } from '../services/billsService';

// Get all bills
const bills = await getUserBills(userId);

// Get unpaid bills
const unpaidBills = await getBillsByStatus(userId, 'unpaid');

// Get bills for specific wallet
const walletBills = await getWalletBills(userId, walletId);
```

## Troubleshooting

### Error: "Wallet not found"

**Cause**: The wallet ID doesn't exist in Firebase

**Solution**:
1. Check wallet ID format: `wallet_personal_*` or `wallet_business_*`
2. Verify wallet exists in Firebase Console
3. Make sure user has wallets created (run seed users script first)

### Error: "Missing required parameters"

**Cause**: userId or walletId not provided

**Solution**:
```bash
node scripts/seedBills.mjs --userId="YOUR_ID" --walletId="YOUR_WALLET_ID"
```

### Error: "Permission denied"

**Cause**: Firebase database rules restrict access

**Solution**: Update Firebase rules to allow writes:
```json
{
  "rules": {
    "governmentBills": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Important**: Restrict write access in production!

### Bills Not Showing Up

**Check**:
1. Firebase Console → Realtime Database → governmentBills
2. Correct user ID path
3. Bills have valid structure
4. No console errors during seeding

## Related Documentation

For more details, see:
- [Bills Guide](../docs/BILLS_GUIDE.md)
- [Bills Service](../src/common/services/billsService.js)
- [Government Services](../docs/GOVERNMENT_SERVICES_GUIDE.md)

---

## Complete Setup Workflow

To set up a full development environment with users, services, and bills:

```bash
# Step 1: Create test users
node scripts/seedUsers.mjs

# Step 2: Populate government services
node scripts/seedGovernmentServices.mjs

# Step 3: Generate bills for each user
# Personal user (from seed users output)
node scripts/seedBills.mjs --userId="USER_ID_1" --walletId="wallet_personal_1234567890" --count=10

# Business user (from seed users output)
node scripts/seedBills.mjs --userId="USER_ID_2" --walletId="wallet_business_7001234567" --count=10
```

Now you have a complete development environment with:
- ✅ Test users (personal and business)
- ✅ Government services catalog
- ✅ Realistic bills for testing
- ✅ Multiple bill statuses
- ✅ Ready to test payment flows!

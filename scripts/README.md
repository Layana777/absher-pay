# Seed Users Script

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

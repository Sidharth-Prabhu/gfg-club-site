# Firebase Setup Guide

This project uses Firebase (Firestore + Firebase Auth) for database and authentication.

## Quick Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard

### Step 2: Enable Required Services

1. **Firestore Database:**
   - Go to "Firestore Database" in the left menu
   - Click "Create database"
   - Choose "Start in test mode" (for development) or set up security rules
   - Select a location closest to your users

2. **Authentication:**
   - Go to "Authentication" in the left menu
   - Click "Get started"
   - Enable "Email/Password" sign-in method

### Step 3: Generate Service Account Key

1. Go to **Project Settings** (gear icon ⚙️)
2. Go to the **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** to download the JSON file
5. Save the file as `serviceAccount.json` in the `backend/` directory

### Step 4: Configure Environment

The `serviceAccount.json` file is already in `.gitignore` to prevent accidental commits to GitHub.

Your `.env` file should have at minimum:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_123!
```

No need to set Firebase environment variables if using `serviceAccount.json`!

### Step 5: Install Dependencies & Run

```bash
cd backend
npm install
npm run dev
```

## Alternative: Environment Variables

If you prefer not to use a JSON file, you can use environment variables:

1. Copy the contents of your service account JSON
2. Add to `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

**Note:** The private key must include the `\n` escape sequences for newlines.

## Firestore Security Rules

For development, you can use permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**For production**, implement granular rules based on user roles and document ownership.

## File Structure

```
backend/
├── config/
│   └── firebase.js          # Firebase initialization
├── serviceAccount.json      # Your service account key (NOT in git)
├── serviceAccount.example.json  # Example template (safe to commit)
├── .gitignore              # Includes serviceAccount.json
└── .env                    # Environment variables
```

## Troubleshooting

### "Failed to parse private key"
- Ensure the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Check that newlines are properly escaped as `\n`

### "Missing or insufficient permissions"
- Check Firestore security rules in Firebase Console
- Ensure the user is authenticated

### "The query requires an index"
- Click the link in the error message to create the index automatically
- Or create it manually in Firestore Console > Indexes

## Migration from MySQL

If you have existing MySQL data:

1. Add MySQL credentials to `.env` temporarily
2. Run `npm run migrate`
3. Verify data in Firebase Console
4. Remove MySQL credentials from `.env`

## Security Best Practices

1. ✅ Never commit `serviceAccount.json` to version control
2. ✅ Use environment variables for sensitive data in production
3. ✅ Implement proper Firestore security rules
4. ✅ Enable App Check for additional security
5. ✅ Use Firebase Admin SDK only on the server (never in client code)

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

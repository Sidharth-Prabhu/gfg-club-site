import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Try to load service account from JSON file first
  // Check both the backend root and config directories
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccount.json');
  
  let credential;
  
  if (fs.existsSync(serviceAccountPath)) {
    // Load from serviceAccount.json file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Firebase initialized using serviceAccount.json');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    // Fallback to environment variables
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    });
    console.log('✅ Firebase initialized using environment variables');
  } else {
    throw new Error(
      'Firebase credentials not found. Please either:\n' +
      '1. Place a serviceAccount.json file in the backend/ directory, OR\n' +
      '2. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env'
    );
  }

  admin.initializeApp({
    credential: credential,
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
export default db;

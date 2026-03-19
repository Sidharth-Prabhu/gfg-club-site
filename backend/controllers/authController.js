import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin, { db, auth } from '../config/firebase.js';
import { notifyAdmins } from './notificationController.js';

const generateToken = (id, role, status) => {
  return jwt.sign({ id, role, status }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const {
    name, email, password, department, year,
    gfg_profile, leetcode_profile, github_profile,
    skills, about, resume_url
  } = req.body;

  try {
    // Check if user already exists in Firestore
    const userRef = db.collection('users').where('email', '==', email.toLowerCase());
    const existingUser = await userRef.get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: email.toLowerCase(),
      password,
      displayName: name,
    });

    // Determine role and status based on email
    const isRIT = email.toLowerCase().includes('rit') || email.toLowerCase().includes('ritchennai');
    const role = isRIT ? 'User' : 'Guest';
    const status = isRIT ? 'Pending' : 'Approved';

    // Create user document in Firestore
    const userData = {
      name,
      email: email.toLowerCase(),
      role,
      status,
      department: department || null,
      year: year || null,
      gfg_profile: gfg_profile || null,
      leetcode_profile: leetcode_profile || null,
      github_profile: github_profile || null,
      gfg_score: 0,
      gfg_solved: 0,
      problems_solved: 0,
      streak: 0,
      weekly_points: 0,
      skills: skills || null,
      about: about || null,
      resume_url: resume_url || null,
      profile_pic: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(firebaseUser.uid).set(userData);

    if (isRIT) {
      // Notify admins about new application
      await notifyAdmins('approval', `New user application from ${name} (${email})`, '/dashboard/admin/users');
    }

    const message = isRIT
      ? 'Application submitted successfully. Waiting for admin approval.'
      : 'Guest account created successfully! You can now login.';

    res.status(201).json({
      message,
      id: firebaseUser.uid,
      role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sign in to Firebase Auth
    // Note: Firebase Admin SDK doesn't have signInWithEmailAndPassword
    // We need to verify credentials differently
    // For now, we'll check if user exists and verify password hash manually
    
    const userRef = db.collection('users').where('email', '==', email.toLowerCase());
    const snapshot = await userRef.get();
    
    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // For existing users migrated from MySQL, password is hashed with bcrypt
    // For new Firebase users, we'd need a different approach
    // Since we're migrating, we'll use bcrypt comparison
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({ message: 'Your application is still pending approval.' });
    }
    if (user.status === 'Rejected') {
      return res.status(403).json({ message: 'Your application has been declined.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user.id, user.role, user.status),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
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
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role and status based on email
    const isRIT = email.toLowerCase().includes('rit') || email.toLowerCase().includes('ritchennai');
    const role = isRIT ? 'User' : 'Guest';
    const status = isRIT ? 'Pending' : 'Approved';

    const [result] = await pool.execute(
      `INSERT INTO users (
        name, email, password, department, year, 
        gfg_profile, leetcode_profile, github_profile, 
        skills, about, resume_url, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, hashedPassword, department, year, 
        gfg_profile, leetcode_profile, github_profile, 
        skills, about, resume_url, role, status
      ]
    );

    if (isRIT) {
        // Notify admins about new application
        await notifyAdmins('approval', `New user application from ${name} (${email})`, '/dashboard/admin/users');
    }

    const message = isRIT 
      ? 'Application submitted successfully. Waiting for admin approval.' 
      : 'Guest account created successfully! You can now login.';

    res.status(201).json({
      message,
      id: result.insertId,
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
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
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

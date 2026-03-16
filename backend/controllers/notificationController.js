import pool from '../config/db.js';
import { sendNotification } from '../server.js';

export const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (userId, type, message, link) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)',
      [userId, type, message, link]
    );
    const notification = {
      id: result.insertId,
      user_id: userId,
      type,
      message,
      link,
      is_read: false,
      created_at: new Date()
    };
    sendNotification(userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyAll = async (type, message, link, excludeUserId = null) => {
    try {
        const [users] = await pool.execute('SELECT id FROM users');
        for (const user of users) {
            if (excludeUserId && user.id === excludeUserId) continue;
            await createNotification(user.id, type, message, link);
        }
    } catch (error) {
        console.error('Error notifying all users:', error);
    }
};

export const notifyAdmins = async (type, message, link) => {
    try {
        const [admins] = await pool.execute("SELECT id FROM users WHERE role IN ('Admin', 'Core')");
        for (const admin of admins) {
            await createNotification(admin.id, type, message, link);
        }
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

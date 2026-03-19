import admin, { db } from '../config/firebase.js';
import { sendNotification } from '../server.js';

export const getNotifications = async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('user_id', '==', req.user.id)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by created_at descending in JavaScript
    notifications.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return bDate - aDate;
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('user_id', '==', req.user.id)
      .where('is_read', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { is_read: true });
    });
    await batch.commit();
    
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationRef = db.collection('notifications').doc(req.params.id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists || notificationDoc.data().user_id !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notificationRef.delete();
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (userId, type, message, link) => {
  try {
    const notificationRef = db.collection('notifications').doc();
    const notification = {
      user_id: userId,
      type,
      message,
      link: link || null,
      is_read: false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await notificationRef.set(notification);
    
    sendNotification(userId, {
      id: notificationRef.id,
      ...notification
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyAll = async (type, message, link, excludeUserId = null) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        
        const batch = db.batch();
        for (const doc of usersSnapshot.docs) {
            const userId = doc.id;
            if (excludeUserId && userId === excludeUserId) continue;
            
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                user_id: userId,
                type,
                message,
                link: link || null,
                is_read: false,
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await batch.commit();
        
        // Also send real-time notifications
        for (const doc of usersSnapshot.docs) {
            const userId = doc.id;
            if (excludeUserId && userId === excludeUserId) continue;
            sendNotification(userId, { type, message, link });
        }
    } catch (error) {
        console.error('Error notifying all users:', error);
    }
};

export const notifyAdmins = async (type, message, link) => {
    try {
        const adminsSnapshot = await db.collection('users')
            .where('role', 'in', ['Admin', 'Core'])
            .get();
        
        const batch = db.batch();
        for (const doc of adminsSnapshot.docs) {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                user_id: doc.id,
                type,
                message,
                link: link || null,
                is_read: false,
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await batch.commit();
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

import pool from '../config/db.js';
import { createNotification } from './notificationController.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch conversations with the other participant's details
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   u.id as other_user_id, u.name as other_user_name, u.profile_pic as other_user_pic,
                   u.role as other_user_role, u.email as other_user_email,
                   (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count
            FROM conversations c
            JOIN users u ON (c.user1_id = ? AND c.user2_id = u.id) OR (c.user2_id = ? AND c.user1_id = u.id)
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.last_message_at DESC
        `, [userId, userId, userId, userId, userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;
    try {
        // Verify user is part of conversation
        const [conv] = await pool.execute(
            'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
            [conversationId, userId, userId]
        );
        if (conv.length === 0) return res.status(403).json({ message: 'Unauthorized access to conversation' });

        // Mark messages as read
        await pool.execute(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
            [conversationId, userId]
        );

        const [rows] = await pool.execute(
            'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [conversationId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const senderName = req.user.name;

    if (!content || !receiverId) return res.status(400).json({ message: 'Invalid data' });

    try {
        // Guest user restrictions
        if (senderRole === 'Guest') {
            // Check if receiver is a coordinator of an event the guest is in
            const [allowed] = await pool.execute(`
                SELECT e.organizer 
                FROM event_registrations er
                JOIN events e ON er.event_id = e.id
                JOIN users u ON u.name = e.organizer
                WHERE er.user_id = ? AND u.id = ?
            `, [senderId, receiverId]);

            if (allowed.length === 0) {
                // Also check if the receiver has messaged the guest first (reply allowed)
                const [existing] = await pool.execute(
                    'SELECT id FROM messages WHERE sender_id = ? AND conversation_id IN (SELECT id FROM conversations WHERE user1_id = ? OR user2_id = ?)',
                    [receiverId, senderId, senderId]
                );
                if (existing.length === 0) {
                    return res.status(403).json({ message: 'Guest users can only DM coordinators of their registered events.' });
                }
            }
        }

        // Find or create conversation
        const user1 = Math.min(senderId, receiverId);
        const user2 = Math.max(senderId, receiverId);

        let [conv] = await pool.execute(
            'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [user1, user2]
        );

        let conversationId;
        if (conv.length === 0) {
            const [result] = await pool.execute(
                'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
                [user1, user2]
            );
            conversationId = result.insertId;
        } else {
            conversationId = conv[0].id;
        }

        // Insert message
        await pool.execute(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [conversationId, senderId, content]
        );

        // Update last_message_at
        await pool.execute(
            'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
            [conversationId]
        );

        // Notify receiver
        await createNotification(receiverId, 'dm', `${senderName} sent you a message: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`, `/dashboard`);

        res.status(201).json({ message: 'Message sent', conversationId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchMembersForDM = async (req, res) => {
    const { query } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        if (userRole === 'Guest') {
            // Guests can only search for coordinators of their events
            const [rows] = await pool.execute(`
                SELECT DISTINCT u.id, u.name, u.profile_pic, u.role, u.email
                FROM users u
                JOIN events e ON u.name = e.organizer
                JOIN event_registrations er ON e.id = er.event_id
                WHERE er.user_id = ? AND u.name LIKE ?
            `, [userId, `%${query}%`]);
            return res.json(rows);
        } else {
            // Members can search for anyone except guests (unless already in conversation)
            const [rows] = await pool.execute(`
                SELECT id, name, profile_pic, role, email 
                FROM users 
                WHERE id != ? AND (role != 'Guest' OR id IN (
                    SELECT user1_id FROM conversations WHERE user2_id = ?
                    UNION
                    SELECT user2_id FROM conversations WHERE user1_id = ?
                )) AND name LIKE ?
                LIMIT 10
            `, [userId, userId, userId, `%${query}%`]);
            res.json(rows);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

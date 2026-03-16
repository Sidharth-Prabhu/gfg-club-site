import pool from '../config/db.js';
import { createNotification } from './notificationController.js';

export const getGroups = async (req, res) => {
  try {
    const userId = req.user?.id;
    const isGuest = req.user?.role === 'Guest';
    let sql = `
      SELECT g.*, u.name as creator_name,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'Accepted') as member_count,
      (SELECT status FROM group_members WHERE group_id = g.id AND user_id = ?) as user_status
      FROM community_groups g
      JOIN users u ON g.created_by = u.id
      WHERE 1=1
    `;
    const params = [userId || null];

    if (isGuest) {
      sql += ` AND g.allow_guests = 1`;
    }

    sql += ` ORDER BY g.created_at DESC`;
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const sql = `
      SELECT g.*, u.name as creator_name,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'Accepted') as member_count,
      (SELECT status FROM group_members WHERE group_id = g.id AND user_id = ?) as user_status,
      (SELECT role FROM group_members WHERE group_id = g.id AND user_id = ?) as user_role
      FROM community_groups g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `;
    const [rows] = await pool.execute(sql, [userId || null, userId || null, id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Group not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  const { title, description, logo, max_members, allow_guests } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Only Core/Admin can create groups' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO community_groups (title, description, logo, created_by, max_members, allow_guests) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, logo, userId, max_members || 100, allow_guests ? 1 : 0]
    );
    const groupId = result.insertId;

    // Creator is automatically an Admin member
    await pool.execute(
      'INSERT INTO group_members (group_id, user_id, status, role) VALUES (?, ?, "Accepted", "Admin")',
      [groupId, userId]
    );

    res.status(201).json({ id: groupId, title, message: 'Group created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  try {
    const [group] = await pool.execute('SELECT title, created_by, allow_guests, max_members, (SELECT COUNT(*) FROM group_members WHERE group_id = ? AND status = "Accepted") as current_members FROM community_groups WHERE id = ?', [groupId, groupId]);
    if (group.length === 0) return res.status(404).json({ message: 'Group not found' });
    
    if (req.user.role === 'Guest' && !group[0].allow_guests) {
      return res.status(403).json({ message: 'Guests are not allowed to join this restricted sector' });
    }

    if (group[0].current_members >= group[0].max_members) {
        return res.status(400).json({ message: 'Group is full' });
    }

    await pool.execute(
      'INSERT INTO group_members (group_id, user_id, status) VALUES (?, ?, "Pending")',
      [groupId, userId]
    );

    // Notify group creator
    const [userRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const userName = userRows[0].name;
    await createNotification(group[0].created_by, 'approval', `${userName} requested to join group "${group[0].title}"`, `/community/group/${groupId}`);

    res.status(201).json({ message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get requests for groups created by this user
    const sql = `
      SELECT m.*, u.name as user_name, g.title as group_title
      FROM group_members m
      JOIN users u ON m.user_id = u.id
      JOIN community_groups g ON m.group_id = g.id
      WHERE g.created_by = ? AND m.status = 'Pending'
    `;
    const [rows] = await pool.execute(sql, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  const { requestId, status } = req.body; // status: 'Accepted' or 'Declined'
  const userId = req.user.id;

  try {
    const [requestRows] = await pool.execute(`
        SELECT m.*, g.title as group_title FROM group_members m 
        JOIN community_groups g ON m.group_id = g.id 
        WHERE m.id = ? AND g.created_by = ?`, 
        [requestId, userId]
    );

    if (requestRows.length === 0) return res.status(403).json({ message: 'Unauthorized' });
    const request = requestRows[0];

    if (status === 'Accepted') {
      await pool.execute('UPDATE group_members SET status = "Accepted" WHERE id = ?', [requestId]);
      await createNotification(request.user_id, 'community', `Your request to join group "${request.group_title}" was accepted!`, `/community/group/${request.group_id}`);
    } else {
      await pool.execute('DELETE FROM group_members WHERE id = ?', [requestId]);
      await createNotification(request.user_id, 'community', `Your request to join group "${request.group_title}" was declined.`, `/community`);
    }

    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupMembers = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT m.*, u.name as user_name, u.profile_pic as user_pic FROM group_members m JOIN users u ON m.user_id = u.id WHERE m.group_id = ? AND m.status = "Accepted"',
            [id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

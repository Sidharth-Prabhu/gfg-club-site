import pool from '../config/db.js';

export const getDiscussions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT d.*, u.name as author_name FROM discussions d JOIN users u ON d.author_id = u.id ORDER BY d.created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  const { title, content } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO discussions (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, content, author_id: req.user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

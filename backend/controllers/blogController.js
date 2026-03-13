import pool from '../config/db.js';

export const getBlogs = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT b.*, u.name as author_name FROM blogs b JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const { title, content } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, content, author_id: req.user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

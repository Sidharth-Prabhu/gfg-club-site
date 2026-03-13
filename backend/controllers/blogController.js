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

export const getBlogById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT b.*, u.name as author_name FROM blogs b JOIN users u ON b.author_id = u.id WHERE b.id = ?',
      [req.params.id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO blogs (title, content, tags, author_id) VALUES (?, ?, ?, ?)',
      [title, content, tags, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, content, tags, author_id: req.user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  const { title, content, tags } = req.body;
  const blogId = req.params.id;
  try {
    const [rows] = await pool.execute('SELECT author_id FROM blogs WHERE id = ?', [blogId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });

    if (rows[0].author_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute(
      'UPDATE blogs SET title = ?, content = ?, tags = ? WHERE id = ?',
      [title, content, tags, blogId]
    );
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT author_id FROM blogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Blog not found' });

    if (rows[0].author_id !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

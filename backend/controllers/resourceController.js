import pool from '../config/db.js';

export const getResources = async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT * FROM resources';
    const params = [];
    if (category && category !== 'All') {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Core') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { title, description, link, category } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO resources (title, description, link, category) VALUES (?, ?, ?, ?)',
      [title, description, link, category]
    );
    res.status(201).json({ id: result.insertId, title, description, link, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Core') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    await pool.execute('DELETE FROM resources WHERE id = ?', [req.params.id]);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

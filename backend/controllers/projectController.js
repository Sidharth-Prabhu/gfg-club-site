import pool from '../config/db.js';

export const getProjects = async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT p.*, u.name as creator_name FROM projects p JOIN users u ON p.created_by = u.id';
    const params = [];
    if (category && category !== 'All') {
      sql += ' WHERE p.category = ?';
      params.push(category);
    }
    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, github_link, demo_link, tech_stack, category } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO projects (title, description, github_link, demo_link, tech_stack, category, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, github_link, demo_link, tech_stack, category, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, description, github_link, demo_link, tech_stack, category, created_by: req.user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT created_by FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });

    if (rows[0].created_by !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

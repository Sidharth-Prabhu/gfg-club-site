import pool from '../config/db.js';

export const getProjects = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, u.name as creator_name FROM projects p JOIN users u ON p.created_by = u.id ORDER BY p.created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, github_link, demo_link, tech_stack } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO projects (title, description, github_link, demo_link, tech_stack, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, github_link, demo_link, tech_stack, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, description, github_link, demo_link, tech_stack, created_by: req.user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

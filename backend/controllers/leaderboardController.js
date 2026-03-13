import pool from '../config/db.js';

export const getLeaderboard = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, problems_solved, weekly_points, streak FROM users ORDER BY problems_solved DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, weekly_points, streak FROM users ORDER BY weekly_points DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

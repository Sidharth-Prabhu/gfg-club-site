import pool from '../config/db.js';

export const getLeaderboard = async (req, res) => {
  try {
    // Rank based on GFG Score as requested, include role
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, gfg_score, gfg_solved, problems_solved, weekly_points, streak, role, profile_pic FROM users WHERE gfg_score > 0 AND status = "Approved" AND role != "Guest" ORDER BY gfg_score DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, gfg_score, weekly_points, streak, role, profile_pic FROM users WHERE weekly_points > 0 AND status = "Approved" AND role != "Guest" ORDER BY weekly_points DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

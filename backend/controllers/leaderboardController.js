import pool from '../config/db.js';

export const getLeaderboard = async (req, res) => {
  try {
    // Rank based on GFG Score as requested
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, gfg_score, gfg_solved, problems_solved, weekly_points, streak FROM users WHERE gfg_score > 0 ORDER BY gfg_score DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyLeaderboard = async (req, res) => {
  try {
    // Weekly could still be points or score improvement, keeping points for now or matching main if preferred
    const [rows] = await pool.execute(
      'SELECT id, name, department, year, gfg_score, weekly_points, streak FROM users WHERE weekly_points > 0 ORDER BY weekly_points DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

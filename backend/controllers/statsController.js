import pool from '../config/db.js';

export const getCampusStats = async (req, res) => {
  try {
    const [membersCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const [problemsSum] = await pool.execute('SELECT SUM(problems_solved) as total FROM users');
    const [activeCoders] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE problems_solved > 0');
    
    res.json({
      totalMembers: membersCount[0].total || 0,
      totalProblemsSolved: parseInt(problemsSum[0].total) || 0,
      activeCoders: activeCoders[0].total || 0,
      weeklyContests: 12 // static or derived from events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get last 7 days of activity
    const [rows] = await pool.execute(
      'SELECT DATE_FORMAT(activity_date, "%a") as name, problems_solved as solved FROM user_activity WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ORDER BY activity_date ASC',
      [userId]
    );
    
    // Fill in missing days with 0 if necessary
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // For simplicity, we just return what we have or a default set if empty
    if (rows.length === 0) {
      return res.json(days.map(d => ({ name: d, solved: 0 })));
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

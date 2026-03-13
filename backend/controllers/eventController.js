import pool from '../config/db.js';

export const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  const { title, description, poster, date, location, max_participants } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, poster, date, location, max_participants) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, poster, date, location, max_participants]
    );
    res.status(201).json({ id: result.insertId, title, description, poster, date, location, max_participants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered' });
    }
    await pool.execute('INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

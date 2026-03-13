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
  const { title, description, poster, date, location, organizer, is_open } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to create events' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, poster, date, location, organizer, is_open) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, poster, date, location, organizer, is_open]
    );
    res.status(201).json({ id: result.insertId, title, description, poster, date, location, organizer, is_open });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { title, description, poster, date, location, organizer, is_open } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to manage events' });
  }

  try {
    await pool.execute(
      'UPDATE events SET title = ?, description = ?, poster = ?, date = ?, location = ?, organizer = ?, is_open = ? WHERE id = ?',
      [title, description, poster, date, location, organizer, is_open, req.params.id]
    );
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  const userRole = req.user.role;
  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to delete events' });
  }

  try {
    await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'Admin') {
    return res.status(403).json({ message: 'Admins cannot register for events' });
  }

  try {
    const [eventRows] = await pool.execute('SELECT is_open FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0 || !eventRows[0].is_open) {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

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

export const getEventRegistrations = async (req, res) => {
  const userRole = req.user.role;
  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to view registrations' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT u.name, u.email, u.gfg_score, u.gfg_solved, u.problems_solved, u.id as user_id 
       FROM event_registrations er 
       JOIN users u ON er.user_id = u.id 
       WHERE er.event_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import pool from '../config/db.js';

export const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  const { title, description, poster, date, location, organizer, is_open, participation_type, max_team_size, rules, requirements } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to create events' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO events (title, description, poster, date, location, organizer, is_open, participation_type, max_team_size, rules, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, poster, date, location, organizer, is_open, participation_type, max_team_size, rules, requirements]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { title, description, poster, date, location, organizer, is_open, participation_type, max_team_size, rules, requirements } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to manage events' });
  }

  try {
    await pool.execute(
      'UPDATE events SET title = ?, description = ?, poster = ?, date = ?, location = ?, organizer = ?, is_open = ?, participation_type = ?, max_team_size = ?, rules = ?, requirements = ? WHERE id = ?',
      [title, description, poster, date, location, organizer, is_open, participation_type, max_team_size, rules, requirements, req.params.id]
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
  const { eventId, type, teamName, memberEmails } = req.body; // type: 'individual' or 'team'
  const userId = req.user.id;

  try {
    const [eventRows] = await pool.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) return res.status(404).json({ message: 'Event not found' });
    const event = eventRows[0];

    if (!event.is_open) return res.status(400).json({ message: 'Registration is closed' });

    // Validate registration type
    if (type === 'team' && event.participation_type === 'individual') {
        return res.status(400).json({ message: 'Team registration not allowed' });
    }
    if (type === 'individual' && event.participation_type === 'team') {
        return res.status(400).json({ message: 'Individual registration not allowed' });
    }

    // Check if user already registered for this event
    const [existing] = await pool.execute(
      'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'You are already registered/invited' });

    if (type === 'individual') {
        await pool.execute(
            'INSERT INTO event_registrations (user_id, event_id, status) VALUES (?, ?, ?)',
            [userId, eventId, 'Accepted']
        );
    } else {
        // Team Registration
        if (!teamName) return res.status(400).json({ message: 'Team name is required' });
        
        const [teamResult] = await pool.execute(
            'INSERT INTO teams (name, leader_id, event_id) VALUES (?, ?, ?)',
            [teamName, userId, eventId]
        );
        const teamId = teamResult.insertId;

        // Register leader
        await pool.execute(
            'INSERT INTO event_registrations (user_id, event_id, team_id, status, is_leader) VALUES (?, ?, ?, ?, ?)',
            [userId, eventId, teamId, 'Accepted', true]
        );

        // Invite members
        if (memberEmails && memberEmails.length > 0) {
            if (memberEmails.length >= event.max_team_size) {
                return res.status(400).json({ message: `Max team size is ${event.max_team_size}` });
            }

            for (const email of memberEmails) {
                const [userRows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
                if (userRows.length > 0) {
                    const invitedId = userRows[0].id;
                    // Check if already invited to this event
                    const [exists] = await pool.execute('SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?', [invitedId, eventId]);
                    if (exists.length === 0) {
                        await pool.execute(
                            'INSERT INTO event_registrations (user_id, event_id, team_id, status) VALUES (?, ?, ?, ?)',
                            [invitedId, eventId, teamId, 'Pending']
                        );
                    }
                }
            }
        }
    }

    res.status(201).json({ message: 'Registration processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyInvitations = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await pool.execute(
            `SELECT er.id as reg_id, e.title as event_title, t.name as team_name, u.name as inviter_name, e.id as event_id
             FROM event_registrations er
             JOIN events e ON er.event_id = e.id
             JOIN teams t ON er.team_id = t.id
             JOIN users u ON t.leader_id = u.id
             WHERE er.user_id = ? AND er.status = 'Pending'`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const respondToInvitation = async (req, res) => {
    const { regId, response } = req.body; // response: 'Accepted' or 'Declined'
    const userId = req.user.id;

    if (!['Accepted', 'Declined'].includes(response)) {
        return res.status(400).json({ message: 'Invalid response type' });
    }

    try {
        const [regRows] = await pool.execute('SELECT * FROM event_registrations WHERE id = ? AND user_id = ?', [regId, userId]);
        if (regRows.length === 0) return res.status(404).json({ message: 'Invitation not found' });

        if (response === 'Accepted') {
            await pool.execute('UPDATE event_registrations SET status = ? WHERE id = ?', ['Accepted', regId]);
        } else {
            await pool.execute('DELETE FROM event_registrations WHERE id = ?', [regId]);
        }
        res.json({ message: `Invitation ${response.toLowerCase()}` });
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
      `SELECT u.name, u.email, u.gfg_score, u.gfg_solved, u.problems_solved, u.id as user_id, 
              er.status, er.is_leader, t.name as team_name
       FROM event_registrations er 
       JOIN users u ON er.user_id = u.id 
       LEFT JOIN teams t ON er.team_id = t.id
       WHERE er.event_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamStatus = async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;
    try {
        // Check if user is leader of a team in this event
        const [teamRows] = await pool.execute('SELECT id, name FROM teams WHERE leader_id = ? AND event_id = ?', [userId, eventId]);
        if (teamRows.length === 0) return res.json({ isLeader: false });

        const team = teamRows[0];
        const [members] = await pool.execute(
            `SELECT u.name, u.email, er.status 
             FROM event_registrations er 
             JOIN users u ON er.user_id = u.id 
             WHERE er.team_id = ?`,
            [team.id]
        );

        res.json({ isLeader: true, teamName: team.name, members });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

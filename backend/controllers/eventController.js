import pool from '../config/db.js';
import { notifyAll, createNotification } from './notificationController.js';

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
    const eventId = result.insertId;

    // Notify all users about the new event
    await notifyAll('event', `New event: ${title}`, `/events/${eventId}`);

    res.status(201).json({ id: eventId, ...req.body });
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
            const inviteLimit = event.max_team_size - 1;
            const emailsToInvite = memberEmails.slice(0, inviteLimit);

            const [inviterRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
            const inviterName = inviterRows[0].name;

            for (const email of emailsToInvite) {
                const [userRows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
                if (userRows.length > 0) {
                    const invitedId = userRows[0].id;
                    const [exists] = await pool.execute('SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?', [invitedId, eventId]);
                    if (exists.length === 0) {
                        await pool.execute(
                            'INSERT INTO event_registrations (user_id, event_id, team_id, status) VALUES (?, ?, ?, ?)',
                            [invitedId, eventId, teamId, 'Pending']
                        );
                        // Notify invited user
                        await createNotification(invitedId, 'event', `${inviterName} invited you to join team "${teamName}" for ${event.title}`, `/dashboard`);
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

export const getMyRegistrations = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await pool.execute(
            `SELECT er.id as reg_id, e.id as event_id, e.title, e.date, e.location, e.poster,
                    er.status, er.is_leader, t.name as team_name, t.id as team_id,
                    e.participation_type, e.max_team_size
             FROM event_registrations er
             JOIN events e ON er.event_id = e.id
             LEFT JOIN teams t ON er.team_id = t.id
             WHERE er.user_id = ? AND er.status != 'Declined'
             ORDER BY e.date ASC`,
            [userId]
        );
        res.json(rows);
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

export const unregisterFromEvent = async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    try {
        const [regRows] = await pool.execute(
            'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );
        if (regRows.length === 0) return res.status(404).json({ message: 'Registration not found' });

        const registration = regRows[0];

        if (registration.is_leader) {
            // If leader unregisters, delete the whole team?
            // User requested "opt out of the event", for teams usually this dissolves the team if leader leaves
            // or we could promote another member. Let's stick to dissolving for simplicity/robustness.
            await pool.execute('DELETE FROM teams WHERE id = ?', [registration.team_id]);
        } else {
            await pool.execute('DELETE FROM event_registrations WHERE id = ?', [registration.id]);
        }

        res.json({ message: 'Unregistered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTeamName = async (req, res) => {
    const userId = req.user.id;
    const { teamId, newName } = req.body;

    try {
        const [teamRows] = await pool.execute('SELECT * FROM teams WHERE id = ? AND leader_id = ?', [teamId, userId]);
        if (teamRows.length === 0) return res.status(403).json({ message: 'Not authorized or team not found' });

        await pool.execute('UPDATE teams SET name = ? WHERE id = ?', [newName, teamId]);
        res.json({ message: 'Team name updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const inviteTeamMember = async (req, res) => {
    const userId = req.user.id;
    const { teamId, email } = req.body;

    try {
        const [teamRows] = await pool.execute('SELECT * FROM teams WHERE id = ? AND leader_id = ?', [teamId, userId]);
        if (teamRows.length === 0) return res.status(403).json({ message: 'Not authorized' });
        const team = teamRows[0];

        const [eventRows] = await pool.execute('SELECT max_team_size FROM events WHERE id = ?', [team.event_id]);
        const maxTeamSize = eventRows[0].max_team_size;

        const [countRows] = await pool.execute('SELECT COUNT(*) as count FROM event_registrations WHERE team_id = ?', [teamId]);
        if (countRows[0].count >= maxTeamSize) {
            return res.status(400).json({ message: 'Team limit reached' });
        }

        const [userRows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
        const invitedId = userRows[0].id;

        const [exists] = await pool.execute('SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?', [invitedId, team.event_id]);
        if (exists.length > 0) return res.status(400).json({ message: 'User already in this event' });

        await pool.execute(
            'INSERT INTO event_registrations (user_id, event_id, team_id, status) VALUES (?, ?, ?, ?)',
            [invitedId, team.event_id, teamId, 'Pending']
        );

        // Notify invited user
        const [inviterRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
        const inviterName = inviterRows[0].name;
        const [eventRows2] = await pool.execute('SELECT title FROM events WHERE id = ?', [team.event_id]);
        const eventTitle = eventRows2[0].title;
        
        await createNotification(invitedId, 'event', `${inviterName} invited you to join team "${team.name}" for ${eventTitle}`, `/dashboard`);

        res.json({ message: 'Invitation sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeTeamMember = async (req, res) => {
    const userId = req.user.id;
    const { teamId, memberId } = req.body;

    try {
        const [teamRows] = await pool.execute('SELECT * FROM teams WHERE id = ? AND leader_id = ?', [teamId, userId]);
        if (teamRows.length === 0) return res.status(403).json({ message: 'Not authorized' });

        if (memberId === userId) return res.status(400).json({ message: 'Cannot remove yourself. Use unregister.' });

        await pool.execute('DELETE FROM event_registrations WHERE team_id = ? AND user_id = ?', [teamId, memberId]);
        res.json({ message: 'Member removed' });
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
        // Find user's team for this event (whether leader or member)
        const [regRows] = await pool.execute(
            'SELECT team_id, is_leader FROM event_registrations WHERE user_id = ? AND event_id = ?', 
            [userId, eventId]
        );
        
        if (regRows.length === 0 || !regRows[0].team_id) {
            // Check if registered individually
            if (regRows.length > 0) return res.json({ registered: true, isTeam: false });
            return res.json({ registered: false });
        }

        const { team_id, is_leader } = regRows[0];
        const [teamRows] = await pool.execute('SELECT name FROM teams WHERE id = ?', [team_id]);
        const teamName = teamRows[0].name;

        const [members] = await pool.execute(
            `SELECT u.id as user_id, u.name, u.email, er.status, er.is_leader
             FROM event_registrations er 
             JOIN users u ON er.user_id = u.id 
             WHERE er.team_id = ?`,
            [team_id]
        );

        res.json({ 
            registered: true, 
            isTeam: true, 
            isLeader: !!is_leader, 
            teamId: team_id, 
            teamName, 
            members 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

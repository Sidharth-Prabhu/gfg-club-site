import admin, { db } from '../config/firebase.js';
import { notifyAll, createNotification } from './notificationController.js';

export const getEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events')
      .orderBy('date', 'desc')
      .get();
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const eventRef = db.collection('events').doc(req.params.id);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ id: eventDoc.id, ...eventDoc.data() });
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
    const eventRef = db.collection('events').doc();
    const eventData = {
      title,
      description: description || null,
      poster: poster || null,
      date: date ? new Date(date) : null,
      location: location || null,
      organizer: organizer || null,
      is_open: is_open !== undefined ? is_open : true,
      participation_type: participation_type || 'individual',
      max_team_size: max_team_size || 1,
      rules: rules || null,
      requirements: requirements || null,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await eventRef.set(eventData);

    // Notify all users about the new event
    await notifyAll('event', `New event: ${title}`, `/events/${eventRef.id}`);

    res.status(201).json({ id: eventRef.id, ...req.body });
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
    await db.collection('events').doc(req.params.id).update({
      title,
      description: description || null,
      poster: poster || null,
      date: date ? new Date(date) : null,
      location: location || null,
      organizer: organizer || null,
      is_open: is_open !== undefined ? is_open : true,
      participation_type: participation_type || 'individual',
      max_team_size: max_team_size || 1,
      rules: rules || null,
      requirements: requirements || null
    });
    
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
    await db.collection('events').doc(req.params.id).delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  const { eventId, type, teamName, memberEmails } = req.body;
  const userId = req.user.id;

  try {
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = eventDoc.data();

    if (!event.is_open) {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    // Validate registration type
    if (type === 'team' && event.participation_type === 'individual') {
      return res.status(400).json({ message: 'Team registration not allowed' });
    }
    if (type === 'individual' && event.participation_type === 'team') {
      return res.status(400).json({ message: 'Individual registration not allowed' });
    }

    // Check if user already registered for this event
    const existingReg = await db.collection('event_registrations')
      .where('user_id', '==', userId)
      .where('event_id', '==', eventId)
      .get();
    
    if (!existingReg.empty) {
      return res.status(400).json({ message: 'You are already registered/invited' });
    }

    if (type === 'individual') {
      await db.collection('event_registrations').add({
        user_id: userId,
        event_id: eventId,
        status: 'Accepted',
        is_leader: false,
        registered_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Team Registration
      if (!teamName) {
        return res.status(400).json({ message: 'Team name is required' });
      }

      const teamRef = db.collection('teams').doc();
      await teamRef.set({
        name: teamName,
        leader_id: userId,
        event_id: eventId,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Register leader
      await db.collection('event_registrations').add({
        user_id: userId,
        event_id: eventId,
        team_id: teamRef.id,
        status: 'Accepted',
        is_leader: true,
        registered_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Invite members
      if (memberEmails && memberEmails.length > 0) {
        const inviteLimit = event.max_team_size - 1;
        const emailsToInvite = memberEmails.slice(0, inviteLimit);

        const userDoc = await db.collection('users').doc(userId).get();
        const inviterName = userDoc.data().name;

        for (const email of emailsToInvite) {
          const userSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
          
          if (!userSnapshot.empty) {
            const invitedUser = userSnapshot.docs[0];
            const invitedId = invitedUser.id;
            
            const existsCheck = await db.collection('event_registrations')
              .where('user_id', '==', invitedId)
              .where('event_id', '==', eventId)
              .get();
            
            if (existsCheck.empty) {
              await db.collection('event_registrations').add({
                user_id: invitedId,
                event_id: eventId,
                team_id: teamRef.id,
                status: 'Pending',
                is_leader: false,
                registered_at: admin.firestore.FieldValue.serverTimestamp()
              });
              
              // Notify invited user
              await createNotification(
                invitedId, 
                'event', 
                `${inviterName} invited you to join team "${teamName}" for ${event.title}`, 
                '/dashboard'
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

export const getMyRegistrations = async (req, res) => {
  const userId = req.user.id;

  try {
    const registrationsSnapshot = await db.collection('event_registrations')
      .where('user_id', '==', userId)
      .get();

    if (registrationsSnapshot.empty) {
      return res.json([]);
    }

    // Filter out Declined status
    const registrations = registrationsSnapshot.docs.filter(doc => doc.data().status !== 'Declined');

    // Collect unique event IDs and team IDs
    const eventIds = [...new Set(registrations.map(doc => doc.data().event_id))];
    const teamIds = [...new Set(registrations.map(doc => doc.data().team_id).filter(Boolean))];

    // Fetch all events in parallel
    const eventDocs = await Promise.all(
      eventIds.map(id => db.collection('events').doc(id).get())
    );
    const eventMap = new Map();
    eventDocs.forEach(doc => {
      if (doc.exists) eventMap.set(doc.id, doc.data());
    });

    // Fetch all teams in parallel
    const teamDocs = await Promise.all(
      teamIds.map(id => db.collection('teams').doc(id).get())
    );
    const teamMap = new Map();
    teamDocs.forEach(doc => {
      if (doc.exists) teamMap.set(doc.id, doc.data());
    });

    // Build response
    const result = registrations.map(doc => {
      const regData = doc.data();
      const eventData = eventMap.get(regData.event_id) || {};
      const teamData = teamMap.get(regData.team_id) || null;

      return {
        reg_id: doc.id,
        event_id: regData.event_id,
        title: eventData?.title,
        date: eventData?.date,
        location: eventData?.location,
        poster: eventData?.poster,
        status: regData.status,
        is_leader: regData.is_leader,
        team_name: teamData?.name,
        team_id: regData.team_id,
        participation_type: eventData?.participation_type,
        max_team_size: eventData?.max_team_size
      };
    });

    // Sort by date ascending in JavaScript
    result.sort((a, b) => {
      const aDate = a.date ? (a.date.toDate ? a.date.toDate() : new Date(a.date)) : new Date(0);
      const bDate = b.date ? (b.date.toDate ? b.date.toDate() : new Date(b.date)) : new Date(0);
      return aDate - bDate;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyInvitations = async (req, res) => {
  const userId = req.user.id;

  try {
    const invitationsSnapshot = await db.collection('event_registrations')
      .where('user_id', '==', userId)
      .where('status', '==', 'Pending')
      .get();

    if (invitationsSnapshot.empty) {
      return res.json([]);
    }

    const invitations = invitationsSnapshot.docs.filter(doc => doc.data().team_id);

    // Collect unique IDs
    const teamIds = [...new Set(invitations.map(doc => doc.data().team_id))];
    const eventIds = [...new Set(invitations.map(doc => doc.data().event_id))];
    const leaderIds = [];

    // Fetch all teams first to get leader IDs
    const teamDocs = await Promise.all(
      teamIds.map(id => db.collection('teams').doc(id).get())
    );
    const teamMap = new Map();
    teamDocs.forEach(doc => {
      if (doc.exists) {
        teamMap.set(doc.id, doc.data());
        if (doc.data().leader_id) leaderIds.push(doc.data().leader_id);
      }
    });

    // Fetch all events
    const eventDocs = await Promise.all(
      eventIds.map(id => db.collection('events').doc(id).get())
    );
    const eventMap = new Map();
    eventDocs.forEach(doc => {
      if (doc.exists) eventMap.set(doc.id, doc.data());
    });

    // Fetch all leaders
    const leaderDocs = await Promise.all(
      [...new Set(leaderIds)].map(id => db.collection('users').doc(id).get())
    );
    const leaderMap = new Map();
    leaderDocs.forEach(doc => {
      if (doc.exists) leaderMap.set(doc.id, doc.data().name);
    });

    // Build response
    const result = invitations.map(doc => {
      const regData = doc.data();
      const teamData = teamMap.get(regData.team_id);
      const eventData = eventMap.get(regData.event_id);

      return {
        reg_id: doc.id,
        event_title: eventData?.title,
        team_name: teamData?.name,
        inviter_name: leaderMap.get(teamData?.leader_id) || 'Unknown',
        event_id: regData.event_id
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToInvitation = async (req, res) => {
  const { regId, response } = req.body;
  const userId = req.user.id;

  if (!['Accepted', 'Declined'].includes(response)) {
    return res.status(400).json({ message: 'Invalid response type' });
  }

  try {
    const regRef = db.collection('event_registrations').doc(regId);
    const regDoc = await regRef.get();
    
    if (!regDoc.exists || regDoc.data().user_id !== userId) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (response === 'Accepted') {
      await regRef.update({ status: 'Accepted' });
    } else {
      await regRef.delete();
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
    const registrationsSnapshot = await db.collection('event_registrations')
      .where('user_id', '==', userId)
      .where('event_id', '==', eventId)
      .get();
    
    if (registrationsSnapshot.empty) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const registration = { id: registrationsSnapshot.docs[0].id, ...registrationsSnapshot.docs[0].data() };

    if (registration.is_leader && registration.team_id) {
      // If leader unregisters, delete the whole team
      await db.collection('teams').doc(registration.team_id).delete();
    }
    
    await db.collection('event_registrations').doc(registration.id).delete();

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamName = async (req, res) => {
  const userId = req.user.id;
  const { teamId, newName } = req.body;

  try {
    const teamRef = db.collection('teams').doc(teamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists || teamDoc.data().leader_id !== userId) {
      return res.status(403).json({ message: 'Not authorized or team not found' });
    }

    await teamRef.update({ name: newName });
    res.json({ message: 'Team name updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteTeamMember = async (req, res) => {
  const userId = req.user.id;
  const { teamId, email } = req.body;

  try {
    const teamRef = db.collection('teams').doc(teamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists || teamDoc.data().leader_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const team = teamDoc.data();

    const eventDoc = await db.collection('events').doc(team.event_id).get();
    const maxTeamSize = eventDoc.data().max_team_size;

    const membersCount = (await db.collection('event_registrations')
      .where('team_id', '==', teamId)
      .get()).size;
    
    if (membersCount >= maxTeamSize) {
      return res.status(400).json({ message: 'Team limit reached' });
    }

    const userSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const invitedUser = userSnapshot.docs[0];
    const invitedId = invitedUser.id;

    const existsCheck = await db.collection('event_registrations')
      .where('user_id', '==', invitedId)
      .where('event_id', '==', team.event_id)
      .get();
    
    if (!existsCheck.empty) {
      return res.status(400).json({ message: 'User already in this event' });
    }

    await db.collection('event_registrations').add({
      user_id: invitedId,
      event_id: team.event_id,
      team_id: teamId,
      status: 'Pending',
      is_leader: false,
      registered_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Notify invited user
    const inviterName = req.user.name;
    const eventTitle = eventDoc.data().title;

    await createNotification(
      invitedId, 
      'event', 
      `${inviterName} invited you to join team "${team.name}" for ${eventTitle}`, 
      '/dashboard'
    );

    res.json({ message: 'Invitation sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeTeamMember = async (req, res) => {
  const userId = req.user.id;
  const { teamId, memberId } = req.body;

  try {
    const teamRef = db.collection('teams').doc(teamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists || teamDoc.data().leader_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (memberId === userId) {
      return res.status(400).json({ message: 'Cannot remove yourself. Use unregister.' });
    }

    const memberRegSnapshot = await db.collection('event_registrations')
      .where('team_id', '==', teamId)
      .where('user_id', '==', memberId)
      .get();
    
    if (!memberRegSnapshot.empty) {
      await db.collection('event_registrations').doc(memberRegSnapshot.docs[0].id).delete();
    }
    
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
    const registrationsSnapshot = await db.collection('event_registrations')
      .where('event_id', '==', req.params.id)
      .get();
    
    const registrations = [];
    
    for (const doc of registrationsSnapshot.docs) {
      const regData = doc.data();
      const userDoc = await db.collection('users').doc(regData.user_id).get();
      const userData = userDoc.data();
      
      let teamData = null;
      if (regData.team_id) {
        const teamDoc = await db.collection('teams').doc(regData.team_id).get();
        teamData = teamDoc.data();
      }
      
      registrations.push({
        name: userData?.name,
        email: userData?.email,
        gfg_score: userData?.gfg_score,
        gfg_solved: userData?.gfg_solved,
        problems_solved: userData?.problems_solved,
        user_id: regData.user_id,
        status: regData.status,
        is_leader: regData.is_leader,
        team_name: teamData?.name
      });
    }
    
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamStatus = async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
  
  try {
    const regSnapshot = await db.collection('event_registrations')
      .where('user_id', '==', userId)
      .where('event_id', '==', eventId)
      .get();

    if (regSnapshot.empty) {
      return res.json({ registered: false });
    }

    const regData = regSnapshot.docs[0].data();

    if (!regData.team_id) {
      return res.json({ registered: true, isTeam: false });
    }

    const teamDoc = await db.collection('teams').doc(regData.team_id).get();
    const teamData = teamDoc.data();

    const membersSnapshot = await db.collection('event_registrations')
      .where('team_id', '==', regData.team_id)
      .get();
    
    const members = [];
    for (const doc of membersSnapshot.docs) {
      const memberData = doc.data();
      const userDoc = await db.collection('users').doc(memberData.user_id).get();
      const userData = userDoc.data();
      
      members.push({
        user_id: memberData.user_id,
        name: userData?.name,
        email: userData?.email,
        status: memberData.status,
        is_leader: memberData.is_leader
      });
    }

    res.json({
      registered: true,
      isTeam: true,
      isLeader: !!regData.is_leader,
      teamId: regData.team_id,
      teamName: teamData?.name,
      members
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

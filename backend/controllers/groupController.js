import admin, { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

export const getGroups = async (req, res) => {
  try {
    const userId = req.user?.id;
    const isGuest = req.user?.role === 'Guest';
    
    let query = db.collection('community_groups');
    
    if (isGuest) {
      query = query.where('allow_guests', '==', true);
    }
    
    const snapshot = await query.orderBy('created_at', 'desc').get();
    
    const groups = [];
    
    for (const doc of snapshot.docs) {
      const groupData = doc.data();
      const userDoc = await db.collection('users').doc(groupData.created_by).get();
      const userData = userDoc.data();
      
      const membersSnapshot = await db.collection('group_members')
        .where('group_id', '==', doc.id)
        .where('status', '==', 'Accepted')
        .get();
      
      let userStatus = null;
      if (userId) {
        const membershipCheck = await db.collection('group_members')
          .where('group_id', '==', doc.id)
          .where('user_id', '==', userId)
          .get();
        
        if (!membershipCheck.empty) {
          userStatus = membershipCheck.docs[0].data().status;
        }
      }
      
      groups.push({
        id: doc.id,
        ...groupData,
        creator_name: userData?.name,
        member_count: membersSnapshot.size,
        user_status: userStatus
      });
    }
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  
  try {
    const groupRef = db.collection('community_groups').doc(id);
    const groupDoc = await groupRef.get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const groupData = groupDoc.data();
    const userDoc = await db.collection('users').doc(groupData.created_by).get();
    const userData = userDoc.data();
    
    const membersSnapshot = await db.collection('group_members')
      .where('group_id', '==', id)
      .where('status', '==', 'Accepted')
      .get();
    
    let userStatus = null;
    let userRole = null;
    
    if (userId) {
      const membershipCheck = await db.collection('group_members')
        .where('group_id', '==', id)
        .where('user_id', '==', userId)
        .get();
      
      if (!membershipCheck.empty) {
        const membershipData = membershipCheck.docs[0].data();
        userStatus = membershipData.status;
        userRole = membershipData.role;
      }
    }
    
    res.json({
      id: groupDoc.id,
      ...groupData,
      creator_name: userData?.name,
      member_count: membersSnapshot.size,
      user_status: userStatus,
      user_role: userRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  const { title, description, logo, max_members, allow_guests } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Only Core/Admin can create groups' });
  }

  try {
    const groupRef = db.collection('community_groups').doc();
    const groupData = {
      title,
      description: description || null,
      logo: logo || null,
      created_by: userId,
      max_members: max_members || 100,
      allow_guests: allow_guests || false,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await groupRef.set(groupData);

    // Creator is automatically an Admin member
    await db.collection('group_members').add({
      group_id: groupRef.id,
      user_id: userId,
      status: 'Accepted',
      role: 'Admin',
      joined_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ id: groupRef.id, title, message: 'Group created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  try {
    const groupRef = db.collection('community_groups').doc(groupId);
    const groupDoc = await groupRef.get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const groupData = groupDoc.data();

    if (req.user.role === 'Guest' && !groupData.allow_guests) {
      return res.status(403).json({ message: 'Guests are not allowed to join this restricted sector' });
    }

    const membersSnapshot = await db.collection('group_members')
      .where('group_id', '==', groupId)
      .where('status', '==', 'Accepted')
      .get();
    
    if (membersSnapshot.size >= groupData.max_members) {
      return res.status(400).json({ message: 'Group is full' });
    }

    await db.collection('group_members').add({
      group_id: groupId,
      user_id: userId,
      status: 'Pending',
      role: 'Member',
      joined_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Notify group creator
    const userDoc = await db.collection('users').doc(userId).get();
    const userName = userDoc.data().name;
    
    await createNotification(
      groupData.created_by, 
      'approval', 
      `${userName} requested to join group "${groupData.title}"`, 
      `/community/group/${groupId}`
    );

    res.status(201).json({ message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get groups created by this user
    const groupsSnapshot = await db.collection('community_groups')
      .where('created_by', '==', userId)
      .get();
    
    const groupIds = groupsSnapshot.docs.map(doc => doc.id);
    
    const requests = [];
    
    for (const groupId of groupIds) {
      const membersSnapshot = await db.collection('group_members')
        .where('group_id', '==', groupId)
        .where('status', '==', 'Pending')
        .get();
      
      for (const doc of membersSnapshot.docs) {
        const memberData = doc.data();
        const userDoc = await db.collection('users').doc(memberData.user_id).get();
        const userData = userDoc.data();
        const groupDoc = await db.collection('community_groups').doc(groupId).get();
        
        requests.push({
          id: doc.id,
          ...memberData,
          user_name: userData?.name,
          group_title: groupDoc.data()?.title
        });
      }
    }
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  const { requestId, status } = req.body;
  const userId = req.user.id;

  try {
    const memberRef = db.collection('group_members').doc(requestId);
    const memberDoc = await memberRef.get();
    
    if (!memberDoc.exists) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const memberData = memberDoc.data();
    
    const groupDoc = await db.collection('community_groups').doc(memberData.group_id).get();
    const groupData = groupDoc.data();
    
    if (groupData.created_by !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (status === 'Accepted') {
      await memberRef.update({ status: 'Accepted', role: 'Member' });
      await createNotification(
        memberData.user_id, 
        'community', 
        `Your request to join group "${groupData.title}" was accepted!`, 
        `/community/group/${memberData.group_id}`
      );
    } else {
      await memberRef.delete();
      await createNotification(
        memberData.user_id, 
        'community', 
        `Your request to join group "${groupData.title}" was declined.`, 
        `/community`
      );
    }

    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupMembers = async (req, res) => {
  const { id } = req.params;
  
  try {
    const snapshot = await db.collection('group_members')
      .where('group_id', '==', id)
      .where('status', '==', 'Accepted')
      .get();
    
    const members = [];
    
    for (const doc of snapshot.docs) {
      const memberData = doc.data();
      const userDoc = await db.collection('users').doc(memberData.user_id).get();
      const userData = userDoc.data();
      
      members.push({
        id: doc.id,
        ...memberData,
        user_name: userData?.name,
        user_pic: userData?.profile_pic
      });
    }
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

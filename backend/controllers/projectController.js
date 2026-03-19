import admin, { db } from '../config/firebase.js';
import { createNotification, notifyAdmins } from './notificationController.js';

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const projectRef = db.collection('projects').doc(id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    const userDoc = await db.collection('users').doc(projectData.created_by).get();
    const userData = userDoc.data();
    
    // Get vote score
    const votesSnapshot = await db.collection('project_votes')
      .where('project_id', '==', id)
      .get();
    
    const voteScore = votesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().vote_type || 0), 0);
    
    // Get files
    const filesSnapshot = await db.collection('project_files')
      .where('project_id', '==', id)
      .get();
    
    const files = filesSnapshot.docs.map(doc => doc.data().file_url);
    
    res.json({
      id: projectDoc.id,
      ...projectData,
      creator_name: userData?.name,
      vote_score: voteScore,
      files
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  const { category, status, userId } = req.query;
  const userRole = req.user?.role;

  try {
    let query = db.collection('projects');

    if (userRole === 'Admin' || userRole === 'Core') {
      if (status) {
        query = query.where('status', '==', status);
      }
    } else {
      query = query.where('status', '==', 'Approved');
    }

    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    if (userId) {
      query = query.where('created_by', '==', userId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json([]);
    }

    // Collect all unique user IDs
    const userIds = [...new Set(snapshot.docs.map(doc => doc.data().created_by))];
    const projectIds = snapshot.docs.map(doc => doc.id);

    // Fetch all users in parallel
    const userDocs = await Promise.all(
      userIds.map(id => db.collection('users').doc(id).get())
    );
    const userMap = new Map();
    userDocs.forEach(doc => {
      if (doc.exists) userMap.set(doc.id, doc.data().name);
    });

    // Fetch all votes in parallel
    const votesPromises = projectIds.map(id =>
      db.collection('project_votes')
        .where('project_id', '==', id)
        .get()
    );
    const votesSnapshots = await Promise.all(votesPromises);
    const voteMap = new Map();
    votesSnapshots.forEach((votesSnapshot, index) => {
      const score = votesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().vote_type || 0), 0);
      voteMap.set(projectIds[index], score);
    });

    // Fetch all files in parallel
    const filesPromises = projectIds.map(id =>
      db.collection('project_files')
        .where('project_id', '==', id)
        .get()
    );
    const filesSnapshots = await Promise.all(filesPromises);
    const filesMap = new Map();
    filesSnapshots.forEach((filesSnapshot, index) => {
      const files = filesSnapshot.docs.map(d => d.data().file_url);
      filesMap.set(projectIds[index], files);
    });

    // Build response
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      creator_name: userMap.get(doc.data().created_by) || 'Unknown',
      vote_score: voteMap.get(doc.id) || 0,
      files: filesMap.get(doc.id) || []
    }));

    // Sort by created_at descending in JavaScript
    projects.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return bDate - aDate;
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, github_link, demo_link, tech_stack, category, files } = req.body;
  const userId = req.user.id;

  try {
    const projectRef = db.collection('projects').doc();
    const projectData = {
      title,
      description: description || null,
      github_link: github_link || null,
      demo_link: demo_link || null,
      tech_stack: tech_stack || null,
      category: category || null,
      created_by: userId,
      status: 'Pending',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await projectRef.set(projectData);

    if (files && Array.isArray(files)) {
      const batch = db.batch();
      for (const file of files) {
        const fileRef = db.collection('project_files').doc();
        batch.set(fileRef, {
          project_id: projectRef.id,
          file_name: file.name || null,
          file_url: file.url,
          file_type: file.type || null,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      await batch.commit();
    }

    // Notify admins about the new project
    await notifyAdmins('project', `New project submission: ${title}`, `/projects/${projectRef.id}`);

    res.status(201).json({ id: projectRef.id, title, status: 'Pending' });
  } catch (error) {
    console.error('CREATE PROJECT FULL ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  const { title, description, github_link, demo_link, tech_stack, category } = req.body;
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    
    if (projectData.created_by !== userId && req.user.role !== 'Admin' && req.user.role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If an approved project is edited, reset it to Pending
    const newStatus = projectData.status === 'Approved' ? 'Pending' : projectData.status;

    await projectRef.update({
      title,
      description: description || null,
      github_link: github_link || null,
      demo_link: demo_link || null,
      tech_stack: tech_stack || null,
      category: category || null,
      status: newStatus
    });

    res.json({ message: 'Project updated and sent for re-approval', status: newStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  const projectId = req.params.id;
  const { id: userId, role } = req.user;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    
    if (projectData.created_by !== userId && role !== 'Admin' && role !== 'Core') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await projectRef.delete();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'Admin' && userRole !== 'Core') {
    return res.status(403).json({ message: 'Not authorized to approve projects' });
  }

  try {
    const projectRef = db.collection('projects').doc(req.params.id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const projectData = projectDoc.data();

    await projectRef.update({ status });

    // Notify the creator about the status update
    await createNotification(
      projectData.created_by, 
      'project', 
      `Your project "${projectData.title}" status has been updated to: ${status}`, 
      `/projects/${req.params.id}`
    );

    res.json({ message: `Project ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voteProject = async (req, res) => {
  const { projectId, voteType } = req.body;
  const userId = req.user.id;

  try {
    const existingSnapshot = await db.collection('project_votes')
      .where('user_id', '==', userId)
      .where('project_id', '==', projectId)
      .get();

    if (!existingSnapshot.empty) {
      const existingVote = existingSnapshot.docs[0];
      if (existingVote.data().vote_type === voteType) {
        await db.collection('project_votes').doc(existingVote.id).delete();
        return res.json({ message: 'Vote removed' });
      } else {
        await db.collection('project_votes').doc(existingVote.id).update({ vote_type: voteType });
        return res.json({ message: 'Vote updated' });
      }
    }

    await db.collection('project_votes').add({
      user_id: userId,
      project_id: projectId,
      vote_type: voteType,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ message: 'Voted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const snapshot = await db.collection('projects')
      .where('created_by', '==', req.user.id)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const projectIds = snapshot.docs.map(doc => doc.id);

    // Fetch all votes in parallel
    const votesPromises = projectIds.map(id =>
      db.collection('project_votes')
        .where('project_id', '==', id)
        .get()
    );
    const votesSnapshots = await Promise.all(votesPromises);
    const voteMap = new Map();
    votesSnapshots.forEach((votesSnapshot, index) => {
      const score = votesSnapshot.docs.reduce((sum, d) => sum + (d.data().vote_type || 0), 0);
      voteMap.set(projectIds[index], score);
    });

    // Build response
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      vote_score: voteMap.get(doc.id) || 0
    }));

    // Sort by created_at descending in JavaScript
    projects.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return bDate - aDate;
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

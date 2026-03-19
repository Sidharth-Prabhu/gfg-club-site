import { db } from '../config/firebase.js';

export const getLeaderboard = async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('status', '==', 'Approved')
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const users = [];
    const userIds = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      if (userData.role === 'Guest' || !userData.gfg_score || userData.gfg_score <= 0) continue;

      users.push({
        id: doc.id,
        name: userData.name,
        department: userData.department,
        year: userData.year,
        gfg_score: userData.gfg_score,
        gfg_solved: userData.gfg_solved,
        problems_solved: userData.problems_solved,
        weekly_points: userData.weekly_points || 0,
        streak: userData.streak,
        role: userData.role,
        profile_pic: userData.profile_pic,
        discussion_count: 0,
        comment_count: 0
      });
      userIds.push(doc.id);
    }

    // Fetch all discussions in parallel
    const discussionsPromises = userIds.map(id =>
      db.collection('discussions')
        .where('author_id', '==', id)
        .get()
    );
    const discussionsSnapshots = await Promise.all(discussionsPromises);
    const discussionMap = new Map();
    discussionsSnapshots.forEach((snapshot, index) => {
      discussionMap.set(userIds[index], snapshot.size);
    });

    // Fetch all comments in parallel
    const commentsPromises = userIds.map(id =>
      db.collection('post_comments')
        .where('user_id', '==', id)
        .get()
    );
    const commentsSnapshots = await Promise.all(commentsPromises);
    const commentMap = new Map();
    commentsSnapshots.forEach((snapshot, index) => {
      commentMap.set(userIds[index], snapshot.size);
    });

    // Update counts
    users.forEach(user => {
      user.discussion_count = discussionMap.get(user.id) || 0;
      user.comment_count = commentMap.get(user.id) || 0;
    });

    // Sort by gfg_score descending and limit to 50
    users.sort((a, b) => b.gfg_score - a.gfg_score);
    const topUsers = users.slice(0, 50);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('status', '==', 'Approved')
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const users = [];
    const userIds = [];

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      if (userData.role === 'Guest' || !userData.weekly_points || userData.weekly_points <= 0) continue;

      users.push({
        id: doc.id,
        name: userData.name,
        department: userData.department,
        year: userData.year,
        gfg_score: userData.gfg_score,
        weekly_points: userData.weekly_points,
        streak: userData.streak,
        role: userData.role,
        profile_pic: userData.profile_pic,
        discussion_count: 0,
        comment_count: 0
      });
      userIds.push(doc.id);
    }

    // Fetch all discussions in parallel
    const discussionsPromises = userIds.map(id =>
      db.collection('discussions')
        .where('author_id', '==', id)
        .get()
    );
    const discussionsSnapshots = await Promise.all(discussionsPromises);
    const discussionMap = new Map();
    discussionsSnapshots.forEach((snapshot, index) => {
      discussionMap.set(userIds[index], snapshot.size);
    });

    // Fetch all comments in parallel
    const commentsPromises = userIds.map(id =>
      db.collection('post_comments')
        .where('user_id', '==', id)
        .get()
    );
    const commentsSnapshots = await Promise.all(commentsPromises);
    const commentMap = new Map();
    commentsSnapshots.forEach((snapshot, index) => {
      commentMap.set(userIds[index], snapshot.size);
    });

    // Update counts
    users.forEach(user => {
      user.discussion_count = discussionMap.get(user.id) || 0;
      user.comment_count = commentMap.get(user.id) || 0;
    });

    // Sort by weekly_points descending and limit to 50
    users.sort((a, b) => b.weekly_points - a.weekly_points);
    const topUsers = users.slice(0, 50);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

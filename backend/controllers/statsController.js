import { db } from '../config/firebase.js';

export const getCampusStats = async (req, res) => {
  try {
    const membersSnapshot = await db.collection('users').get();
    const membersCount = membersSnapshot.size;
    
    let totalProblemsSolved = 0;
    let activeCoders = 0;
    
    membersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      totalProblemsSolved += (userData.problems_solved || 0);
      if (userData.problems_solved > 0) activeCoders++;
    });

    res.json({
      totalMembers: membersCount,
      totalProblemsSolved,
      activeCoders,
      weeklyContests: 12 // static or derived from events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get last 365 days of activity
    const snapshot = await db.collection('user_activity')
      .where('user_id', '==', userId)
      .get();
    
    const activities = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);
    
    for (const doc of snapshot.docs) {
      const activityData = doc.data();
      const activityDate = activityData.activity_date;
      
      // Filter for last 365 days
      if (activityDate >= oneYearAgo.toISOString().split('T')[0]) {
        activities.push({
          date: activityData.activity_date,
          count: activityData.problems_solved || 0
        });
      }
    }
    
    // Sort by date ascending
    activities.sort((a, b) => a.date.localeCompare(b.date));
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activity:', error.message);
    res.json([]);
  }
};

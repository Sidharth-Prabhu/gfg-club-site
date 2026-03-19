import axios from 'axios';
import * as cheerio from 'cheerio';
import admin, { db, auth } from '../config/firebase.js';

const updateStreak = async (userId) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return;
        
        const user = userDoc.data();

        // Get local date in YYYY-MM-DD format
        const today = new Date().toLocaleDateString('en-CA');

        // If first time logging in
        if (!user.last_login) {
            await userRef.update({ last_login: today, streak: 1 });
            return;
        }

        const lastLoginStr = new Date(user.last_login).toLocaleDateString('en-CA');

        // Logic: Same day login - do nothing
        if (lastLoginStr === today) {
            return;
        }

        const lastLoginDate = new Date(lastLoginStr);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastLoginDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day login - increment
            await userRef.update({ 
                last_login: today, 
                streak: admin.firestore.FieldValue.increment(1) 
            });
        } else if (diffDays > 1) {
            // Missed one or more days - reset to 1
            await userRef.update({ last_login: today, streak: 1 });
        }
    } catch (err) {
        console.error('Streak Update Error:', err.message);
    }
};

export const getUserProfile = async (req, res) => {
  try {
    await updateStreak(req.user.id);

    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = { id: userDoc.id, ...userDoc.data() };

    // Get counts from subcollections
    const commentCount = (await db.collection('post_comments').where('user_id', '==', req.user.id).get()).size;
    const discussionCount = (await db.collection('discussions').where('author_id', '==', req.user.id).get()).size;

    res.json({
      ...user,
      comment_count: commentCount,
      discussion_count: discussionCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists || userDoc.data().status !== 'Approved') {
      return res.status(404).json({ message: 'User not found or not approved' });
    }

    const user = { id: userDoc.id, ...userDoc.data() };

    // Get counts from subcollections
    const discussionCount = (await db.collection('discussions').where('author_id', '==', id).get()).size;
    const commentCount = (await db.collection('post_comments').where('user_id', '==', id).get()).size;
    const projectCount = (await db.collection('projects').where('created_by', '==', id).where('status', '==', 'Approved').get()).size;

    res.json({
      ...user,
      discussion_count: discussionCount,
      comment_count: commentCount,
      project_count: projectCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicants = async (req, res) => {
  const userRole = String(req.user.role).trim();
  if (userRole !== 'Admin') return res.status(403).json({ message: 'Admin access required' });

  try {
    const snapshot = await db.collection('users')
      .where('status', '==', 'Pending')
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by created_at descending in JavaScript
    users.sort((a, b) => {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(0);
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(0);
      return bDate - aDate;
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveUser = async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admin access required' });
  const { id } = req.params;
  
  try {
    await db.collection('users').doc(id).update({ status: 'Approved' });
    res.json({ message: 'User approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectUser = async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Admin access required' });
  const { id } = req.params;
  
  try {
    await db.collection('users').doc(id).update({ status: 'Rejected' });
    res.json({ message: 'User rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { name, email, department, year, gfg_profile, leetcode_profile, codeforces_profile, github_profile, skills, about, profile_pic } = req.body;

  try {
    // Restrict Guest users from updating sensitive fields
    const isGuest = req.user.role === 'Guest';
    
    const updateData = {
      name,
      email: email?.toLowerCase(),
      department: department || null,
      year: year || null,
      gfg_profile: gfg_profile || null,
      leetcode_profile: leetcode_profile || null,
      codeforces_profile: codeforces_profile || null,
      github_profile: github_profile || null,
      skills: isGuest ? null : skills || null,
      about: isGuest ? null : about || null,
      profile_pic: isGuest ? null : profile_pic || null,
    };

    await db.collection('users').doc(req.user.id).update(updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncProfiles = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    let gfgSolved = 0;
    let gfgScore = 0;
    let leetcodeSolved = 0;
    let githubRepos = 0;
    let solvedSlugs = [];

    if (user.github_profile) {
      try {
        const username = user.github_profile.split('/').filter(Boolean).pop();
        const { data } = await axios.get(`https://api.github.com/users/${username}`);
        githubRepos = data.public_repos || 0;
      } catch (err) { console.error('GitHub Sync failed:', err.message); }
    }

    if (user.leetcode_profile) {
      try {
        const username = user.leetcode_profile.split('/u/')[1]?.split('/')[0] || user.leetcode_profile.split('/').filter(Boolean).pop();
        const query = {
          query: `query userProblemsSolved($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count } } } }`,
          variables: { username }
        };
        const { data: gqlRes } = await axios.post('https://leetcode.com/graphql', query);
        leetcodeSolved = gqlRes.data.matchedUser.submitStats.acSubmissionNum.find(x => x.difficulty === 'All').count || 0;
      } catch (err) { console.error('LeetCode Sync failed:', err.message); }
    }

    if (user.gfg_profile) {
      try {
        let username = '';
        if (user.gfg_profile.includes('/profile/')) {
            username = user.gfg_profile.split('/profile/')[1].split(/[/?#]/)[0];
        } else if (user.gfg_profile.includes('/user/')) {
            username = user.gfg_profile.split('/user/')[1].split(/[/?#]/)[0];
        } else {
            username = user.gfg_profile.split('/').filter(Boolean).pop();
        }

        const targetUrl = `https://www.geeksforgeeks.org/profile/${username}?tab=activity`;
        const { data: html } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });

        const userDataIndex = html.indexOf('userData');
        if (userDataIndex !== -1) {
            const chunk = html.substring(userDataIndex, userDataIndex + 2000);
            const scoreMatch = chunk.match(/\\?"score\\?":\s?(\d+)/);
            const solvedMatch = chunk.match(/\\?"total_problems_solved\\?":\s?(\d+)/);
            if (scoreMatch) gfgScore = parseInt(scoreMatch[1]);
            if (solvedMatch) gfgSolved = parseInt(solvedMatch[1]);
        }

        const solvedMatches = html.matchAll(/\\?"problem_slug\\?":\s?\\?"([^"]+)\\?"/g);
        for (const match of solvedMatches) {
            if (match[1]) solvedSlugs.push(match[1]);
        }

        const slugMatches = html.matchAll(/"slug":"([^"]+)"/g);
        for (const match of slugMatches) {
            if (match[1] && !match[1].includes('/') && match[1].length > 2) solvedSlugs.push(match[1]);
        }

        solvedSlugs = [...new Set(solvedSlugs)];
        console.log(`GFG SYNC SUCCESS -> User: ${username}, Solved: ${gfgSolved}, Score: ${gfgScore}`);
      } catch (err) { console.error('GfG Sync failed:', err.message); }
    }

    const totalSolved = gfgSolved + leetcodeSolved;

    await userRef.update({
      gfg_solved: gfgSolved,
      gfg_score: gfgScore,
      leetcode_solved: leetcodeSolved,
      github_repos: githubRepos,
      problems_solved: totalSolved,
      last_synced: admin.firestore.FieldValue.serverTimestamp()
    });

    if (solvedSlugs.length > 0) {
        const batch = db.batch();
        for (const slug of solvedSlugs) {
            const docRef = db.collection('solved_problems').doc(`${userId}_${slug}`);
            batch.set(docRef, { user_id: userId, problem_slug: slug });
        }
        await batch.commit();
    }

    // Update user activity
    const today = new Date().toLocaleDateString('en-CA');
    const activityRef = db.collection('user_activity').doc(`${userId}_${today}`);
    const activityDoc = await activityRef.get();
    
    if (activityDoc.exists) {
      await activityRef.update({ problems_solved: totalSolved });
    } else {
      await activityRef.set({
        user_id: userId,
        activity_date: today,
        problems_solved: totalSolved
      });
    }

    res.json({ message: 'Sync successful', stats: { gfgSolved, gfgScore, leetcodeSolved, githubRepos, totalSolved } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

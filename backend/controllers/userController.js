import axios from 'axios';
import * as cheerio from 'cheerio';
import pool from '../config/db.js';

export const getUserProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, department, year, gfg_profile, leetcode_profile, codeforces_profile, github_profile, problems_solved, gfg_solved, gfg_score, leetcode_solved, github_repos, weekly_points, streak, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = rows[0];

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { name, email, department, year, gfg_profile, leetcode_profile, codeforces_profile, github_profile } = req.body;

  try {
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, department = ?, year = ?, gfg_profile = ?, leetcode_profile = ?, codeforces_profile = ?, github_profile = ? WHERE id = ?',
      [name, email, department, year, gfg_profile, leetcode_profile, codeforces_profile, github_profile, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncProfiles = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute('SELECT gfg_profile, leetcode_profile, github_profile FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    let gfgSolved = 0;
    let gfgScore = 0;
    let leetcodeSolved = 0;
    let githubRepos = 0;

    // GitHub Sync
    if (user.github_profile) {
      try {
        const username = user.github_profile.split('/').filter(Boolean).pop();
        const { data } = await axios.get(`https://api.github.com/users/${username}`);
        githubRepos = data.public_repos || 0;
      } catch (err) { console.error('GitHub Sync failed:', err.message); }
    }

    // LeetCode Sync
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

    // GfG Sync (Ultra-Robust Pattern Matching)
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

        // 1. Search for the userData block specifically (handles escaped quotes)
        const userDataIndex = html.indexOf('userData');
        if (userDataIndex !== -1) {
            // Extract a chunk of 2000 characters after "userData" to find the stats
            const chunk = html.substring(userDataIndex, userDataIndex + 2000);
            
            // Regex to match both \"key\":val and "key":val
            const scoreMatch = chunk.match(/\\?"score\\?":\s?(\d+)/);
            const solvedMatch = chunk.match(/\\?"total_problems_solved\\?":\s?(\d+)/);
            
            if (scoreMatch) gfgScore = parseInt(scoreMatch[1]);
            if (solvedMatch) gfgSolved = parseInt(solvedMatch[1]);
        }

        // 2. Global Fallback if userData chunk didn't have it
        if (gfgSolved === 0) {
            const globalSolvedMatch = html.match(/\\?"total_problems_solved\\?":\s?(\d+)/);
            if (globalSolvedMatch) gfgSolved = parseInt(globalSolvedMatch[1]);
        }
        if (gfgScore === 0) {
            const globalScoreMatch = html.match(/\\?"score\\?":\s?(\d+)/);
            if (globalScoreMatch) gfgScore = parseInt(globalScoreMatch[1]);
        }

        // 3. Last Resort: Legacy Selector Scraping
        if (gfgSolved === 0 || gfgScore === 0) {
            const $ = cheerio.load(html);
            $('.score_card_value').each((i, el) => {
                const label = $(el).parent().text().toLowerCase();
                const val = parseInt($(el).text().replace(/,/g, '')) || 0;
                if (label.includes('score')) gfgScore = val;
                if (label.includes('solved')) gfgSolved = val;
            });
        }

        console.log(`GFG SYNC SUCCESS -> User: ${username}, Solved: ${gfgSolved}, Score: ${gfgScore}`);
      } catch (err) { console.error('GfG Sync failed:', err.message); }
    }

    const totalSolved = gfgSolved + leetcodeSolved;

    await pool.execute(
      'UPDATE users SET gfg_solved = ?, gfg_score = ?, leetcode_solved = ?, github_repos = ?, problems_solved = ?, last_synced = CURRENT_TIMESTAMP WHERE id = ?',
      [gfgSolved, gfgScore, leetcodeSolved, githubRepos, totalSolved, userId]
    );

    const [existing] = await pool.execute('SELECT * FROM user_activity WHERE user_id = ? AND activity_date = CURDATE()', [userId]);
    if (existing.length > 0) {
      await pool.execute('UPDATE user_activity SET problems_solved = ? WHERE id = ?', [totalSolved, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO user_activity (user_id, activity_date, problems_solved) VALUES (?, CURDATE(), ?)', [userId, totalSolved]);
    }

    res.json({ message: 'Sync successful', stats: { gfgSolved, gfgScore, leetcodeSolved, githubRepos, totalSolved } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

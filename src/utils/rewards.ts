import { faCode, faStar, faChartLine, faMessage, faComments } from '@fortawesome/free-solid-svg-icons';

export const REWARD_LEVELS = [
  { level: 1, name: 'Novice', problems: 5, score: 50, streak: 1, comments: 2, posts: 1, color: '#94a3b8' },
  { level: 2, name: 'Apprentice', problems: 20, score: 200, streak: 3, comments: 5, posts: 2, color: '#4ade80' },
  { level: 3, name: 'Enthusiast', problems: 50, score: 500, streak: 7, comments: 10, posts: 4, color: '#22d3ee' },
  { level: 4, name: 'Coder', problems: 100, score: 1000, streak: 14, comments: 20, posts: 7, color: '#818cf8' },
  { level: 5, name: 'Problem Solver', problems: 200, score: 2000, streak: 30, comments: 40, posts: 10, color: '#fb923c' },
  { level: 6, name: 'Specialist', problems: 400, score: 4000, streak: 45, comments: 70, posts: 15, color: '#f472b6' },
  { level: 7, name: 'Expert', problems: 700, score: 7000, streak: 60, comments: 100, posts: 20, color: '#a78bfa' },
  { level: 8, name: 'Master', problems: 1100, score: 11000, streak: 90, comments: 150, posts: 30, color: '#facc15' },
  { level: 9, name: 'Grandmaster', problems: 1600, score: 16000, streak: 120, comments: 250, posts: 45, color: '#ef4444' },
  { level: 10, name: 'Legend', problems: 2200, score: 22000, streak: 180, comments: 400, posts: 70, color: '#ec4899' },
  { level: 11, name: 'Mythic', problems: 3000, score: 30000, streak: 365, comments: 600, posts: 100, color: '#f8fafc' },
];

export const calculateLevel = (profile: any) => {
  if (!profile) return 0;
  let lvl = 0;
  for (const l of REWARD_LEVELS) {
    if (
      (profile.problems_solved || 0) >= l.problems &&
      (profile.gfg_score || 0) >= l.score &&
      (profile.streak || 0) >= l.streak &&
      (profile.comment_count || 0) >= l.comments &&
      (profile.discussion_count || 0) >= l.posts
    ) {
      lvl = l.level;
    } else {
      break;
    }
  }
  return lvl;
};

export const getRewardMetrics = (profile: any, nextLevel: any) => [
  { label: 'Problems', current: profile?.problems_solved || 0, target: nextLevel.problems, icon: faCode },
  { label: 'GfG Score', current: profile?.gfg_score || 0, target: nextLevel.score, icon: faStar },
  { label: 'Streak', current: profile?.streak || 0, target: nextLevel.streak, icon: faChartLine },
  { label: 'Comments', current: profile?.comment_count || 0, target: nextLevel.comments, icon: faMessage },
  { label: 'Posts', current: profile?.discussion_count || 0, target: nextLevel.posts, icon: faComments }
];

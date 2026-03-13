import express from 'express';
import { getLeaderboard, getWeeklyLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;

import express from 'express';
import { getCampusStats, getUserActivity } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/campus', getCampusStats);
router.get('/user-activity', protect, getUserActivity);

export default router;

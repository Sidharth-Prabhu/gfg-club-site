import express from 'express';
import { getDiscussions, createDiscussion } from '../controllers/discussionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDiscussions).post(protect, createDiscussion);

export default router;

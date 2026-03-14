import express from 'express';
import { getProblems, createProblem, getProblemOfTheDay } from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getProblems).post(protect, createProblem);
router.get('/potd', getProblemOfTheDay);

export default router;

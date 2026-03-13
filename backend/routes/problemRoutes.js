import express from 'express';
import { getProblems, createProblem } from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getProblems).post(protect, createProblem);

export default router;

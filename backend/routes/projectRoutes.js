import express from 'express';
import { getProjects, createProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProjects).post(protect, createProject);

export default router;

import express from 'express';
import { 
  getProjects, 
  createProject, 
  updateProject,
  deleteProject, 
  updateProjectStatus, 
  voteProject,
  getUserProjects
} from '../controllers/projectController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.put('/:id/status', protect, updateProjectStatus);
router.post('/vote', protect, voteProject);
router.get('/my-projects', protect, getUserProjects);

export default router;

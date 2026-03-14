import express from 'express';
import { 
  getProjects, 
  getProjectById,
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

router.get('/my-projects', protect, getUserProjects);
router.post('/vote', protect, voteProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.put('/:id/status', protect, updateProjectStatus);

export default router;

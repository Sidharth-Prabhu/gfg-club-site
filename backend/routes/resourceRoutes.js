import express from 'express';
import { 
  getResources, 
  createResource, 
  deleteResource,
  searchGfgResources,
  fetchGfgArticle,
  fetchGfgCourses,
  fetchGfgCourseDetail
} from '../controllers/resourceController.js';
import { protect, isApproved } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResources)
  .post(protect, isApproved, createResource);

router.get('/search-gfg', protect, isApproved, searchGfgResources);
router.get('/fetch-article', protect, isApproved, fetchGfgArticle);
router.get('/fetch-courses', protect, isApproved, fetchGfgCourses);
router.get('/fetch-course-detail', protect, isApproved, fetchGfgCourseDetail);

router.route('/:id')
  .delete(protect, deleteResource);

export default router;

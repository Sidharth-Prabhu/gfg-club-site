import express from 'express';
import { 
  getResources, 
  createResource, 
  deleteResource,
  searchGfgResources,
  fetchGfgArticle
} from '../controllers/resourceController.js';
import { protect, isApproved } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResources)
  .post(protect, isApproved, createResource);

router.get('/search-gfg', protect, isApproved, searchGfgResources);
router.get('/fetch-article', protect, isApproved, fetchGfgArticle);

router.route('/:id')
  .delete(protect, deleteResource);

export default router;

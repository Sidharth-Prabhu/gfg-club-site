import express from 'express';
import { getResources, createResource, deleteResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getResources)
  .post(protect, createResource);

router.route('/:id')
  .delete(protect, deleteResource);

export default router;

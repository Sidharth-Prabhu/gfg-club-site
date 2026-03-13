import express from 'express';
import { getBlogs, createBlog } from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBlogs).post(protect, createBlog);

export default router;

import express from 'express';
import { 
  getDiscussions, 
  createDiscussion, 
  deleteDiscussion, 
  reactToPost, 
  getComments, 
  addComment,
  reactToComment
} from '../controllers/discussionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .delete(protect, deleteDiscussion);

router.post('/react', protect, reactToPost);
router.post('/react-comment', protect, reactToComment);
router.get('/:postId/comments', getComments);
router.post('/comments', protect, addComment);

export default router;

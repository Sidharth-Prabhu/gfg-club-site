import express from 'express';
import { 
  getDiscussions, 
  getDiscussionById,
  createDiscussion, 
  updateDiscussion,
  deleteDiscussion, 
  reactToPost, 
  getComments, 
  addComment,
  updateComment,
  deleteComment,
  reactToComment
} from '../controllers/discussionController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .get(getDiscussionById)
  .put(protect, updateDiscussion)
  .delete(protect, deleteDiscussion);

router.post('/react', protect, reactToPost);
router.post('/react-comment', protect, reactToComment);
router.get('/:postId/comments', getComments);
router.post('/comments', protect, addComment);

router.route('/comments/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

export default router;

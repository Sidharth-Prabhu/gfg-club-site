import express from 'express';
import { 
  getGroups, 
  getGroupById, 
  createGroup, 
  joinGroup, 
  getPendingRequests, 
  respondToRequest,
  getGroupMembers
} from '../controllers/groupController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getGroups)
  .post(protect, createGroup);

router.get('/pending-requests', protect, getPendingRequests);
router.post('/respond-request', protect, respondToRequest);
router.post('/join', protect, joinGroup);

router.route('/:id')
  .get(optionalProtect, getGroupById);

router.get('/:id/members', optionalProtect, getGroupMembers);

export default router;

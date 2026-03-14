import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  syncProfiles, 
  getApplicants, 
  approveUser, 
  rejectUser, 
  getUserProfileById 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/sync-profiles', protect, syncProfiles);

router.get('/applicants', protect, getApplicants);
router.put('/applicants/:id/approve', protect, approveUser);
router.put('/applicants/:id/reject', protect, rejectUser);
router.get('/:id', getUserProfileById);

export default router;

import express from 'express';
import { getUserProfile, updateUserProfile, syncProfiles } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/sync-profiles', protect, syncProfiles);

export default router;

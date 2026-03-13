import express from 'express';
import { getEvents, createEvent, getEventById, registerForEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getEvents).post(protect, createEvent);
router.route('/:id').get(getEventById);
router.route('/register').post(protect, registerForEvent);

export default router;

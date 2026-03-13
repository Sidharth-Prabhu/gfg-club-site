import express from 'express';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  registerForEvent, 
  getEventRegistrations 
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.post('/register', protect, registerForEvent);
router.get('/:id/registrations', protect, getEventRegistrations);

export default router;

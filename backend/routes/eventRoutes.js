import express from 'express';
import { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  registerForEvent, 
  getEventRegistrations,
  getMyInvitations,
  respondToInvitation,
  getTeamStatus
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.get('/invitations', protect, getMyInvitations);
router.post('/invitations/respond', protect, respondToInvitation);
router.get('/:eventId/team-status', protect, getTeamStatus);

router.route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.post('/register', protect, registerForEvent);
router.get('/:id/registrations', protect, getEventRegistrations);

export default router;

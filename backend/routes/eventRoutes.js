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
  getTeamStatus,
  getMyRegistrations,
  unregisterFromEvent,
  updateTeamName,
  inviteTeamMember,
  removeTeamMember
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.get('/my-registrations', protect, getMyRegistrations);
router.get('/invitations', protect, getMyInvitations);
router.post('/invitations/respond', protect, respondToInvitation);
router.get('/:eventId/team-status', protect, getTeamStatus);
router.delete('/:eventId/unregister', protect, unregisterFromEvent);

// Team Management
router.put('/team/update-name', protect, updateTeamName);
router.post('/team/invite', protect, inviteTeamMember);
router.post('/team/remove-member', protect, removeTeamMember);

router.route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.post('/register', protect, registerForEvent);
router.get('/:id/registrations', protect, getEventRegistrations);

export default router;

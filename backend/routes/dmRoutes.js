import express from 'express';
import { 
    getConversations, 
    getMessages, 
    sendMessage, 
    searchMembersForDM 
} from '../controllers/dmController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/send', sendMessage);
router.get('/search', searchMembersForDM);

export default router;

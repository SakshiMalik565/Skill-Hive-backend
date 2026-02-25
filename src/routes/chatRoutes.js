const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getConversations,
  getMessages,
  createConversation,
  createMessage,
} = require('../controllers/chatController');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', createMessage);

module.exports = router;

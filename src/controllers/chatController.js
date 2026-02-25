const chatService = require('../services/chatService');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.user._id);
    res.status(200).json({ success: true, data: { conversations } });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await chatService.getMessages(req.user._id, conversationId);
    res.status(200).json({ success: true, data: { messages } });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.createConversation(req.user._id, req.body);
    res.status(200).json({ success: true, data: { conversation } });
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const message = await chatService.createMessage(
      req.user._id,
      conversationId,
      req.body
    );
    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  createConversation,
  createMessage,
};

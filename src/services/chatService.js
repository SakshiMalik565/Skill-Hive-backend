const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Swap = require('../models/Swap');
const ApiError = require('../utils/ApiError');
const {
  resolveRecipientId,
  getOrCreateConversation,
} = require('./conversationService');

const hasAcceptedSwap = async (userId, otherUserId) => {
  const swap = await Swap.findOne({
    status: 'accepted',
    $or: [
      { requester: userId, receiver: otherUserId },
      { requester: otherUserId, receiver: userId },
    ],
  }).select('_id');

  return Boolean(swap);
};

const ensureCanMessage = async (userId, otherUserId) => {
  const allowed = await hasAcceptedSwap(userId, otherUserId);
  if (!allowed) {
    throw new ApiError(403, 'Messaging allowed only for accepted swaps');
  }
};

const getConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name email profilePic')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  const otherIds = conversations
    .map((conv) => conv.participants.find((p) => !p._id.equals(userId))?._id)
    .filter(Boolean);

  const swaps = await Swap.find({
    status: 'accepted',
    $or: [
      { requester: userId, receiver: { $in: otherIds } },
      { receiver: userId, requester: { $in: otherIds } },
    ],
  }).select('requester receiver');

  const allowedIds = new Set();
  swaps.forEach((swap) => {
    const otherId = swap.requester.equals(userId) ? swap.receiver : swap.requester;
    allowedIds.add(otherId.toString());
  });

  const enriched = await Promise.all(
    conversations
      .filter((conv) => {
        const other = conv.participants.find((p) => !p._id.equals(userId));
        return other && allowedIds.has(other._id.toString());
      })
      .map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => !p._id.equals(userId)
        );

        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: userId,
          status: { $ne: 'read' },
        });

        return {
          _id: conv._id,
          participant: otherParticipant,
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt,
          unreadCount,
        };
      })
  );

  return enriched;
};

const getMessages = async (userId, conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((id) => id.equals(userId))) {
    throw new ApiError(403, 'Access denied');
  }

  const otherParticipant = conversation.participants.find(
    (id) => !id.equals(userId)
  );
  await ensureCanMessage(userId, otherParticipant);

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name profilePic')
    .populate('receiver', 'name profilePic')
    .sort({ createdAt: 1 });

  return messages;
};

const createConversation = async (userId, payload) => {
  const recipientId = await resolveRecipientId(payload || {});

  if (!recipientId) {
    throw new ApiError(400, 'Recipient not found');
  }
  if (recipientId.toString() === userId.toString()) {
    throw new ApiError(400, 'Cannot message yourself');
  }

  await ensureCanMessage(userId, recipientId);

  const conversation = await getOrCreateConversation(userId, recipientId);
  const populated = await Conversation.findById(conversation._id)
    .populate('participants', 'name email profilePic');
  const otherParticipant = populated.participants.find(
    (p) => !p._id.equals(userId)
  );

  return {
    _id: populated._id,
    participant: otherParticipant,
    lastMessage: populated.lastMessage,
    updatedAt: populated.updatedAt,
    unreadCount: 0,
  };
};

const createMessage = async (userId, conversationId, { text, receiverId }) => {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Message text is required');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((id) => id.equals(userId))) {
    throw new ApiError(403, 'Access denied');
  }

  const otherParticipant = conversation.participants.find(
    (id) => !id.equals(userId)
  );
  await ensureCanMessage(userId, otherParticipant);

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    receiver: receiverId,
    text: text.trim(),
    status: 'sent',
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name profilePic')
    .populate('receiver', 'name profilePic');

  return populatedMessage;
};

module.exports = {
  hasAcceptedSwap,
  ensureCanMessage,
  getConversations,
  getMessages,
  createConversation,
  createMessage,
};

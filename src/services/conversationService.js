const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const resolveRecipientId = async ({ recipientId, recipientEmail }) => {
  if (recipientId) {
    if (mongoose.Types.ObjectId.isValid(recipientId)) {
      return recipientId;
    }

    const userByEmail = await User.findOne({ email: recipientId });
    if (userByEmail?._id) return userByEmail._id;
  }

  if (!recipientEmail) return null;

  const user = await User.findOne({ email: recipientEmail });
  return user?._id || null;
};

const getOrCreateConversation = async (user1, user2) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user1, user2],
    });
  }

  return conversation;
};

module.exports = {
  resolveRecipientId,
  getOrCreateConversation,
};

const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const chatService = require('./services/chatService');
const { getOrCreateConversation } = require('./services/conversationService');

const onlineUsers = new Map();
const lastSeen = new Map();
const activeConversationByUser = new Map();

const addOnlineUser = (userId, socketId) => {
  const sockets = onlineUsers.get(userId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
};

const removeOnlineUser = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
};

const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email');
      if (!user) {
        return next(new Error('Unauthorized'));
      }

      socket.data.user = user;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user._id.toString();

    addOnlineUser(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit('presence:update', { userId, status: 'online' });

    socket.on('presence:query', () => {
      socket.emit('presence:list', { users: Array.from(onlineUsers.keys()) });
    });

    socket.on('conversation:active', ({ conversationId }) => {
      if (conversationId) {
        activeConversationByUser.set(userId, conversationId);
      }
    });

    socket.on('conversation:inactive', ({ conversationId }) => {
      if (activeConversationByUser.get(userId) === conversationId) {
        activeConversationByUser.delete(userId);
      }
    });

    socket.on('typing:start', ({ toUserId, conversationId }) => {
      if (!toUserId || !conversationId) return;
      chatService
        .ensureCanMessage(userId, toUserId)
        .then(() => {
          socket.to(`user:${toUserId}`).emit('typing:start', {
            fromUserId: userId,
            conversationId,
          });
        })
        .catch(() => {});
    });

    socket.on('typing:stop', ({ toUserId, conversationId }) => {
      if (!toUserId || !conversationId) return;
      chatService
        .ensureCanMessage(userId, toUserId)
        .then(() => {
          socket.to(`user:${toUserId}`).emit('typing:stop', {
            fromUserId: userId,
            conversationId,
          });
        })
        .catch(() => {});
    });

    socket.on('messages:read', async ({ conversationId }) => {
      if (!conversationId) return;
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const otherParticipant = conversation.participants.find(
        (id) => id.toString() !== userId
      );

      const updated = await Message.updateMany(
        {
          conversation: conversationId,
          receiver: userId,
          status: { $ne: 'read' },
        },
        { $set: { status: 'read' } }
      );

      if (otherParticipant) {
        io.to(`user:${otherParticipant.toString()}`).emit('message:read', {
          conversationId,
          readerId: userId,
          updatedCount: updated.modifiedCount,
        });
      }
    });

    socket.on('message:send', async (data) => {
      try {
        const { conversationId, toUserId, text } = data || {};
        if (!toUserId || !text || !text.trim()) return;

        await chatService.ensureCanMessage(userId, toUserId);

        let conversation = null;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (
            conversation &&
            !conversation.participants.some(
              (participantId) => participantId.toString() === toUserId
            )
          ) {
            return;
          }
        }

        if (!conversation) {
          conversation = await getOrCreateConversation(userId, toUserId);
        }

        const newMessage = await Message.create({
          conversation: conversation._id,
          sender: userId,
          receiver: toUserId,
          text: text.trim(),
          status: 'sent',
        });

        let status = 'sent';
        if (isUserOnline(toUserId)) {
          status = 'delivered';
        }

        const activeConversation = activeConversationByUser.get(toUserId);
        if (activeConversation && activeConversation === conversation._id.toString()) {
          status = 'read';
        }

        if (status !== 'sent') {
          newMessage.status = status;
          await newMessage.save();
        }

        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name profilePic')
          .populate('receiver', 'name profilePic');

        io.to(`user:${toUserId}`).emit('message:new', populatedMessage);
        socket.emit('message:sent', populatedMessage);

        if (status === 'delivered') {
          socket.emit('message:delivered', { messageId: newMessage._id, conversationId: conversation._id });
        }
        if (status === 'read') {
          socket.emit('message:read', { conversationId: conversation._id, readerId: toUserId, messageId: newMessage._id });
        }
      } catch (error) {
        socket.emit('error', error.message || 'Failed to send message');
      }
    });

    socket.on('message:react', async ({ messageId, emoji }) => {
      try {
        if (!messageId || !emoji) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const conversation = await Conversation.findById(message.conversation);
        if (!conversation || !conversation.participants.some((id) => id.equals(userId))) return;

        const existing = message.reactions.find(
          (reaction) => reaction.user?.toString() === userId
        );

        if (existing) {
          existing.emoji = emoji;
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();

        conversation.participants.forEach((participantId) => {
          io.to(`user:${participantId.toString()}`).emit('message:reaction', {
            messageId: message._id,
            conversationId: message.conversation,
            reactions: message.reactions,
          });
        });
      } catch (error) {
        socket.emit('error', 'Failed to react to message');
      }
    });

    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      if (!isUserOnline(userId)) {
        const timestamp = new Date().toISOString();
        lastSeen.set(userId, timestamp);
        io.emit('presence:update', { userId, status: 'offline', lastSeen: timestamp });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;

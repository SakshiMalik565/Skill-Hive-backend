const Swap = require('../models/Swap');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const createSwap = async (requesterId, swapData) => {
  if (requesterId.toString() === swapData.receiverId.toString()) {
    throw new ApiError(400, 'Cannot create a swap with yourself');
  }

  const receiver = await User.findById(swapData.receiverId);
  if (!receiver) {
    throw new ApiError(404, 'Receiver not found');
  }

  const swap = await Swap.create({
    requester: requesterId,
    receiver: swapData.receiverId,
    skillOffered: swapData.skillOffered,
    skillRequested: swapData.skillRequested,
    scheduledDate: swapData.scheduledDate || null,
  });

  return swap.populate(['requester', 'receiver']);
};

const getSwaps = async (query = {}) => {
  const { page = 1, limit = 10, status } = query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const swaps = await Swap.find(filter)
    .populate('requester', 'name email rating profilePic')
    .populate('receiver', 'name email rating profilePic')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Swap.countDocuments(filter);

  return {
    swaps,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getSwapById = async (swapId) => {
  const swap = await Swap.findById(swapId)
    .populate('requester', 'name email rating profilePic skillsOffered')
    .populate('receiver', 'name email rating profilePic skillsOffered');

  if (!swap) {
    throw new ApiError(404, 'Swap not found');
  }

  return swap;
};

const getUserSwaps = async (userId, query = {}) => {
  const { page = 1, limit = 10, type } = query;
  let filter = {};

  if (type === 'incoming') {
    filter.receiver = userId;
  } else if (type === 'outgoing') {
    filter.requester = userId;
  } else {
    filter.$or = [{ requester: userId }, { receiver: userId }];
  }

  const skip = (page - 1) * limit;
  const swaps = await Swap.find(filter)
    .populate('requester', 'name email rating profilePic')
    .populate('receiver', 'name email rating profilePic')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Swap.countDocuments(filter);

  return {
    swaps,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const updateSwapStatus = async (swapId, userId, status) => {
  const swap = await Swap.findById(swapId);
  if (!swap) {
    throw new ApiError(404, 'Swap not found');
  }

  if (status === 'accepted' || status === 'rejected') {
    if (swap.receiver.toString() !== userId.toString()) {
      throw new ApiError(403, 'Only the receiver can accept or reject a swap');
    }
    if (swap.status !== 'pending') {
      throw new ApiError(400, `Cannot ${status} a swap that is not pending`);
    }
  }

  if (status === 'completed') {
    if (
      swap.requester.toString() !== userId.toString() &&
      swap.receiver.toString() !== userId.toString()
    ) {
      throw new ApiError(403, 'Only participants can complete a swap');
    }
    if (swap.status !== 'accepted') {
      throw new ApiError(400, 'Can only complete an accepted swap');
    }
  }

  swap.status = status;
  await swap.save();

  return swap.populate(['requester', 'receiver']);
};

const addFeedback = async (swapId, userId, { feedback, rating }) => {
  const swap = await Swap.findById(swapId);

  if (!swap) {
    throw new ApiError(404, 'Swap not found');
  }

  if (swap.status !== 'completed') {
    throw new ApiError(400, 'Can only add feedback to completed swaps');
  }

  if (
    swap.requester.toString() !== userId.toString() &&
    swap.receiver.toString() !== userId.toString()
  ) {
    throw new ApiError(403, 'Only participants can add feedback');
  }

  swap.feedback = feedback;
  swap.rating = rating;
  await swap.save();

  if (rating > 0) {
    const targetUserId =
      swap.requester.toString() === userId.toString()
        ? swap.receiver
        : swap.requester;

    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      const newTotal = targetUser.totalRatings + 1;
      const newRating =
        (targetUser.rating * targetUser.totalRatings + rating) / newTotal;
      targetUser.rating = Math.round(newRating * 10) / 10;
      targetUser.totalRatings = newTotal;
      await targetUser.save();
    }
  }

  return swap.populate(['requester', 'receiver']);
};

const deleteSwap = async (swapId, userId) => {
  const swap = await Swap.findById(swapId);

  if (!swap) {
    throw new ApiError(404, 'Swap not found');
  }

  if (swap.requester.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only the requester can delete a swap');
  }

  if (swap.status !== 'pending') {
    throw new ApiError(400, 'Can only delete pending swaps');
  }

  await swap.deleteOne();
  return swap;
};

module.exports = {
  createSwap,
  getSwaps,
  getSwapById,
  getUserSwaps,
  updateSwapStatus,
  addFeedback,
  deleteSwap,
};

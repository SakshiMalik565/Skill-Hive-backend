const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAllUsers = async (query = {}) => {
  const { page = 1, limit = 10, search, skill } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (skill) {
    filter.skillsOffered = { $in: [new RegExp(skill, 'i')] };
  }

  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['name', 'bio', 'skillsOffered', 'skillsWanted', 'profilePic'];
  const filteredUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = { getAllUsers, getUserById, updateUserProfile, deleteUser };

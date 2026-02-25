const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

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
  const allowedFields = [
    'name',
    'bio',
    'skillsOffered',
    'skillsWanted',
    'profilePic',
    'profilePhoto',
    'backgroundPhoto',
  ];
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

const uploadUserImage = async (userId, file, type) => {
  if (!file) {
    throw new ApiError(400, 'Image file is required');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'skillhive';
  const result = await uploadToCloudinary(file.buffer, {
    folder: `${folder}/profiles`,
    resource_type: 'image',
  });

  const updates = {};
  if (type === 'profile') {
    updates.profilePhoto = result.secure_url;
    updates.profilePic = result.secure_url;
  } else if (type === 'background') {
    updates.backgroundPhoto = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
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

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  uploadUserImage,
  deleteUser,
};

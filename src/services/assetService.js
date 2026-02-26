const Asset = require('../models/Asset');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

const getAssets = async (userId, query = {}) => {
  const { page = 1, limit = 10, search, skill } = query;
  const filter = {
    user: { $ne: userId },
  };

  if (skill) {
    filter.skillOffered = { $regex: skill, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { skillOffered: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const assets = await Asset.find(filter)
    .populate('user', 'name profilePic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Asset.countDocuments(filter);

  return {
    assets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

const createAsset = async (userId, data, files = {}) => {
  const photos = [];
  const videos = [];

  if (files.photos && files.photos.length) {
    const uploadedPhotos = await Promise.all(
      files.photos.map((file) =>
        uploadToCloudinary(file.buffer, {
          folder: 'assets/photos',
          resource_type: 'image',
        })
      )
    );
    photos.push(...uploadedPhotos.map((result) => result.secure_url));
  }

  if (files.videos && files.videos.length) {
    const uploadedVideos = await Promise.all(
      files.videos.map((file) =>
        uploadToCloudinary(file.buffer, {
          folder: 'assets/videos',
          resource_type: 'video',
        })
      )
    );
    videos.push(...uploadedVideos.map((result) => result.secure_url));
  }

  const backgroundPhoto = data.backgroundPhoto || photos[0] || '';

  const asset = await Asset.create({
    user: userId,
    skillOffered: data.skillOffered,
    description: data.description,
    backgroundPhoto,
    photos,
    videos,
  });

  return asset.populate('user', 'name profilePic');
};

const getMyAssets = async (userId, query = {}) => {
  const { page = 1, limit = 12 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const assets = await Asset.find({ user: userId })
    .populate('user', 'name profilePic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Asset.countDocuments({ user: userId });

  return {
    assets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

module.exports = {
  getAssets,
  getMyAssets,
  createAsset,
};

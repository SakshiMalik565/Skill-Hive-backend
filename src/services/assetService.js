const Asset = require('../models/Asset');

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

const createAsset = async (userId, data) => {
  const asset = await Asset.create({
    user: userId,
    skillOffered: data.skillOffered,
    description: data.description,
    backgroundPhoto: data.backgroundPhoto || '',
  });

  return asset.populate('user', 'name profilePic');
};

module.exports = {
  getAssets,
  createAsset,
};

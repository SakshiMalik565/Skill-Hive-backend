const assetService = require('../services/assetService');

const getAssets = async (req, res, next) => {
  try {
    const result = await assetService.getAssets(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.user._id, req.body);
    res.status(201).json({ success: true, data: { asset } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssets, createAsset };

const swapService = require('../services/swapService');

const createSwap = async (req, res, next) => {
  try {
    const swap = await swapService.createSwap(req.user._id, req.body);
    res.status(201).json({ success: true, data: { swap } });
  } catch (error) {
    next(error);
  }
};

const getSwaps = async (req, res, next) => {
  try {
    const result = await swapService.getSwaps(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getSwap = async (req, res, next) => {
  try {
    const swap = await swapService.getSwapById(req.params.id);
    res.status(200).json({ success: true, data: { swap } });
  } catch (error) {
    next(error);
  }
};

const getMySwaps = async (req, res, next) => {
  try {
    const result = await swapService.getUserSwaps(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const swap = await swapService.updateSwapStatus(
      req.params.id,
      req.user._id,
      req.body.status
    );
    res.status(200).json({ success: true, data: { swap } });
  } catch (error) {
    next(error);
  }
};

const addFeedback = async (req, res, next) => {
  try {
    const swap = await swapService.addFeedback(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, data: { swap } });
  } catch (error) {
    next(error);
  }
};

const deleteSwap = async (req, res, next) => {
  try {
    await swapService.deleteSwap(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Swap deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSwap,
  getSwaps,
  getSwap,
  getMySwaps,
  updateStatus,
  addFeedback,
  deleteSwap,
};

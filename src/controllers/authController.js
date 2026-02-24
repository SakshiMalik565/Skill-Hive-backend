const authService = require('../services/authService');

const sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtpToEmail(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body.email, req.body.otp);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordSendOtp(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp, register, login, getMe, forgotPassword, resetPassword };

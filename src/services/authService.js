const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const { generateOtp, saveOtp, verifyOtpService, checkOtpValid } = require('../services/otpService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendOtpToEmail = async (email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const otp = generateOtp();
  await saveOtp(email, otp);
  await sendEmail(email, 'Skill Hive - Email Verification', `Your OTP is: ${otp}. It expires in 5 minutes.`);

  return { message: 'OTP sent to email' };
};

const registerUser = async ({ name, email, password, otp }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  await verifyOtpService(email, otp);

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  return { user, token };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const verifyOtp = async (email, otp) => {
  await checkOtpValid(email, otp);
  return { message: 'OTP verified successfully' };
};

const forgotPasswordSendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  const otp = generateOtp();
  await saveOtp(email, otp);
  await sendEmail(email, 'Skill Hive - Password Reset', `Your password reset OTP is: ${otp}. It expires in 5 minutes.`);

  return { message: 'Password reset OTP sent to email' };
};

const resetPassword = async ({ email, otp, newPassword }) => {
  await verifyOtpService(email, otp);

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password reset successfully' };
};

module.exports = { sendOtpToEmail, registerUser, loginUser, getCurrentUser, verifyOtp, forgotPasswordSendOtp, resetPassword };

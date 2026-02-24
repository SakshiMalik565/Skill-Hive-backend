const Otp = require('../models/Otp');
const ApiError = require('../utils/ApiError');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const saveOtp = async (email, otp) => {
  await Otp.deleteMany({ email });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ email, otp, expiresAt });
};

const verifyOtpService = async (email, otp) => {
  const record = await Otp.findOne({ email, otp });

  if (!record) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (record.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  await Otp.deleteMany({ email });
  return true;
};

const checkOtpValid = async (email, otp) => {
  const record = await Otp.findOne({ email, otp });

  if (!record) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (record.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  return true;
};

module.exports = { generateOtp, saveOtp, verifyOtpService, checkOtpValid };

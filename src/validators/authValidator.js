const Joi = require('joi');

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
  otp: Joi.string().length(6).required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'any.required': 'OTP is required',
    }),
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(6)
    .pattern(/(?=.*[A-Z])/)
    .pattern(/(?=.*[0-9])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter and one number',
      'any.required': 'Password is required',
    }),
  otp: Joi.string().length(6).required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'any.required': 'OTP is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required',
    }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required',
    }),
  otp: Joi.string().length(6).required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'any.required': 'OTP is required',
    }),
  newPassword: Joi.string().min(6)
    .pattern(/(?=.*[A-Z])/)
    .pattern(/(?=.*[0-9])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter and one number',
      'any.required': 'Password is required',
    }),
});

module.exports = { sendOtpSchema, verifyOtpSchema, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };

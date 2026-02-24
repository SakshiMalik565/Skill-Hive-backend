const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ObjectId format',
});

const createSwapSchema = Joi.object({
  receiverId: objectId.required().messages({
    'any.required': 'Receiver is required',
  }),
  skillOffered: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Skill offered cannot be empty',
    'any.required': 'Skill offered is required',
  }),
  skillRequested: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Skill requested cannot be empty',
    'any.required': 'Skill requested is required',
  }),
  scheduledDate: Joi.date().iso().allow(null).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected', 'completed').required().messages({
    'any.only': 'Status must be accepted, rejected, or completed',
    'any.required': 'Status is required',
  }),
});

const feedbackSchema = Joi.object({
  feedback: Joi.string().trim().max(1000).required().messages({
    'any.required': 'Feedback is required',
    'string.max': 'Feedback cannot exceed 1000 characters',
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
});

module.exports = { createSwapSchema, updateStatusSchema, feedbackSchema };

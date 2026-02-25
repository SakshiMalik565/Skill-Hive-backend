const Joi = require('joi');

const createAssetSchema = Joi.object({
  skillOffered: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Skill offered cannot be empty',
    'string.max': 'Skill offered cannot exceed 100 characters',
    'any.required': 'Skill offered is required',
  }),
  description: Joi.string().trim().min(1).max(1000).required().messages({
    'string.min': 'Description cannot be empty',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required',
  }),
  backgroundPhoto: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'Background photo must be a valid URL',
  }),
});

module.exports = { createAssetSchema };

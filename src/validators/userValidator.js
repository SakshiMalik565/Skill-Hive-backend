const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  bio: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Bio cannot exceed 500 characters',
  }),
  skillsOffered: Joi.array().items(Joi.string().trim()).max(20),
  skillsWanted: Joi.array().items(Joi.string().trim()).max(20),
  profilePic: Joi.string().uri().allow(''),
  profilePhoto: Joi.string().uri().allow(''),
  backgroundPhoto: Joi.string().uri().allow(''),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

module.exports = { updateProfileSchema };

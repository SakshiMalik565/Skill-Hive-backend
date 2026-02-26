const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ObjectId format',
});

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required().messages({
    'string.min': 'Project name must be at least 2 characters',
    'string.max': 'Project name cannot exceed 120 characters',
    'any.required': 'Project name is required',
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters',
  }),
});

const listProjectsSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(50).optional(),
  search: Joi.string().allow('').optional(),
}).unknown(true);

const projectIdSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createProjectSchema,
  listProjectsSchema,
  projectIdSchema,
};

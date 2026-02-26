const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ObjectId format',
});

const createTaskSchema = Joi.object({
  projectId: objectId.required().messages({
    'any.required': 'Project is required',
  }),
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.min': 'Task title must be at least 2 characters',
    'string.max': 'Task title cannot exceed 200 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().trim().max(1500).allow('').messages({
    'string.max': 'Description cannot exceed 1500 characters',
  }),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  assignee: objectId.allow(null, '').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(1500).allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  assignee: objectId.allow(null, '').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

const projectTasksSchema = Joi.object({
  projectId: objectId.required(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
});

const taskIdSchema = Joi.object({
  id: objectId.required(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  projectTasksSchema,
  taskIdSchema,
};

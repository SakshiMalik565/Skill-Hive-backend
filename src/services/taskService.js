const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');

const assertProjectAccess = async (userId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied');
  }
  return project;
};

const createTask = async (userId, projectId, data) => {
  await assertProjectAccess(userId, projectId);

  const task = await Task.create({
    project: projectId,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    assignee: data.assignee || null,
    createdBy: userId,
    dueDate: data.dueDate || null,
  });

  return task.populate('assignee', 'name email profilePic');
};

const getTasks = async (userId, projectId, query = {}) => {
  await assertProjectAccess(userId, projectId);
  const { status } = query;
  const filter = { project: projectId };

  if (status) {
    filter.status = status;
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email profilePic')
    .sort({ createdAt: -1 });

  return tasks;
};

const getTaskById = async (userId, taskId) => {
  const task = await Task.findById(taskId).populate('assignee', 'name email profilePic');
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await assertProjectAccess(userId, task.project);
  return task;
};

const updateTask = async (userId, taskId, data) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await assertProjectAccess(userId, task.project);

  task.title = data.title ?? task.title;
  task.description = data.description ?? task.description;
  task.status = data.status ?? task.status;
  task.assignee = data.assignee ?? task.assignee;
  task.dueDate = data.dueDate ?? task.dueDate;

  await task.save();
  return task.populate('assignee', 'name email profilePic');
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
};

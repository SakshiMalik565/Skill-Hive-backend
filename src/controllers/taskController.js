const taskService = require('../services/taskService');

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(
      req.user._id,
      req.params.projectId,
      req.body
    );
    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(
      req.user._id,
      req.params.projectId,
      req.query
    );
    res.status(200).json({ success: true, data: { tasks } });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user._id, req.params.id);
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.user._id,
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
};

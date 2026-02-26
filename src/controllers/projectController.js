const projectService = require('../services/projectService');

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user._id, req.body);
    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(
      req.user._id,
      req.params.id
    );
    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
};

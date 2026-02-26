const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');

const createProject = async (userId, data) => {
  const project = await Project.create({
    name: data.name,
    description: data.description || '',
    owner: userId,
  });

  return project.populate('owner', 'name email profilePic');
};

const getProjects = async (userId, query = {}) => {
  const { page = 1, limit = 10, search } = query;
  const filter = { owner: userId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const projects = await Project.find(filter)
    .populate('owner', 'name email profilePic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Project.countDocuments(filter);

  return {
    projects,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

const getProjectById = async (userId, projectId) => {
  const project = await Project.findById(projectId).populate(
    'owner',
    'name email profilePic'
  );

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.owner._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  return project;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
};

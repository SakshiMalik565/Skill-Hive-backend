const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProjectSchema, listProjectsSchema, projectIdSchema } = require('../validators/projectValidator');
const { createProject, getProjects, getProject } = require('../controllers/projectController');

const router = express.Router();

router.use(protect);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', validate(listProjectsSchema), getProjects);
router.get('/:id', validate(projectIdSchema), getProject);

module.exports = router;

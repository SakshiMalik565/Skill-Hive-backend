const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  projectTasksSchema,
  taskIdSchema,
} = require('../validators/taskValidator');
const { createTask, getTasks, getTask, updateTask } = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.post('/project/:projectId', validate(createTaskSchema), createTask);
router.get('/project/:projectId', validate(projectTasksSchema), getTasks);
router.get('/:id', validate(taskIdSchema), getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);

module.exports = router;

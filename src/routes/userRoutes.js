const express = require('express');
const { getUsers, getUser, updateProfile, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/userValidator');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUser);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

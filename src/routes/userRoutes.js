const express = require('express');
const { getUsers, getUser, updateProfile, uploadProfilePhoto, uploadBackgroundPhoto, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/userValidator');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUser);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/profile-photo', protect, upload.single('image'), uploadProfilePhoto);
router.post('/background-photo', protect, upload.single('image'), uploadBackgroundPhoto);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

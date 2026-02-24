const userService = require('../services/userService');

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateProfile, deleteUser };

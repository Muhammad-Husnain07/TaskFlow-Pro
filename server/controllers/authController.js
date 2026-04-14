const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'Email already exists', 400);
  }

  const user = await User.create({ name, email, password });
  const token = user.generateAuthToken();

  return ApiResponse.created(res, { token, user: user.fullProfile }, 'Registration successful');
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return ApiResponse.unauthorized(res, 'Invalid credentials');
  }

  const token = user.generateAuthToken();
  return ApiResponse.success(res, { token, user: user.fullProfile }, 'Login successful');
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return ApiResponse.success(res, user.fullProfile, 'User retrieved successfully');
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, bio },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(res, user.fullProfile, 'Profile updated successfully');
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  );

  return ApiResponse.success(res, { avatar: avatarUrl }, 'Avatar uploaded successfully');
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return ApiResponse.unauthorized(res, 'User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password updated successfully');
});

const updateNotificationPreferences = asyncHandler(async (req, res, next) => {
  const { email, inApp } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      notificationPreferences: { email, inApp } 
    },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(res, user.notificationPreferences, 'Preferences updated successfully');
});

const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  await user.deleteOne();

  return ApiResponse.success(res, null, 'Account deleted successfully');
});

module.exports = { register, login, getMe, updateProfile, uploadAvatar, changePassword, updateNotificationPreferences, deleteAccount };

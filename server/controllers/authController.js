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
  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(res, user.fullProfile, 'Profile updated successfully');
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return ApiResponse.unauthorized(res, 'User not found');
  }

  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password updated successfully');
});

module.exports = { register, login, getMe, updateProfile, changePassword };

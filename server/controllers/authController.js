const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const user = await User.create({ name, email, password });
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    token,
    user: user.fullProfile
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = user.generateAuthToken();

  res.json({
    success: true,
    token,
    user: user.fullProfile
  });
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    user: user.fullProfile
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user: user.fullProfile
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, getMe, updateProfile, changePassword };

/* 
Test curl commands:

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Me (after login, use token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update Profile
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"John Updated","avatar":"https://example.com/avatar.jpg"}'

# Change Password
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"oldPassword":"password123","newPassword":"newpass123"}'
*/

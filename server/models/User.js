const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  notificationPreferences: {
    email: {
      taskAssigned: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      taskDue: { type: Boolean, default: true },
    },
    inApp: {
      taskAssigned: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      taskDue: { type: Boolean, default: true },
      memberInvited: { type: Boolean, default: true },
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    role: this.role,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    config.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);
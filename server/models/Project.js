const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#7c6af7'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  tags: [{
    type: String
  }],
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

projectSchema.methods.isMember = function(userId) {
  const ownerId = this.owner?._id || this.owner;
  if (ownerId && ownerId.toString() === userId.toString()) return true;
  return this.members.some(member => {
    const memberId = member.user?._id || member.user;
    return memberId && memberId.toString() === userId.toString();
  });
};

projectSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    (member.role === 'owner' || member.role === 'admin')
  );
};

projectSchema.methods.addMember = async function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({ user: userId, role });
    await this.save();
  }
  return this;
};

projectSchema.pre('save', function(next) {
  if (this.isNew && this.owner) {
    const isOwnerInMembers = this.members.some(
      m => m.user.toString() === this.owner.toString()
    );
    if (!isOwnerInMembers) {
      this.members.push({ user: this.owner, role: 'owner' });
    }
  }
  next();
});

projectSchema.index({ name: 'text', description: 'text', tags: 'text' });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
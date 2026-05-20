import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member',
      },
    },
  ],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  color: {
    type: String,
    default: '#4F46E5',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
projectSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;

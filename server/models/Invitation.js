import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate pending invitations
invitationSchema.index(
  { project: 1, recipient: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;

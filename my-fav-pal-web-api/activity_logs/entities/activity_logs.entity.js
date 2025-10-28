import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'USER_CREATED', 'USER_UPDATED',
      'LIST_CREATED', 'LIST_UPDATED', 'LIST_DELETED',
      'MEDIA_CREATED', 'MEDIA_UPDATED',
      'REVIEW_CREATED', 'REVIEW_UPDATED', 'REVIEW_DELETED'
    ]
  },
  payload: {
    type: Object
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

ActivityLogSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
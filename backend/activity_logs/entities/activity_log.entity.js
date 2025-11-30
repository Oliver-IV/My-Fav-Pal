import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, 
  payload: { type: Object }, 
  createdAt: { type: Date, default: Date.now, expires: '1y' }, 
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
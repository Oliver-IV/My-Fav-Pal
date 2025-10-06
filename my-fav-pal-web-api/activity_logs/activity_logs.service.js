import ActivityLog from './activity_logs.entity.js';

export default class ActivityLogService {
  constructor() {}

  async createLog(logData) {
    const log = new ActivityLog(logData);
    return await log.save();
  }

  async getLogsByUserId(userId, limit = 100) {
    return await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
import ActivityLog from './entities/activity_logs.entity.js';

class ActivityLogDAO {
    async create(logData) {
        const log = new ActivityLog(logData);
        return await log.save();
    }

    async findByUser(userId, limit = 50) {
        return await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'displayName'); 
    }
}

export default new ActivityLogDAO();
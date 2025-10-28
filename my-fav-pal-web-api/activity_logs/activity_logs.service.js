import activityLogDAO from './activity_logs.dao.js';

export default class ActivityLogService {

  async createLog(logData) {

    return activityLogDAO.create(logData);
  }

  async getLogsByUserId(userId) {
    if (!userId) {
      const error = new Error('Se requiere un ID de usuario.');
      error.status = 400;
      throw error;
    }
    return activityLogDAO.findByUser(userId);
  }
}
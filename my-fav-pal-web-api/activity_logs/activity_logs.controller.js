import ActivityLogService from './activity_logs.service.js';
import CreateActivityLogDTO from './dtos/activity_logs.dto.js';

const activityLogService = new ActivityLogService();


export const createLog = async (req, res) => {
    try {
        const createLogDTO = new CreateActivityLogDTO(req.body);
        const newLog = await activityLogService.createLog(createLogDTO);
        res.status(201).json(newLog);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

export const getLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await activityLogService.getLogsByUserId(userId);
        res.status(200).json(logs);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
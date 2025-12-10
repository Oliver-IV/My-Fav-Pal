export default class CreateActivityLogDTO {
    constructor({ userId, actionType, payload }) {
        if (!userId || !actionType) {
            throw new Error('Los campos userId y actionType son obligatorios.');
        }

        this.userId = userId;
        this.actionType = actionType;
        this.payload = payload || {};
    }
}
export default class UpdateUserDTO {
    constructor({ displayName, avatarUrl }) {
        if (displayName !== undefined) this.displayName = displayName;
        if (avatarUrl !== undefined) this.avatarUrl = avatarUrl;
    }
}
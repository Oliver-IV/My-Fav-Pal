export default class CreateUserDTO {
    constructor({ email, password, displayName }) {
        if (!email || !password || !displayName) {
            throw new Error('Email, password, y displayName son campos requeridos.');
        }

        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }
}
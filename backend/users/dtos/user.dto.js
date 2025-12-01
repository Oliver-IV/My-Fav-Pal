// DTO para registro de usuario
export class RegisterUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.displayName = data.displayName;
    this.avatarUrl = data.avatarUrl || null;
  }

  validate() {
    const errors = [];

    if (!this.email || !this.email.includes('@')) {
      errors.push('Email válido es requerido');
    }

    if (!this.password || this.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!this.displayName || this.displayName.trim().length === 0) {
      errors.push('Nombre de usuario es requerido');
    }

    return errors;
  }
}

// DTO para login
export class LoginUserDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email es requerido');
    }

    if (!this.password) {
      errors.push('Contraseña es requerida');
    }

    return errors;
  }
}

export class UpdateUserDTO {
  constructor(data) {
    if (data.displayName !== undefined) this.displayName = data.displayName;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.email !== undefined) this.email = data.email;
  }

  validate() {
    const errors = [];

    if (this.email !== undefined && !this.email.includes('@')) {
      errors.push('Email válido es requerido');
    }

    if (this.displayName !== undefined && this.displayName.trim().length === 0) {
      errors.push('Nombre de usuario no puede estar vacío');
    }

    return errors;
  }
}

export class ChangePasswordDTO {
  constructor(data) {
    this.oldPassword = data.oldPassword;
    this.newPassword = data.newPassword;
  }

  validate() {
    const errors = [];

    if (!this.oldPassword) {
      errors.push('Contraseña actual es requerida');
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      errors.push('La nueva contraseña debe tener al menos 6 caracteres');
    }

    return errors;
  }
}

// DTO para respuesta de usuario (sin contraseña)
export class UserResponseDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.email = user.email;
    this.displayName = user.displayName;
    this.avatarUrl = user.avatarUrl;
    this.watchlist = user.watchlist;
    this.waitlist = user.waitlist;
    this.lists = user.lists;
    this.createdAt = user.createdAt;
  }
}

// DTO para item de watchlist
export class WatchlistItemDTO {
  constructor(data) {
    this.mediaName = data.mediaName;
    this.type = data.type;
    this.platform = data.platform;
    this.progress = data.progress;
    this.lastUrl = data.lastUrl;
    this.link = data.link;
    this.status = data.status;
    this.rating = data.rating;
    this.reviewId = data.reviewId;
  }

  validate() {
    const errors = [];

    if (!this.mediaName) {
      errors.push('mediaName es requerido');
    }

    if (!this.type) {
      errors.push('type es requerido');
    }

    if (!this.status) {
      errors.push('status es requerido');
    }

    const validStatuses = ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push(`status debe ser uno de: ${validStatuses.join(', ')}`);
    }

    return errors;
  }
}

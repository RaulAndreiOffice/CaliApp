export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  username?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

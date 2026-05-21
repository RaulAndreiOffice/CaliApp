export interface UpdateUserDTO {
  username?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

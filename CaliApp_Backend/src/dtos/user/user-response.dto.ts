import type { User } from "../../models/user.model";

export interface UserResponseDTO
  extends Pick<User, "id" | "email" | "username" | "createdAt" | "updatedAt"> {}

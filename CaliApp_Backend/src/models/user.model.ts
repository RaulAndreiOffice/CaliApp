export interface User {
  id: string;
  username: string | null;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

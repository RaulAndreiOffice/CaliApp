import type { User } from './user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

// The refresh token is kept in an httpOnly cookie managed by the server and is
// never exposed to JavaScript, so it does not appear in any client-side type.
export interface AuthTokens {
  accessToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

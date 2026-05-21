export interface TokensResponseDTO {
  accessToken: string;
  refreshToken: string;
}

import type { UserResponseDTO } from "../user/user-response.dto";

export interface AuthResponseDTO extends TokensResponseDTO {
  user: UserResponseDTO;
}

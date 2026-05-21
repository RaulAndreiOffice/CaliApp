import { SharePermission } from "../../models/share.model";

export interface CreateShareDTO {
  email: string;
  permission: SharePermission;
}

import type { PerformedSet } from "../../models/performedSet.model";

export interface PerformedSetResponseDTO
  extends Pick<PerformedSet, "id" | "setNumber" | "actualValue" | "notes" | "createdAt"> {}

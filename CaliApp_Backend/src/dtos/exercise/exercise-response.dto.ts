import { MeasurementType } from "../../models/exercise.model";

export interface ExerciseResponseDTO {
  id: string;
  ownerUserId: string | null;
  name: string;
  measurementType: MeasurementType;
  category: string | null;
  description: string | null;
  defaultSets: number | null;
  defaultTargetValue: number | null;
  defaultRestSeconds: number | null;
  isGlobal: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

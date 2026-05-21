import { MeasurementType } from "../../models/exercise.model";

export interface CreateExerciseDTO {
  name: string;
  measurementType: MeasurementType;
  category?: string;
  description?: string;
  defaultSets?: number;
  defaultTargetValue?: number;
  defaultRestSeconds?: number;
}

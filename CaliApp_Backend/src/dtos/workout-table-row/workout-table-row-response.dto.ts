import { MeasurementType } from "../../models/exercise.model";
import type { WorkoutTableRow } from "../../models/workoutTableRow.model";
import type { ExerciseResponseDTO } from "../exercise/exercise-response.dto";

export interface WorkoutTableRowResponseDTO extends WorkoutTableRow {
  exercise?: ExerciseResponseDTO;
  exerciseName?: string;
  measurementType?: MeasurementType;
}

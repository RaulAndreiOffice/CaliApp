import type { WorkoutTable } from "../../models/workoutTable.model";
import type { WorkoutTableRowResponseDTO } from "../workout-table-row/workout-table-row-response.dto";

export interface WorkoutTableResponseDTO extends WorkoutTable {
  rowCount?: number;
  rows?: WorkoutTableRowResponseDTO[];
}

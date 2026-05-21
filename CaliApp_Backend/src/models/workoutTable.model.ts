export interface WorkoutTable {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

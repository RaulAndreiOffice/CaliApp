import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Dialog } from '../../../components/ui/Dialog';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { WorkoutTableForm } from '../../../components/workout-tables/WorkoutTableForm/WorkoutTableForm';
import { WorkoutTableRowForm } from '../../../components/workout-tables/WorkoutTableRowForm/WorkoutTableRowForm';
import { WorkoutTableRowList } from '../../../components/workout-tables/WorkoutTableRowList/WorkoutTableRowList';
import { useWorkoutTable, useUpdateWorkoutTable } from '../../../hooks/api/useWorkoutTables';
import { useCreateRow, useDeleteRow } from '../../../hooks/api/useWorkoutTableRows';

export function WorkoutTableEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: table, isLoading } = useWorkoutTable(id);
  const updateMutation = useUpdateWorkoutTable(id ?? '');
  const createRow = useCreateRow(id ?? '');
  const deleteRow = useDeleteRow(id ?? '');
  const [rowDialogOpen, setRowDialogOpen] = useState(false);

  if (isLoading || !table) return <LoadingSpinner label="Se incarca..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Editeaza: {table.name}</h1>

      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Detalii</h3>
          <WorkoutTableForm
            defaultValues={{
              name: table.name,
              description: table.description ?? undefined,
            }}
            onSubmit={(d) =>
              updateMutation.mutate(d, {
                onSuccess: () => toast.success('Salvat'),
                onError: () => toast.error('Eroare la salvare'),
              })
            }
            loading={updateMutation.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Exercitii in plan</h3>
            <Button
              icon={<Plus size={16} />}
              size="sm"
              onClick={() => setRowDialogOpen(true)}
            >
              Adauga
            </Button>
          </div>
          <WorkoutTableRowList
            rows={table.rows ?? []}
            onDelete={(rowId) =>
              deleteRow.mutate(rowId, {
                onSuccess: () => toast.success('Rand sters'),
                onError: () => toast.error('Eroare'),
              })
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate(`/workout-tables/${id}`)}
        >
          Inchide
        </Button>
      </div>

      <Dialog
        open={rowDialogOpen}
        title="Adauga exercitiu in plan"
        onClose={() => setRowDialogOpen(false)}
      >
        <WorkoutTableRowForm
          onSubmit={(d) =>
            createRow.mutate(d, {
              onSuccess: () => {
                toast.success('Adaugat');
                setRowDialogOpen(false);
              },
              onError: () => toast.error('Eroare'),
            })
          }
          onCancel={() => setRowDialogOpen(false)}
          loading={createRow.isPending}
        />
      </Dialog>
    </div>
  );
}

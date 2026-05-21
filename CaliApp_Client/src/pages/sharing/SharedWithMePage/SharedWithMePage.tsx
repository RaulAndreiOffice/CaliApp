import { useState } from 'react';
import toast from 'react-hot-toast';
import { Share2, Copy, Users } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { useCopyShared, useSharedWithMe } from '../../../hooks/api/useSharing';
import { useWorkoutTables } from '../../../hooks/api/useWorkoutTables';

export function SharedWithMePage() {
  const { data: sharedItems, isLoading: sharedLoading } = useSharedWithMe();
  const { data: myPlans, isLoading: plansLoading } = useWorkoutTables();
  const copyMutation = useCopyShared();

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [permission, setPermission] = useState('view');
  const [email, setEmail] = useState('');

  const isLoading = sharedLoading || plansLoading;

  if (isLoading) return <LoadingSpinner label="Se incarca..." />;

  const selectClasses =
    'w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Sharing</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Share your workout plans with others
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Shared Plans */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-primary" />
                <h3 className="font-medium text-lg">My Shared Plans</h3>
              </div>

              {myPlans && myPlans.length > 0 ? (
                <div className="space-y-3">
                  {myPlans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="info">View</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{plan.rows?.length ?? 0} exercises</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No plans shared yet.
                </p>
              )}

              <Button className="w-full">
                <Share2 className="w-4 h-4" />
                Share a Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shared With Me */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Copy className="w-6 h-6 text-[#3b82f6]" />
                <h3 className="font-medium text-lg">Shared With Me</h3>
              </div>

              {sharedItems && sharedItems.length > 0 ? (
                <div className="space-y-3">
                  {sharedItems.map((share) => (
                    <div
                      key={share.id}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {share.workoutTable?.name ?? 'Plan'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Shared by{' '}
                            {share.sharedByUser?.username ?? 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            share.permission === 'copy' ? 'success' : 'info'
                          }
                        >
                          {share.permission === 'copy' ? 'Copy' : 'View'}
                        </Badge>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-2"
                        loading={copyMutation.isPending}
                        onClick={() =>
                          copyMutation.mutate(share.id, {
                            onSuccess: () =>
                              toast.success('Plan copiat in contul tau'),
                            onError: () => toast.error('Copierea a esuat'),
                          })
                        }
                      >
                        Copy to My Plans
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No shared plans"
                  description="Plans shared with you will appear here."
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share form */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Share a Workout Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Select Plan
                </label>
                <select
                  className={selectClasses}
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">Choose a plan...</option>
                  {(myPlans ?? []).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Permission Level
                </label>
                <select
                  className={selectClasses}
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <option value="view">View Only</option>
                  <option value="copy">Copy Allowed</option>
                </select>
              </div>
            </div>
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!selectedPlanId || !email) {
                  toast.error('Select a plan and enter an email');
                  return;
                }
                toast.success('Invitation sent (not implemented yet)');
                setEmail('');
              }}
            >
              Send Invitation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

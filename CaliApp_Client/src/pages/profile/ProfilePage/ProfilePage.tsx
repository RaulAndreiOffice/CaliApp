import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Lock, LogOut } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../stores/auth.store';
import { userApi } from '../../../api/user.api';
import type { ChangePasswordRequest, UpdateUserRequest } from '../../../types/user.types';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  const profileForm = useForm<UpdateUserRequest>({
    defaultValues: { username: user?.username ?? '' },
  });
  const passwordForm = useForm<ChangePasswordRequest>();

  // Training prefs (local state — not yet persisted to API)
  const [fitnessLevel, setFitnessLevel] = useState('Intermediate');
  const [trainingDays, setTrainingDays] = useState('4 days');
  const [maxDuration, setMaxDuration] = useState(60);
  const [injuryNotes, setInjuryNotes] = useState('');

  // App prefs toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  async function saveProfile(data: UpdateUserRequest) {
    try {
      const updated = await userApi.updateMe(data);
      updateUser(updated);
      toast.success('Profil actualizat');
    } catch {
      toast.error('Actualizarea profilului a esuat');
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    try {
      await userApi.changePassword(data);
      passwordForm.reset();
      toast.success('Parola schimbata');
    } catch {
      toast.error('Schimbarea parolei a esuat');
    }
  }

  const selectClasses =
    'w-full px-3 py-2.5 bg-input-background/80 border border-input/60 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 focus:shadow-[0_0_16px_rgba(132,255,0,0.1)] transition-all duration-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(saveProfile)}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Profile Information</h3>
              </div>

              <Input label="Email" value={user?.email ?? ''} disabled />
              <Input
                label="Username"
                {...profileForm.register('username')}
              />
              <Button type="submit" className="w-full">
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(changePassword)}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Security</h3>
              </div>

              <Input
                label="Current Password"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="New Password"
                type="password"
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
              />
              <Button type="submit" className="w-full">
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Training Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Training Preferences</h3>

              <div>
                <label className="text-sm mb-2 block">Fitness Level</label>
                <select
                  className={selectClasses}
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-sm mb-2 block">
                  Training Days per Week
                </label>
                <select
                  className={selectClasses}
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(e.target.value)}
                >
                  <option>3 days</option>
                  <option>4 days</option>
                  <option>5 days</option>
                  <option>6 days</option>
                </select>
              </div>

              <div>
                <label className="text-sm mb-2 block">
                  Max Session Duration (minutes)
                </label>
                <input
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className={selectClasses}
                />
              </div>

              <Input
                label="Injury Notes (optional)"
                placeholder="Any injuries or limitations..."
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={() => toast.success('Preferences saved')}
              >
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">App Preferences</h3>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive workout reminders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">AI Recommendations</p>
                  <p className="text-sm text-muted-foreground">
                    Enable personalized suggestions
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiRecommendations}
                  onChange={(e) => setAiRecommendations(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Get weekly progress emails
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={(e) => setWeeklySummary(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium text-lg text-destructive">
              Danger Zone
            </h3>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                logout();
                toast.success('Logged out');
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

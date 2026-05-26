import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Lock, LogOut } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../stores/auth.store';
import { userApi } from '../../../api/user.api';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getServerErrorMessage } from '../../../utils/errors';
import type { ChangePasswordRequest, UpdateUserRequest } from '../../../types/user.types';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage, t } = useLanguage();

  const profileForm = useForm<UpdateUserRequest>({
    defaultValues: { username: user?.username ?? '' },
  });
  const passwordForm = useForm<ChangePasswordRequest>();

  // Training prefs (local state — not yet persisted to API)
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [trainingDays, setTrainingDays] = useState('4');
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
      toast.success(t('profile.toast.profileUpdated'));
    } catch (err) {
      toast.error(getServerErrorMessage(err, t('profile.toast.profileUpdateFailed')));
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    try {
      await userApi.changePassword(data);
      passwordForm.reset();
      toast.success(t('profile.toast.passwordChanged'));
    } catch (err) {
      toast.error(getServerErrorMessage(err, t('profile.toast.passwordChangeFailed')));
    }
  }

  const selectClasses =
    'w-full px-3 py-2.5 bg-input-background/80 border border-input/60 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 focus:shadow-[0_0_16px_rgba(132,255,0,0.1)] transition-all duration-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('profile.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t('profile.subtitle')}
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
                <h3 className="font-semibold text-lg">{t('profile.section.info')}</h3>
              </div>

              <Input label={t('profile.field.email')} value={user?.email ?? ''} disabled />
              <Input
                label={t('profile.field.username')}
                {...profileForm.register('username')}
              />
              <Button type="submit" className="w-full">
                {t('profile.action.updateProfile')}
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
                <h3 className="font-semibold text-lg">{t('profile.section.security')}</h3>
              </div>

              <Input
                label={t('profile.field.currentPassword')}
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label={t('profile.field.newPassword')}
                type="password"
                {...passwordForm.register('newPassword')}
              />
              <Input
                label={t('profile.field.confirmNewPassword')}
                type="password"
                placeholder={t('profile.field.confirmNewPasswordPlaceholder')}
              />
              <Button type="submit" className="w-full">
                {t('profile.action.changePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Training Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{t('profile.section.training')}</h3>

              <div>
                <label htmlFor="pref-fitness-level" className="text-sm mb-2 block">{t('profile.field.fitnessLevel')}</label>
                <select
                  id="pref-fitness-level"
                  className={selectClasses}
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                >
                  <option value="beginner">{t('profile.field.fitnessLevel.beginner')}</option>
                  <option value="intermediate">{t('profile.field.fitnessLevel.intermediate')}</option>
                  <option value="advanced">{t('profile.field.fitnessLevel.advanced')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="pref-training-days" className="text-sm mb-2 block">
                  {t('profile.field.trainingDays')}
                </label>
                <select
                  id="pref-training-days"
                  className={selectClasses}
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(e.target.value)}
                >
                  {[3, 4, 5, 6].map((n) => (
                    <option key={n} value={String(n)}>
                      {t('profile.field.trainingDays.option', { count: n })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pref-max-duration" className="text-sm mb-2 block">
                  {t('profile.field.maxDuration')}
                </label>
                <input
                  id="pref-max-duration"
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className={selectClasses}
                />
              </div>

              <Input
                label={t('profile.field.injuryNotes')}
                placeholder={t('profile.field.injuryNotes.placeholder')}
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={() => toast.success(t('profile.toast.preferencesSaved'))}
              >
                {t('profile.action.savePreferences')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{t('profile.section.app')}</h3>

              {/* Language */}
              <div>
                <label htmlFor="pref-language" className="text-sm mb-2 block">{t('profile.field.language')}</label>
                <select
                  id="pref-language"
                  className={selectClasses}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ro' | 'en')}
                >
                  <option value="ro">{t('profile.field.language.ro')}</option>
                  <option value="en">{t('profile.field.language.en')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">{t('profile.toggle.emailNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.toggle.emailNotifications.desc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                  aria-label={t('profile.toggle.emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">{t('profile.toggle.aiRecommendations')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.toggle.aiRecommendations.desc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiRecommendations}
                  onChange={(e) => setAiRecommendations(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                  aria-label={t('profile.toggle.aiRecommendations')}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">{t('profile.toggle.weeklySummary')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.toggle.weeklySummary.desc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={(e) => setWeeklySummary(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                  aria-label={t('profile.toggle.weeklySummary')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="pt-4 flex justify-end">
        <Button
          variant="secondary"
          className="w-full sm:w-auto text-muted-foreground hover:text-foreground border-border hover:bg-muted/50 transition-colors"
          onClick={() => {
            logout();
            toast.success(t('auth.logoutSuccess'));
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('auth.logout')}
        </Button>
      </div>
    </div>
  );
}

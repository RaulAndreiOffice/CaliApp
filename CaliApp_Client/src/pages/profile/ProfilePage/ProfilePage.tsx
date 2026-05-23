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
import type { ChangePasswordRequest, UpdateUserRequest } from '../../../types/user.types';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage } = useLanguage();

  const profileForm = useForm<UpdateUserRequest>({
    defaultValues: { username: user?.username ?? '' },
  });
  const passwordForm = useForm<ChangePasswordRequest>();

  // Training prefs (local state — not yet persisted to API)
  const [fitnessLevel, setFitnessLevel] = useState('Intermediar');
  const [trainingDays, setTrainingDays] = useState('4 zile');
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
      toast.success('Profilul a fost actualizat');
    } catch {
      toast.error('Actualizarea profilului a eșuat');
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    try {
      await userApi.changePassword(data);
      passwordForm.reset();
      toast.success('Parola a fost schimbată');
    } catch {
      toast.error('Schimbarea parolei a eșuat');
    }
  }

  const selectClasses =
    'w-full px-3 py-2.5 bg-input-background/80 border border-input/60 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 focus:shadow-[0_0_16px_rgba(132,255,0,0.1)] transition-all duration-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Setări</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Gestionează-ți contul și preferințele
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
                <h3 className="font-semibold text-lg">Informații Profil</h3>
              </div>

              <Input label="Email" value={user?.email ?? ''} disabled />
              <Input
                label="Nume utilizator"
                {...profileForm.register('username')}
              />
              <Button type="submit" className="w-full">
                Actualizează Profilul
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
                <h3 className="font-semibold text-lg">Securitate</h3>
              </div>

              <Input
                label="Parola curentă"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="Parola nouă"
                type="password"
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Confirmă parola nouă"
                type="password"
                placeholder="Repetă parola nouă"
              />
              <Button type="submit" className="w-full">
                Schimbă Parola
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Training Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Preferințe Antrenament</h3>

              <div>
                <label htmlFor="pref-fitness-level" className="text-sm mb-2 block">Nivel Fitness</label>
                <select
                  id="pref-fitness-level"
                  className={selectClasses}
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value)}
                >
                  <option>Începător</option>
                  <option>Intermediar</option>
                  <option>Avansat</option>
                </select>
              </div>

              <div>
                <label htmlFor="pref-training-days" className="text-sm mb-2 block">
                  Zile de Antrenament pe Săptămână
                </label>
                <select
                  id="pref-training-days"
                  className={selectClasses}
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(e.target.value)}
                >
                  <option>3 zile</option>
                  <option>4 zile</option>
                  <option>5 zile</option>
                  <option>6 zile</option>
                </select>
              </div>

              <div>
                <label htmlFor="pref-max-duration" className="text-sm mb-2 block">
                  Durata Maximă Sesiune (minute)
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
                label="Note Accidentări (opțional)"
                placeholder="Accidentări sau limitări..."
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={() => toast.success('Preferințele au fost salvate')}
              >
                Salvează Preferințele
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Preferințe Aplicație</h3>

              {/* Setare Limba */}
              <div>
                <label htmlFor="pref-language" className="text-sm mb-2 block">Limba Interfeței</label>
                <select
                  id="pref-language"
                  className={selectClasses}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ro' | 'en')}
                >
                  <option value="ro">Română</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/15 rounded-xl border border-border/20 hover:bg-muted/25 transition-all duration-200">
                <div>
                  <p className="font-medium">Notificări prin Email</p>
                  <p className="text-sm text-muted-foreground">
                    Primește mementouri pentru antrenament
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
                  <p className="font-medium">Recomandări AI</p>
                  <p className="text-sm text-muted-foreground">
                    Activează sugestii personalizate
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
                  <p className="font-medium">Rezumat Săptămânal</p>
                  <p className="text-sm text-muted-foreground">
                    Primește progresul săptămânal pe email
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

      {/* Logout Area - Scoaterea din Danger Zone */}
      <div className="pt-4 flex justify-end">
        <Button
          variant="secondary"
          className="w-full sm:w-auto text-muted-foreground hover:text-foreground border-border hover:bg-muted/50 transition-colors"
          onClick={() => {
            logout();
            toast.success('Te-ai deconectat cu succes');
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Deconectare
        </Button>
      </div>
    </div>
  );
}

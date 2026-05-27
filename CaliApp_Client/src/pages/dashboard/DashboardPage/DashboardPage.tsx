import toast from 'react-hot-toast';
import {
  Activity, Zap, Target, TrendingUp, GripVertical,
  X, Plus, LayoutDashboard, Check, Clock, Moon,
  LineChart as LineChartIcon, BarChart3, PieChart as PieChartIcon, AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../stores/auth.store';
import { useOverview, useProgressInsights } from '../../../hooks/api/useStats';
import { useLogRestDay } from '../../../hooks/api/useWorkoutSessions';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { WeeklyProgressChart } from '../../../components/dashboard/WeeklyProgressChart/WeeklyProgressChart';
import { ExerciseTrendList } from '../../../components/dashboard/ExerciseTrendList/ExerciseTrendList';
import { WorkoutPercentages } from '../../../components/dashboard/WorkoutPercentages/WorkoutPercentages';
import { SmartWarnings } from '../../../components/dashboard/SmartWarnings/SmartWarnings';
import { useWidgetReorder } from '../../../hooks/useWidgetReorder';
import { useEditableWidgets } from '../../../hooks/useEditableWidgets';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getServerErrorMessage } from '../../../utils/errors';
import type { TranslationKey } from '../../../i18n/translations';
import type { ProgressInsights } from '../../../types/stats.types';

// ─── widget catalog ──────────────────────────────────────────────────────────

type WidgetSize = 'sm' | 'lg';

interface WidgetMeta {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  size: WidgetSize;
  icon: React.ElementType;
}

// Dashboard intentionally drops the daily-bar and weekly-rate charts that
// used to live here — they are now centralised in Plans & Progress. The
// dashboard's job is to summarise *progress*: per-exercise evolution,
// weekly trend, activity distribution, and smart warnings.
const CATALOG: Record<string, WidgetMeta> = {
  'stat-sessions':       { titleKey: 'dashboard.widget.sessions.title',       descKey: 'dashboard.widget.sessions.desc',       size: 'sm', icon: Activity },
  'stat-streak':         { titleKey: 'dashboard.widget.streak.title',         descKey: 'dashboard.widget.streak.desc',         size: 'sm', icon: Zap },
  'stat-exercises':      { titleKey: 'dashboard.widget.exercises.title',      descKey: 'dashboard.widget.exercises.desc',      size: 'sm', icon: Target },
  'stat-consistency':    { titleKey: 'dashboard.widget.consistency.title',    descKey: 'dashboard.widget.consistency.desc',    size: 'sm', icon: TrendingUp },
  'progress-weekly':     { titleKey: 'dashboard.progress.weekly.title',       descKey: 'dashboard.progress.weekly.desc',       size: 'lg', icon: LineChartIcon },
  'progress-exercises':  { titleKey: 'dashboard.progress.exercises.title',    descKey: 'dashboard.progress.exercises.desc',    size: 'lg', icon: BarChart3 },
  'progress-percentages':{ titleKey: 'dashboard.progress.percentages.title',  descKey: 'dashboard.progress.percentages.desc',  size: 'lg', icon: PieChartIcon },
  'progress-warnings':   { titleKey: 'dashboard.progress.warnings.title',     descKey: 'dashboard.progress.warnings.desc',     size: 'lg', icon: AlertTriangle },
  'recent-sessions':     { titleKey: 'dashboard.widget.recent.title',         descKey: 'dashboard.widget.recent.desc',         size: 'lg', icon: Clock },
};

const DEFAULT_WIDGETS = [
  'stat-sessions', 'stat-streak', 'stat-exercises', 'stat-consistency',
  'progress-weekly', 'progress-percentages',
  'progress-exercises', 'progress-warnings',
  'recent-sessions',
];

// ─── stat accent colors ──────────────────────────────────────────────────────

const STAT_COLORS: Record<string, string> = {
  'stat-sessions':    'text-primary bg-primary/10',
  'stat-streak':      'text-[#f97316] bg-[#f97316]/10',
  'stat-exercises':   'text-[#3b82f6] bg-[#3b82f6]/10',
  'stat-consistency': 'text-[#22c55e] bg-[#22c55e]/10',
};

// ─── widget content ──────────────────────────────────────────────────────────

interface WidgetContentProps {
  id: string;
  overview: ReturnType<typeof useOverview>['data'];
  insights?: ProgressInsights;
  t: ReturnType<typeof useLanguage>['t'];
}

function WidgetContent({ id, overview, insights, t }: Readonly<WidgetContentProps>) {
  // Activity proxy: pace of days trained in the rolling 7d window. Falls back
  // to 0 until the first session lands so the new-user dashboard doesn't show
  // a confusing NaN%.
  const consistency = Math.round((insights?.workoutPercentages.activeDaysRatio ?? 0) * 100);

  const statValues: Record<string, string | number> = {
    'stat-sessions': overview?.totalSessions ?? 0,
    'stat-streak': t('dashboard.streak.days', { count: overview?.streakDays ?? 0 }),
    'stat-exercises': overview?.activeExercises ?? 0,
    'stat-consistency': `${consistency}%`,
  };

  if (id.startsWith('stat-')) {
    const meta = CATALOG[id];
    const Icon = meta.icon;
    const colorClass = STAT_COLORS[id];
    return (
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-lg shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{t(meta.titleKey)}</p>
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{statValues[id]}</p>
        </div>
      </div>
    );
  }

  if (id === 'progress-weekly') {
    if (!insights) {
      return <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.progress.empty')}</p>;
    }
    return <WeeklyProgressChart data={insights.weeklyTrend} />;
  }

  if (id === 'progress-exercises') {
    if (!insights) {
      return <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.progress.empty')}</p>;
    }
    return <ExerciseTrendList exercises={insights.exercises} />;
  }

  if (id === 'progress-percentages') {
    if (!insights) {
      return <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.progress.empty')}</p>;
    }
    return <WorkoutPercentages data={insights.workoutPercentages} />;
  }

  if (id === 'progress-warnings') {
    if (!insights) {
      return <p className="text-sm text-muted-foreground py-6 text-center">{t('dashboard.progress.empty')}</p>;
    }
    return <SmartWarnings exercises={insights.exercises} learningState={insights.learningState} />;
  }

  if (id === 'recent-sessions') {
    const sessions = overview?.recentSessions ?? [];
    if (sessions.length === 0) {
      return <p className="text-sm text-muted-foreground">{t('dashboard.recentSessions.empty')}</p>;
    }
    const locale = t('common.locale.date');
    return (
      <div className="space-y-2">
        {sessions.slice(0, 3).map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.workoutTableName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(session.startedAt).toLocaleDateString(locale)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="success" className="text-xs">{t('dashboard.recentSessions.completed')}</Badge>
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round(session.completionRate)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ─── main component ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useOverview();
  const insightsQuery = useProgressInsights(8);
  const logRestDay = useLogRestDay();
  const { t } = useLanguage();
  const {
    widgets,
    setWidgets,
    editMode,
    addOpen,
    setAddOpen,
    toggleEditMode,
    availableToAdd,
    addWidget,
    removeWidget,
    moveWidget,
  } = useEditableWidgets({ initial: DEFAULT_WIDGETS, catalog: CATALOG });

  const { draggingId, overId, getItemProps, isPressing } = useWidgetReorder({
    enabled: editMode,
    ids: widgets,
    onReorder: setWidgets,
    onLongPressStart: () => toast.success(t('widget.editMode.dragHint'), { duration: 1200 }),
  });

  const handleRestDay = () => {
    logRestDay.mutate(
      {},
      {
        onSuccess: () => toast.success(t('sessions.toast.restLogged')),
        onError: (err) => toast.error(getServerErrorMessage(err, t('sessions.toast.restFailed'))),
      }
    );
  };

  if (isLoading || insightsQuery.isLoading) return <LoadingSpinner label={t('common.loading')} />;
  const insights = insightsQuery.data;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">
            {t('dashboard.greeting', { name: user?.username ?? t('dashboard.athlete') })}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!editMode && (
            <button
              type="button"
              onClick={handleRestDay}
              disabled={logRestDay.isPending}
              className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-card border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t('dashboard.restDay.tooltip')}
            >
              <Moon className="w-3.5 h-3.5" />
              {t('dashboard.restDay.button')}
            </button>
          )}
          {editMode && availableToAdd.length > 0 && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-card border border-dashed border-primary/60 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('widget.editMode.add')}
            </button>
          )}
          <button
            type="button"
            onClick={toggleEditMode}
            className={cn(
              'flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-sm font-medium transition-all',
              editMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {editMode ? (
              <><Check className="w-3.5 h-3.5" /> {t('widget.editMode.toggle.on')}</>
            ) : (
              <><LayoutDashboard className="w-3.5 h-3.5" /> {t('widget.editMode.toggle.off')}</>
            )}
          </button>
        </div>
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 leading-relaxed">
          <span className="hidden sm:inline">{t('widget.editMode.tipDesktop')}</span>
          <span className="sm:hidden">{t('widget.editMode.tipMobile')}</span>
          {' · '}
          {t('widget.editMode.tipMore')}
        </p>
      )}

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {widgets.map((id) => {
          const meta = CATALOG[id];
          if (!meta) return null;
          const isLg = meta.size === 'lg';
          const isDragOver = overId === id;
          const isDragging = draggingId === id;
          const pressing = isPressing(id);
          const dragProps = getItemProps(id);
          const widgetTitle = t(meta.titleKey);

          return (
            <div
              key={id}
              data-widget-id={id}
              role={editMode ? 'button' : undefined}
              aria-roledescription={editMode ? t('dashboard.widget.aria.movable') : undefined}
              aria-label={widgetTitle}
              tabIndex={editMode ? 0 : undefined}
              onPointerDown={dragProps.onPointerDown}
              onKeyDown={editMode ? (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveWidget(id, e.key === 'ArrowUp' ? -1 : 1);
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  removeWidget(id);
                }
              } : undefined}
              className={cn(
                'bg-card border rounded-2xl hairline transition-all duration-150 select-none',
                isLg && 'sm:col-span-2',
                editMode
                  ? 'border-dashed border-border/60 cursor-grab active:cursor-grabbing touch-none hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/60'
                  : 'border-border hover:border-primary/30',
                pressing && 'scale-[0.985] border-primary/40 shadow-[0_0_0_3px_rgba(132,255,0,0.18)]',
                isDragOver && !isDragging && 'border-primary/60 border-solid bg-primary/5',
                isDragging && 'opacity-40 scale-[0.98]',
              )}
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {editMode && (
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 -ml-1" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">{widgetTitle}</span>
                </div>
                {editMode && (
                  <button
                    type="button"
                    data-no-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0"
                    aria-label={t('dashboard.widget.aria.remove', { title: widgetTitle })}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="px-4 pb-4">
                <WidgetContent
                  id={id}
                  overview={data}
                  insights={insights}
                  t={t}
                />
              </div>
            </div>
          );
        })}

        {widgets.length === 0 && (
          <div className="sm:col-span-2 flex flex-col items-center justify-center py-16 text-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">{t('dashboard.empty.title')}</p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.empty.add')}
            </button>
          </div>
        )}
      </div>

      {/* Add widget bottom-sheet / modal */}
      {addOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 max-w-none max-h-none w-screen h-screen bg-transparent p-0"
          aria-label={t('dashboard.add.title')}
        >
          <div className="absolute inset-0 flex items-end sm:items-center justify-center">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
              onClick={() => setAddOpen(false)}
              aria-label={t('dashboard.add.closePanel')}
            />
            <div className="relative z-10 w-full sm:max-w-md glass rounded-t-3xl sm:rounded-2xl p-5 shadow-xl scale-in pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base">{t('dashboard.add.title')}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.add.subtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide -mx-1 px-1">
                {availableToAdd.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t('dashboard.add.allAdded')}
                  </p>
                ) : (
                  availableToAdd.map((id) => {
                    const meta = CATALOG[id];
                    const Icon = meta.icon;
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => {
                          addWidget(id);
                          if (availableToAdd.length === 1) setAddOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:border-primary/40 border border-transparent transition-all text-left group min-h-[60px]"
                      >
                        <div className="p-2 bg-muted rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{t(meta.titleKey)}</p>
                          <p className="text-xs text-muted-foreground truncate">{t(meta.descKey)}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary transition-all">
                          <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

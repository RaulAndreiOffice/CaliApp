import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Moon, ClipboardList, Activity, Layers, TrendingUp, Lightbulb, BarChart3,
  PieChart as PieChartIcon, Table as TableIcon, GripVertical, X, Plus, Info,
  LayoutDashboard, Check
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart,
  ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { cn } from '../../../utils/cn';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { PlansBoard } from '../../../components/workout-tables/PlansBoard/PlansBoard';
import { useTrainingLoadDashboard } from '../../../hooks/api/useStats';
import { useWidgetReorder } from '../../../hooks/useWidgetReorder';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { TranslationKey } from '../../../i18n/translations';
import type {
  TrainingLoadDashboard,
  TrainingLoadZone,
  TrainingRecommendation,
} from '../../../types/stats.types';

const COLORS = ['#84ff00', '#38bdf8', '#f97316', '#a855f7', '#22c55e', '#f43f5e', '#eab308', '#ec4899'];
const REST_COLOR = '#64748b';

const tooltipStyle = {
  backgroundColor: '#262626',
  border: '1px solid #404040',
  borderRadius: '8px',
  fontSize: '12px',
};

const zoneLabelKey: Record<TrainingLoadZone, TranslationKey> = {
  'below-mv': 'widget.zone.belowMv',
  maintenance: 'widget.zone.maintenance',
  mev: 'widget.zone.mev',
  mav: 'widget.zone.mav',
  'mrv-risk': 'widget.zone.mrvRisk',
};

const zoneClass: Record<TrainingLoadZone, string> = {
  'below-mv': 'border-neutral-600 text-muted-foreground',
  maintenance: 'border-blue-500/60 text-blue-300',
  mev: 'border-lime-500/60 text-lime-300',
  mav: 'border-primary text-primary',
  'mrv-risk': 'border-red-500/70 text-red-300',
};

const recommendationClass: Record<TrainingRecommendation['severity'], string> = {
  info: 'border-blue-500/40 bg-blue-500/10',
  warning: 'border-amber-500/50 bg-amber-500/10',
  danger: 'border-red-500/50 bg-red-500/10',
};

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function balanceKey(status: string): TranslationKey {
  if (status === 'balanced') return 'widget.balance.balanced';
  if (status === 'push-heavy') return 'widget.balance.pushHeavy';
  if (status === 'pull-heavy') return 'widget.balance.pullHeavy';
  return 'widget.balance.insufficient';
}

type WidgetSize = 'sm' | 'lg';

interface WidgetMeta {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  size: WidgetSize;
  icon: React.ElementType;
}

const CATALOG: Record<string, WidgetMeta> = {
  'plans-board':        { titleKey: 'widget.plans.title',          descKey: 'widget.plans.desc',          size: 'lg', icon: ClipboardList },
  'stat-hardsets':      { titleKey: 'widget.hardSets.title',       descKey: 'widget.hardSets.desc',       size: 'sm', icon: Activity },
  'stat-volume':        { titleKey: 'widget.volume.title',         descKey: 'widget.volume.desc',         size: 'sm', icon: Layers },
  'stat-acwr':          { titleKey: 'widget.acwr.title',           descKey: 'widget.acwr.desc',           size: 'sm', icon: TrendingUp },
  'stat-pushpull':      { titleKey: 'widget.pushpull.title',       descKey: 'widget.pushpull.desc',       size: 'sm', icon: Activity },
  'stat-restdays':      { titleKey: 'widget.restDays.title',       descKey: 'widget.restDays.desc',       size: 'sm', icon: Moon },
  'chart-weekly-trend': { titleKey: 'widget.weeklyTrend.title',    descKey: 'widget.weeklyTrend.desc',    size: 'lg', icon: TrendingUp },
  'chart-daily-volume': { titleKey: 'widget.dailyVolume.title',    descKey: 'widget.dailyVolume.desc',    size: 'lg', icon: BarChart3 },
  'chart-distribution': { titleKey: 'widget.distribution.title',   descKey: 'widget.distribution.desc',   size: 'lg', icon: PieChartIcon },
  'recommendations':    { titleKey: 'widget.recommendations.title', descKey: 'widget.recommendations.desc', size: 'lg', icon: Lightbulb },
  'table-zones':        { titleKey: 'widget.zones.title',          descKey: 'widget.zones.desc',          size: 'lg', icon: TableIcon },
};

const DEFAULT_WIDGETS = [
  'plans-board',
  'stat-hardsets', 'stat-volume', 'stat-acwr', 'stat-pushpull', 'stat-restdays',
  'chart-weekly-trend', 'recommendations',
  'chart-daily-volume', 'chart-distribution',
  'table-zones',
];

interface WidgetContentProps {
  id: string;
  data: TrainingLoadDashboard | undefined;
  t: ReturnType<typeof useLanguage>['t'];
}

function WidgetContent({ id, data, t }: Readonly<WidgetContentProps>) {
  if (id === 'plans-board') return <PlansBoard />;

  const currentWeek = data?.weeklyTrend.at(-1);
  const balance = data?.pushPullBalance;
  const restDays = data?.restDaysThisWeek ?? 0;
  const locale = t('common.locale.date');

  if (id === 'stat-hardsets') {
    return (
      <>
        <div className="flex items-center gap-1.5 group relative w-fit mb-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight text-primary">{currentWeek?.hardSets ?? 0}</p>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-card border border-border rounded-lg shadow-lg text-[11px] font-normal text-foreground z-50 pointer-events-none">
            {t('widget.hardSets.hint')}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t('widget.hardSets.desc')}</p>
      </>
    );
  }
  if (id === 'stat-volume') {
    return (
      <>
        <div className="flex items-center gap-1.5 group relative w-fit mb-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{formatNumber(currentWeek?.equivalentReps ?? 0, locale)}</p>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-card border border-border rounded-lg shadow-lg text-[11px] font-normal text-foreground z-50 pointer-events-none">
            {t('widget.volume.hint')}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t('widget.volume.desc')}</p>
      </>
    );
  }
  if (id === 'stat-acwr') {
    return (
      <>
        <div className="flex items-center gap-1.5 group relative w-fit mb-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{currentWeek?.acwr?.toFixed(2) ?? '-'}</p>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-card border border-border rounded-lg shadow-lg text-[11px] font-normal text-foreground z-50 pointer-events-none">
            {t('widget.acwr.hint')}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t('widget.acwr.desc')}</p>
      </>
    );
  }
  if (id === 'stat-pushpull') {
    return (
      <>
        <div className="flex items-center gap-1.5 group relative w-fit mb-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{balance?.pushPullRatio?.toFixed(2) ?? '-'}</p>
          <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-card border border-border rounded-lg shadow-lg text-[11px] font-normal text-foreground z-50 pointer-events-none">
            {t('widget.pushpull.hint')}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t(balanceKey(balance?.status ?? 'insufficient-data'))}</p>
      </>
    );
  }
  if (id === 'stat-restdays') {
    return (
      <>
        <p className="text-xl sm:text-2xl font-bold tabular-nums leading-tight text-[#06b6d4]">{restDays}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('widget.restDays.unit')}</p>
      </>
    );
  }

  if (id === 'chart-weekly-trend') {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data?.weeklyTrend ?? []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <YAxis stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
          <Legend />
          {data && (
            <>
              <ReferenceArea y1={data.landmarks.mavMin} y2={data.landmarks.mavMax} fill="#84ff00" fillOpacity={0.08} />
              <ReferenceLine y={data.landmarks.mv} stroke="#737373" strokeDasharray="4 4" label="MV" />
              <ReferenceLine y={data.landmarks.mev} stroke="#38bdf8" strokeDasharray="4 4" label="MEV" />
              <ReferenceLine y={data.landmarks.mrv} stroke="#ef4444" strokeDasharray="4 4" label="MRV" />
            </>
          )}
          <Line type="monotone" dataKey="hardSets" name={t('widget.chart.weekly.hardSets')} stroke="#84ff00" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="acwr" name={t('widget.chart.weekly.acwr')} stroke="#f97316" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'chart-daily-volume') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data?.dailyVolume ?? []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <YAxis stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
          <Bar dataKey="hardSets" name={t('widget.chart.weekly.hardSets')} fill="#84ff00" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'chart-distribution') {
    const restLabel = t('widget.distribution.rest');
    const baseDistribution = [
      ...(data?.exerciseDistribution ?? []),
      ...(restDays > 0
        ? [{ exerciseId: '__rest', name: restLabel, category: 'rest', hardSets: restDays, equivalentReps: 0 }]
        : []),
    ];
    const distributionData = baseDistribution.map((entry, index) => ({
      ...entry,
      fill: entry.exerciseId === '__rest' ? REST_COLOR : COLORS[index % COLORS.length],
    }));
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%" cy="50%"
            labelLine={false}
            label={(props: PieLabelRenderProps) => {
              const name = String(props.name ?? '');
              const pct = ((props.percent ?? 0) * 100).toFixed(0);
              return `${name} ${pct}%`;
            }}
            outerRadius={82}
            dataKey="hardSets"
            nameKey="name"
          />
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'recommendations') {
    return (
      <div className="space-y-3">
        {(data?.recommendations ?? []).map((item) => (
          <div
            key={`${item.title}-${item.message}`}
            className={`rounded-lg border p-3 ${recommendationClass[item.severity]}`}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'table-zones') {
    return (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full text-sm min-w-[520px]">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 text-left font-medium">{t('widget.zones.col.group')}</th>
              <th className="py-2 text-right font-medium">{t('widget.zones.col.sets')}</th>
              <th className="py-2 text-right font-medium">{t('widget.zones.col.reps')}</th>
              <th className="py-2 text-right font-medium">{t('widget.zones.col.time')}</th>
              <th className="py-2 text-right font-medium">{t('widget.zones.col.volume')}</th>
              <th className="py-2 text-right font-medium">{t('widget.zones.col.zone')}</th>
            </tr>
          </thead>
          <tbody>
            {(data?.currentWeekByCategory ?? []).map((item) => (
              <tr key={item.category} className="border-b border-border/60">
                <td className="py-3 capitalize">{item.category}</td>
                <td className="py-3 text-right">{item.hardSets}</td>
                <td className="py-3 text-right">{formatNumber(item.totalReps, locale)}</td>
                <td className="py-3 text-right">{formatNumber(item.totalTimeSeconds, locale)}{t('common.seconds')}</td>
                <td className="py-3 text-right">{formatNumber(item.equivalentReps, locale)}</td>
                <td className="py-3 text-right">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${zoneClass[item.zone]}`}>
                    {t(zoneLabelKey[item.zone])}
                  </span>
                </td>
              </tr>
            ))}
            {data?.currentWeekByCategory.length === 0 && (
              <tr>
                <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                  {t('widget.zones.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export function WorkoutTablesPage() {
  const trainingLoad = useTrainingLoadDashboard(6);
  const { t } = useLanguage();
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { draggingId, overId, getItemProps, isPressing } = useWidgetReorder({
    enabled: editMode,
    ids: widgets,
    onReorder: setWidgets,
    onLongPressStart: () => toast.success(t('widget.editMode.dragHint'), { duration: 1200 }),
  });

  const availableToAdd = Object.keys(CATALOG).filter((id) => !widgets.includes(id));
  const removeWidget = (id: string) => setWidgets((prev) => prev.filter((w) => w !== id));
  const addWidget = (id: string) => setWidgets((prev) => [...prev, id]);
  const moveWidget = (id: string, delta: number) => {
    setWidgets((prev) => {
      const from = prev.indexOf(id);
      const to = Math.max(0, Math.min(prev.length - 1, from + delta));
      if (from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
  };

  if (trainingLoad.isLoading) return <LoadingSpinner label={t('common.loading')} />;
  const data = trainingLoad.data;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">{t('plans.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('plans.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => { setEditMode((v) => !v); setAddOpen(false); }}
            className={cn(
              'flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg text-sm font-medium transition-all',
              editMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {editMode
              ? (<><Check className="w-3.5 h-3.5" /> {t('widget.editMode.toggle.on')}</>)
              : (<><LayoutDashboard className="w-3.5 h-3.5" /> {t('widget.editMode.toggle.off')}</>)
            }
          </button>
        </div>
      </div>

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
          const Icon = meta.icon;
          const dragProps = getItemProps(id);
          const title = t(meta.titleKey);

          return (
            <div
              key={id}
              data-widget-id={id}
              role={editMode ? 'button' : undefined}
              aria-roledescription={editMode ? t('dashboard.widget.aria.movable') : undefined}
              aria-label={title}
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
                'bg-card border rounded-xl transition-all duration-150 select-none',
                isLg && 'sm:col-span-2',
                editMode
                  ? 'border-dashed border-border/80 cursor-grab active:cursor-grabbing touch-none focus:outline-none focus:ring-2 focus:ring-primary/60'
                  : 'border-border',
                pressing && 'scale-[0.985] border-primary/40 shadow-[0_0_0_3px_rgba(132,255,0,0.18)]',
                isDragOver && !isDragging && 'border-primary border-solid scale-[1.01] bg-primary/5',
                isDragging && 'opacity-40 scale-[0.98]',
              )}
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {editMode && (
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 -ml-1" />
                  )}
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{title}</span>
                </div>
                {editMode && (
                  <button
                    type="button"
                    data-no-drag
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0"
                    aria-label={t('dashboard.widget.aria.remove', { title })}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="px-4 pb-4">
                <WidgetContent id={id} data={data} t={t} />
              </div>
            </div>
          );
        })}

        {widgets.length === 0 && (
          <div className="sm:col-span-2 flex flex-col items-center justify-center py-16 text-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">{t('widget.empty.title')}</p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('widget.empty.add')}
            </button>
          </div>
        )}
      </div>

      {/* Add widget panel */}
      {addOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 m-0 max-w-none max-h-none w-screen h-screen bg-transparent p-0"
          aria-label={t('widget.add.title')}
        >
          <div className="absolute inset-0 flex items-end sm:items-center justify-center">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
              onClick={() => setAddOpen(false)}
              aria-label={t('dashboard.add.closePanel')}
            />
            <div className="relative z-10 w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base">{t('widget.add.title')}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('widget.add.subtitle')}</p>
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
                    {t('widget.add.allAdded')}
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

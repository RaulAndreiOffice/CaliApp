import { useRef, useState } from 'react';
import {
  Moon, ClipboardList, Activity, Layers, TrendingUp, Lightbulb, BarChart3,
  PieChart as PieChartIcon, Table as TableIcon, GripVertical, X, Plus,
  LayoutDashboard, Check,
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

const zoneLabel: Record<TrainingLoadZone, string> = {
  'below-mv': 'Sub MV',
  maintenance: 'Mentenanta',
  mev: 'MEV',
  mav: 'MAV',
  'mrv-risk': 'Risc MRV',
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

function formatNumber(value: number) {
  return new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(value);
}

function getBalanceText(status: string) {
  if (status === 'balanced') return 'Echilibrat';
  if (status === 'push-heavy') return 'Push prea mult';
  if (status === 'pull-heavy') return 'Pull dominant';
  return 'Date putine';
}

type WidgetSize = 'sm' | 'lg';

interface WidgetMeta {
  title: string;
  description: string;
  size: WidgetSize;
  icon: React.ElementType;
}

const CATALOG: Record<string, WidgetMeta> = {
  'plans-board':        { title: 'Plans',                  description: 'Planuri de antrenament si pornire sesiune', size: 'lg', icon: ClipboardList },
  'stat-hardsets':      { title: 'Serii grele',            description: 'Proxy din seturi completate',               size: 'sm', icon: Activity },
  'stat-volume':        { title: 'Volum echiv.',           description: 'Reps + secunde/2',                           size: 'sm', icon: Layers },
  'stat-acwr':          { title: 'ACWR',                   description: 'Spike peste 1.5',                            size: 'sm', icon: TrendingUp },
  'stat-pushpull':      { title: 'Push/Pull',              description: 'Echilibru push vs pull',                     size: 'sm', icon: Activity },
  'stat-restdays':      { title: 'Rest days',              description: 'Zile de odihna saptamana curenta',           size: 'sm', icon: Moon },
  'chart-weekly-trend': { title: 'Weekly Hard Sets Trend', description: 'Volum saptamanal cu zone MV/MEV/MRV',        size: 'lg', icon: TrendingUp },
  'chart-daily-volume': { title: 'Volum pe zile',          description: 'Distributie zilnica saptamana curenta',      size: 'lg', icon: BarChart3 },
  'chart-distribution': { title: 'Distributie exercitii', description: 'Pondere serii pe exercitii (+ rest)',        size: 'lg', icon: PieChartIcon },
  'recommendations':    { title: 'Recomandari',            description: 'Sugestii pe baza zonelor si ACWR',           size: 'lg', icon: Lightbulb },
  'table-zones':        { title: 'Zone de volum pe grupe', description: 'Push/Pull/Legs/Core defalcate',              size: 'lg', icon: TableIcon },
};

const DEFAULT_WIDGETS = [
  'plans-board',
  'stat-hardsets', 'stat-volume', 'stat-acwr', 'stat-pushpull', 'stat-restdays',
  'chart-weekly-trend', 'recommendations',
  'chart-daily-volume', 'chart-distribution',
  'table-zones',
];

function WidgetContent({ id, data }: Readonly<{ id: string; data: TrainingLoadDashboard | undefined }>) {
  if (id === 'plans-board') return <PlansBoard />;

  const currentWeek = data?.weeklyTrend.at(-1);
  const balance = data?.pushPullBalance;
  const restDays = data?.restDaysThisWeek ?? 0;

  if (id === 'stat-hardsets') {
    return (
      <>
        <p className="text-2xl font-bold tabular-nums leading-tight text-primary">{currentWeek?.hardSets ?? 0}</p>
        <p className="text-xs text-muted-foreground mt-1">proxy din seturi completate</p>
      </>
    );
  }
  if (id === 'stat-volume') {
    return (
      <>
        <p className="text-2xl font-bold tabular-nums leading-tight">{formatNumber(currentWeek?.equivalentReps ?? 0)}</p>
        <p className="text-xs text-muted-foreground mt-1">reps + secunde/2</p>
      </>
    );
  }
  if (id === 'stat-acwr') {
    return (
      <>
        <p className="text-2xl font-bold tabular-nums leading-tight">{currentWeek?.acwr?.toFixed(2) ?? '-'}</p>
        <p className="text-xs text-muted-foreground mt-1">spike peste 1.5</p>
      </>
    );
  }
  if (id === 'stat-pushpull') {
    return (
      <>
        <p className="text-2xl font-bold tabular-nums leading-tight">{balance?.pushPullRatio?.toFixed(2) ?? '-'}</p>
        <p className="text-xs text-muted-foreground mt-1">{getBalanceText(balance?.status ?? 'insufficient-data')}</p>
      </>
    );
  }
  if (id === 'stat-restdays') {
    return (
      <>
        <p className="text-2xl font-bold tabular-nums leading-tight text-[#06b6d4]">{restDays}</p>
        <p className="text-xs text-muted-foreground mt-1">saptamana curenta</p>
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
          <Line type="monotone" dataKey="hardSets" name="Serii grele" stroke="#84ff00" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="acwr" name="ACWR" stroke="#f97316" strokeWidth={2} />
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
          <Bar dataKey="hardSets" name="Serii grele" fill="#84ff00" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'chart-distribution') {
    const baseDistribution = [
      ...(data?.exerciseDistribution ?? []),
      ...(restDays > 0
        ? [{ exerciseId: '__rest', name: 'Rest', category: 'rest', hardSets: restDays, equivalentReps: 0 }]
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 text-left font-medium">Grupa</th>
              <th className="py-2 text-right font-medium">Serii</th>
              <th className="py-2 text-right font-medium">Reps</th>
              <th className="py-2 text-right font-medium">Timp</th>
              <th className="py-2 text-right font-medium">Volum echiv.</th>
              <th className="py-2 text-right font-medium">Zona</th>
            </tr>
          </thead>
          <tbody>
            {(data?.currentWeekByCategory ?? []).map((item) => (
              <tr key={item.category} className="border-b border-border/60">
                <td className="py-3 capitalize">{item.category}</td>
                <td className="py-3 text-right">{item.hardSets}</td>
                <td className="py-3 text-right">{formatNumber(item.totalReps)}</td>
                <td className="py-3 text-right">{formatNumber(item.totalTimeSeconds)}s</td>
                <td className="py-3 text-right">{formatNumber(item.equivalentReps)}</td>
                <td className="py-3 text-right">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${zoneClass[item.zone]}`}>
                    {zoneLabel[item.zone]}
                  </span>
                </td>
              </tr>
            ))}
            {data?.currentWeekByCategory.length === 0 && (
              <tr>
                <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                  Nu exista antrenamente completate in saptamana curenta.
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
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    dragNode.current = e.currentTarget;
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4';
    }, 0);
  };
  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    dragNode.current = null;
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) setDragOverId(id);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setWidgets((prev) => {
      const from = prev.indexOf(draggedId);
      const to = prev.indexOf(targetId);
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      return next;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  if (trainingLoad.isLoading) return <LoadingSpinner label="Se incarca..." />;
  const data = trainingLoad.data;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Plans &amp; Progress</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Planuri + volum real, zone si echilibru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editMode && availableToAdd.length > 0 && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-dashed border-primary/60 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adauga
            </button>
          )}
          <button
            type="button"
            onClick={() => { setEditMode((v) => !v); setAddOpen(false); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              editMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {editMode
              ? (<><Check className="w-3.5 h-3.5" /> Gata</>)
              : (<><LayoutDashboard className="w-3.5 h-3.5" /> Editeaza</>)
            }
          </button>
        </div>
      </div>

      {editMode && (
        <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          Trage widget-urile pentru a le reordona · Apasa <strong className="text-foreground">×</strong> pentru a elimina · Apasa <strong className="text-foreground">Adauga</strong> pentru a adauga
        </p>
      )}

      {/* Widget grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {widgets.map((id) => {
          const meta = CATALOG[id];
          if (!meta) return null;
          const isLg = meta.size === 'lg';
          const isDragOver = dragOverId === id;
          const isDragging = draggedId === id;
          const Icon = meta.icon;

          return (
            <div
              key={id}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={(e) => handleDrop(e, id)}
              onDragLeave={() => setDragOverId(null)}
              role="group"
              aria-roledescription={editMode ? 'Widget mutabil cu sageti sus/jos' : undefined}
              aria-label={meta.title}
              tabIndex={editMode ? 0 : -1}
              onKeyDown={(e) => {
                if (!editMode) return;
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveWidget(id, e.key === 'ArrowUp' ? -1 : 1);
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                  e.preventDefault();
                  removeWidget(id);
                }
              }}
              className={cn(
                'bg-card border rounded-xl transition-all duration-150',
                isLg && 'sm:col-span-2',
                editMode
                  ? 'border-dashed border-border/80 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/60'
                  : 'border-border',
                isDragOver && !isDragging && 'border-primary border-solid scale-[1.01] bg-primary/5',
                isDragging && 'opacity-40',
              )}
            >
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  {editMode && (
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 -ml-1" />
                  )}
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">{meta.title}</span>
                </div>
                {editMode && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="px-4 pb-4">
                <WidgetContent id={id} data={data} />
              </div>
            </div>
          );
        })}

        {widgets.length === 0 && (
          <div className="sm:col-span-2 flex flex-col items-center justify-center py-16 text-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Pagina e goala.</p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adauga primul widget
            </button>
          </div>
        )}
      </div>

      {/* Add widget panel */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={() => setAddOpen(false)}
            aria-label="Inchide panel"
          />
          <div className="relative z-10 w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Adauga Widget</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Alege ce vrei pe pagina</p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
              {availableToAdd.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Toate widget-urile sunt deja adaugate.
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
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:border-primary/40 border border-transparent transition-all text-left group"
                    >
                      <div className="p-2 bg-muted rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meta.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:border-primary group-hover:bg-primary transition-all">
                        <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
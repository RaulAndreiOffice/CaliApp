import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Activity, Zap, Target, TrendingUp, GripVertical,
  X, Plus, LayoutDashboard, Check, Clock, Moon,
  BarChart2, LineChart as LineChartIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../stores/auth.store';
import { useOverview, useTrainingLoadDashboard } from '../../../hooks/api/useStats';
import { useLogRestDay } from '../../../hooks/api/useWorkoutSessions';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner/LoadingSpinner';
import type { TrainingLoadDashboard } from '../../../types/stats.types';

// ─── data ───────────────────────────────────────────────────────────────────

// ─── widget catalog ──────────────────────────────────────────────────────────

type WidgetSize = 'sm' | 'lg';

interface WidgetMeta {
  title: string;
  description: string;
  size: WidgetSize;
  icon: React.ElementType;
}

const CATALOG: Record<string, WidgetMeta> = {
  'stat-sessions':    { title: 'Sesiuni',          description: 'Total sesiuni completate',    size: 'sm', icon: Activity },
  'stat-streak':      { title: 'Streak',           description: 'Zile consecutive de antrenament', size: 'sm', icon: Zap },
  'stat-exercises':   { title: 'Exercitii Active', description: 'Exercitii in uz',             size: 'sm', icon: Target },
  'stat-consistency': { title: 'Constanta',        description: 'Rata de antrenament weekly',  size: 'sm', icon: TrendingUp },
  'chart-volume':     { title: 'Volum Saptamanal', description: 'Seturi per zi aceasta saptamana', size: 'lg', icon: BarChart2 },
  'chart-completion': { title: 'Rata Completare',  description: 'Trend repetari aceasta saptamana', size: 'lg', icon: LineChartIcon },
  'recent-sessions':  { title: 'Sesiuni Recente',  description: 'Ultimele antrenamente',       size: 'lg', icon: Clock },
};

const DEFAULT_WIDGETS = [
  'stat-sessions', 'stat-streak', 'stat-exercises', 'stat-consistency',
  'chart-volume', 'chart-completion',
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

function WidgetContent({
  id,
  overview,
  trainingLoad,
}: {
  id: string;
  overview: ReturnType<typeof useOverview>['data'];
  trainingLoad?: TrainingLoadDashboard;
}) {
  const currentWeek = trainingLoad?.weeklyTrend.at(-1);
  const dailyData = trainingLoad?.dailyVolume ?? [];
  const weeklySessionGoal = 3;
  const consistency = Math.min(
    100,
    Math.round(((currentWeek?.sessionsCount ?? 0) / weeklySessionGoal) * 100)
  );

  const statValues: Record<string, string | number> = {
    'stat-sessions': overview?.totalSessions ?? 0,
    'stat-streak': `${overview?.streakDays ?? 0} zile`,
    'stat-exercises': overview?.activeExercises ?? 0,
    'stat-consistency': `${consistency}%`,
  };

  // stat card
  if (id.startsWith('stat-')) {
    const Icon = CATALOG[id].icon;
    const colorClass = STAT_COLORS[id];
    return (
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-lg shrink-0', colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{CATALOG[id].title}</p>
          <p className="text-2xl font-bold tabular-nums leading-tight">{statValues[id]}</p>
        </div>
      </div>
    );
  }

  if (id === 'chart-volume') {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={dailyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="label" stroke="#666" style={{ fontSize: '11px' }} tick={{ fill: '#888' }} />
          <YAxis stroke="#666" style={{ fontSize: '11px' }} tick={{ fill: '#888' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--glass-bg-strong, rgba(38,38,38,0.85))', backdropFilter: 'blur(40px)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
            labelStyle={{ color: '#f5f5f5' }}
          />
          <Bar dataKey="hardSets" name="Serii grele" fill="#84ff00" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'chart-completion') {
    return (
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={dailyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="label" stroke="#666" style={{ fontSize: '11px' }} tick={{ fill: '#888' }} />
          <YAxis stroke="#666" style={{ fontSize: '11px' }} tick={{ fill: '#888' }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--glass-bg-strong, rgba(38,38,38,0.85))', backdropFilter: 'blur(40px)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
            labelStyle={{ color: '#f5f5f5' }}
          />
          <Area
            type="monotone"
            dataKey="completionRate"
            name="Rata completare"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (id === 'recent-sessions') {
    const sessions = overview?.recentSessions ?? [];
    if (sessions.length === 0) {
      return <p className="text-sm text-muted-foreground">Nicio sesiune inca.</p>;
    }
    return (
      <div className="space-y-2">
        {sessions.slice(0, 3).map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.workoutTableName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(session.startedAt).toLocaleDateString('ro-RO')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="success" className="text-xs">completat</Badge>
              <span className="text-xs text-muted-foreground">
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
  const trainingLoad = useTrainingLoadDashboard(6);
  const logRestDay = useLogRestDay();
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const handleRestDay = () => {
    logRestDay.mutate(
      {},
      {
        onSuccess: () => toast.success('Rest day inregistrat pentru azi'),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message;
          toast.error(msg ?? 'Nu am putut inregistra rest day-ul');
        },
      }
    );
  };

  const availableToAdd = Object.keys(CATALOG).filter((id) => !widgets.includes(id));

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w !== id));
  };

  const addWidget = (id: string) => {
    setWidgets((prev) => [...prev, id]);
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

  if (isLoading || trainingLoad.isLoading) return <LoadingSpinner label="Se incarca..." />;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Buna, <span className="serif-accent">{user?.username ?? 'atlet'}</span> 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Progresul tau saptamanal</p>
        </div>

        <div className="flex items-center gap-2">
          {!editMode && (
            <button
              type="button"
              onClick={handleRestDay}
              disabled={logRestDay.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Marcheaza ziua de azi ca rest day"
            >
              <Moon className="w-3.5 h-3.5" />
              Rest day
            </button>
          )}
          {editMode && availableToAdd.length > 0 && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-dashed border-primary/60 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adauga
            </button>
          )}
          <button
            onClick={() => {
              setEditMode((v) => !v);
              setAddOpen(false);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              editMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            )}
          >
            {editMode ? (
              <><Check className="w-3.5 h-3.5" /> Gata</>
            ) : (
              <><LayoutDashboard className="w-3.5 h-3.5" /> Editeaza</>
            )}
          </button>
        </div>
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          Trage widget-urile pentru a le reordona · Apasa <strong className="text-foreground">×</strong> pentru a le elimina · Apasa <strong className="text-foreground">Adauga</strong> pentru a adauga altele
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

          return (
            <div
              key={id}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={(e) => handleDrop(e, id)}
              onDragLeave={() => setDragOverId(null)}
              className={cn(
                'bg-card border rounded-2xl hairline transition-colors duration-[var(--d-fast,160ms)]',
                isLg && 'sm:col-span-2',
                editMode
                  ? 'border-dashed border-border/60 cursor-grab active:cursor-grabbing hover:border-primary/30'
                  : 'border-border hover:border-primary/30',
                isDragOver && !isDragging && 'border-primary/60 border-solid bg-primary/5',
                isDragging && 'opacity-30',
              )}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  {editMode && (
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 -ml-1" />
                  )}
                  <span className="text-sm font-medium text-foreground">{meta.title}</span>
                </div>
                {editMode && (
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card content */}
              <div className="px-4 pb-4">
                <WidgetContent
                  id={id}
                  overview={data}
                  trainingLoad={trainingLoad.data}
                />
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {widgets.length === 0 && (
          <div className="sm:col-span-2 flex flex-col items-center justify-center py-16 text-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">Dashboard-ul este gol.</p>
            <button
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
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAddOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md glass rounded-t-3xl sm:rounded-2xl p-5 shadow-xl scale-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Adauga Widget</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Alege ce vrei sa adaugi pe dashboard</p>
              </div>
              <button
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

import { Moon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui/Card';
import { LoadingSpinner } from '../../common/LoadingSpinner/LoadingSpinner';
import { useTrainingLoadDashboard } from '../../../hooks/api/useStats';
import type {
  TrainingLoadZone,
  TrainingRecommendation,
} from '../../../types/stats.types';

const COLORS = ['#84ff00', '#38bdf8', '#f97316', '#a855f7', '#22c55e', '#f43f5e', '#eab308', '#ec4899'];
const REST_COLOR = '#64748b';

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg-strong, rgba(38, 38, 38, 0.85))',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
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
  info: 'border-blue-500/30 bg-blue-500/8 shadow-[0_0_12px_rgba(59,130,246,0.06)]',
  warning: 'border-amber-500/30 bg-amber-500/8 shadow-[0_0_12px_rgba(245,158,11,0.06)]',
  danger: 'border-red-500/30 bg-red-500/8 shadow-[0_0_12px_rgba(239,68,68,0.06)]',
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

interface ProgressDashboardSectionProps {
  showHeader?: boolean;
  weeks?: number;
}

export function ProgressDashboardSection({
  showHeader = true,
  weeks = 6,
}: Readonly<ProgressDashboardSectionProps>) {
  const trainingLoad = useTrainingLoadDashboard(weeks);

  if (trainingLoad.isLoading) {
    return <LoadingSpinner label="Se incarca statisticile..." />;
  }

  const data = trainingLoad.data;
  const currentWeek = data?.weeklyTrend.at(-1);
  const balance = data?.pushPullBalance;
  const restDays = data?.restDaysThisWeek ?? 0;

  const distributionData = [
    ...(data?.exerciseDistribution ?? []),
    ...(restDays > 0
      ? [{ exerciseId: '__rest', name: 'Rest', category: 'rest', hardSets: restDays, equivalentReps: 0 }]
      : []),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Progress &amp; Stats</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Volum real, zone de adaptare si echilibru pentru calistenie.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Serii grele</p>
            <p className="text-xl sm:text-3xl font-bold text-primary">
              {currentWeek?.hardSets ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">proxy din seturi completate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Volum echiv.</p>
            <p className="text-xl sm:text-3xl font-bold">
              {formatNumber(currentWeek?.equivalentReps ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">reps + secunde/2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">ACWR</p>
            <p className="text-xl sm:text-3xl font-bold">
              {currentWeek?.acwr?.toFixed(2) ?? '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">spike peste 1.5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Push/Pull</p>
            <p className="text-xl sm:text-3xl font-bold">
              {balance?.pushPullRatio?.toFixed(2) ?? '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {getBalanceText(balance?.status ?? 'insufficient-data')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#06b6d4]" />
              <p className="text-xs sm:text-sm text-muted-foreground">Rest days</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold">{restDays}</p>
            <p className="text-xs text-muted-foreground mt-1">saptamana curenta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Weekly Hard Sets Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.weeklyTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '12px' }} />
                <YAxis stroke="#a3a3a3" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
                <Legend />
                {data && (
                  <>
                    <ReferenceArea
                      y1={data.landmarks.mavMin}
                      y2={data.landmarks.mavMax}
                      fill="#84ff00"
                      fillOpacity={0.08}
                    />
                    <ReferenceLine y={data.landmarks.mv} stroke="#737373" strokeDasharray="4 4" label="MV" />
                    <ReferenceLine y={data.landmarks.mev} stroke="#38bdf8" strokeDasharray="4 4" label="MEV" />
                    <ReferenceLine y={data.landmarks.mrv} stroke="#ef4444" strokeDasharray="4 4" label="MRV" />
                  </>
                )}
                <Line
                  type="monotone"
                  dataKey="hardSets"
                  name="Serii grele"
                  stroke="#84ff00"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="acwr"
                  name="ACWR"
                  stroke="#f97316"
                  strokeWidth={2}
                  yAxisId={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Recomandari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recommendations ?? []).map((item) => (
                <div
                  key={`${item.title}-${item.message}`}
                  className={`rounded-xl border p-3.5 ${recommendationClass[item.severity]}`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Volum pe zile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.dailyVolume ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '12px' }} />
                <YAxis stroke="#a3a3a3" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
                <Bar dataKey="hardSets" name="Serii grele" fill="#84ff00" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Distributie exercitii
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const name = String(props.name ?? '');
                    const pct = ((props.percent ?? 0) * 100).toFixed(0);
                    return `${name} ${pct}%`;
                  }}
                  outerRadius={82}
                  dataKey="hardSets"
                  nameKey="name"
                >
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={entry.exerciseId}
                      fill={entry.exerciseId === '__rest' ? REST_COLOR : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Zone de volum pe grupe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground/70">
                <tr className="border-b border-border/30">
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
                  <tr key={item.category} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="py-3 capitalize">{item.category}</td>
                    <td className="py-3 text-right">{item.hardSets}</td>
                    <td className="py-3 text-right">{formatNumber(item.totalReps)}</td>
                    <td className="py-3 text-right">{formatNumber(item.totalTimeSeconds)}s</td>
                    <td className="py-3 text-right">{formatNumber(item.equivalentReps)}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${zoneClass[item.zone]}`}>
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
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Nota: pana adaugam RIR/RPE pe fiecare set, &quot;serii grele&quot; este un proxy bazat pe seturile completate.
      </p>
    </div>
  );
}
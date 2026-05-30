import prisma from "../config/database";
import { AppError } from "../utils/apiError";
import type { WeeklyStatsDTO } from "../dtos/stats/weekly-stats.dto";
import type { ExerciseProgressDTO } from "../dtos/stats/exercise-progress.dto";
import type {
  CategoryTrainingLoadDTO,
  DailyTrainingLoadPointDTO,
  ExerciseDistributionDTO,
  LearningStateDTO,
  PushPullBalanceDTO,
  TrainingLoadDashboardDTO,
  TrainingLoadZone,
  TrainingRecommendationDTO,
  WeeklyTrainingLoadPointDTO,
} from "../dtos/stats/training-load-dashboard.dto";
import type {
  CardioInsightsDTO,
  CardioWeekPointDTO,
  CategoryShareDTO,
  ExerciseInsightDTO,
  ExerciseInsightWarningDTO,
  ExerciseTrendPointDTO,
  ProgressInsightsDTO,
  WeeklyVolumePointDTO,
  WorkoutPercentagesDTO,
} from "../dtos/stats/progress-insights.dto";

// Recommendations need a baseline of how the user normally trains before we
// can flag outliers like spikes or MRV-risk; without this gate, anyone in
// their first week sees scary warnings off a single workout.
const LEARNING_MIN_DAYS = 10;
const LEARNING_MIN_SESSIONS = 3;

// Trend classification thresholds for per-exercise progress.
const PROGRESS_TREND_DELTA = 10;     // |delta%| under this counts as flat
const PROGRESS_DROP_RATIO = 0.7;     // last week < 70% of prior avg → drop warning
const PROGRESS_SPIKE_RATIO = 1.5;    // last week > 150% of prior avg → spike warning
const PROGRESS_MIN_COMPLETED_WEEKS = 3; // need at least this many active weeks for a trend

function computeLearningState(
  firstCompletedAt: Date | null,
  completedSessions: number,
): LearningStateDTO {
  const daysOfHistory = firstCompletedAt
    ? Math.floor((Date.now() - firstCompletedAt.getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  const isLearning =
    !firstCompletedAt ||
    daysOfHistory < LEARNING_MIN_DAYS ||
    completedSessions < LEARNING_MIN_SESSIONS;
  return {
    firstCompletedAt,
    daysOfHistory,
    completedSessions,
    isLearning,
    minDays: LEARNING_MIN_DAYS,
    minSessions: LEARNING_MIN_SESSIONS,
  };
}

function equivalentVolumeForPoint(point: ExerciseTrendPointDTO): number {
  return point.totalReps + point.totalTimeSeconds / 2;
}

function classifyExerciseTrend(
  weeklyData: ExerciseTrendPointDTO[],
  isLearning: boolean,
): Pick<ExerciseInsightDTO, "trend" | "deltaPercent" | "warning"> {
  const completed = weeklyData.filter((w) => w.sessions > 0);
  if (completed.length < PROGRESS_MIN_COMPLETED_WEEKS) {
    return { trend: "insufficient", deltaPercent: 0, warning: null };
  }
  const last = completed[completed.length - 1];
  const prior = completed.slice(0, -1);
  const priorAvg = prior.reduce((sum, w) => sum + equivalentVolumeForPoint(w), 0) / prior.length;
  if (priorAvg <= 0) {
    return { trend: "insufficient", deltaPercent: 0, warning: null };
  }
  const lastVol = equivalentVolumeForPoint(last);
  const deltaPercent = Math.round(((lastVol - priorAvg) / priorAvg) * 100);

  let trend: ExerciseInsightDTO["trend"];
  if (Math.abs(deltaPercent) < PROGRESS_TREND_DELTA) trend = "flat";
  else if (deltaPercent > 0) trend = "up";
  else trend = "down";

  let warning: ExerciseInsightWarningDTO | null = null;
  if (!isLearning) {
    if (lastVol < PROGRESS_DROP_RATIO * priorAvg) {
      warning = {
        kind: "drop",
        severity: "warning",
        message: `Ai scăzut volumul cu ${Math.abs(deltaPercent)}% față de ritmul tău obișnuit.`,
      };
    } else if (lastVol > PROGRESS_SPIKE_RATIO * priorAvg) {
      warning = {
        kind: "spike",
        severity: "warning",
        message: `Volumul a crescut cu ${deltaPercent}% față de obișnuit. Ai grijă la suprasolicitare.`,
      };
    }
  }

  return { trend, deltaPercent, warning };
}

interface ExerciseRowSample {
  exerciseId: string;
  exerciseName: string;
  category: string;
  isTime: boolean;
  reps: number;
  time: number;
  sets: number;
  weekIndex: number;
  sessionId: string;
}

function buildExerciseInsights(
  samples: ExerciseRowSample[],
  weeks: number,
  firstWeek: Date,
  isLearning: boolean,
): ExerciseInsightDTO[] {
  interface Agg {
    name: string;
    category: string;
    measurementType: "reps" | "time";
    perWeek: Map<number, { reps: number; time: number; sets: number; sessionIds: Set<string> }>;
  }
  const byExercise = new Map<string, Agg>();

  for (const s of samples) {
    const existing = byExercise.get(s.exerciseId) ?? {
      name: s.exerciseName,
      category: s.category,
      measurementType: (s.isTime ? "time" : "reps") as "reps" | "time",
      perWeek: new Map<number, { reps: number; time: number; sets: number; sessionIds: Set<string> }>(),
    };
    const week = existing.perWeek.get(s.weekIndex) ?? {
      reps: 0,
      time: 0,
      sets: 0,
      sessionIds: new Set<string>(),
    };
    week.reps += s.reps;
    week.time += s.time;
    week.sets += s.sets;
    week.sessionIds.add(s.sessionId);
    existing.perWeek.set(s.weekIndex, week);
    byExercise.set(s.exerciseId, existing);
  }

  const exercises: ExerciseInsightDTO[] = [];
  for (const [exerciseId, agg] of byExercise) {
    const weeklyData: ExerciseTrendPointDTO[] = Array.from({ length: weeks }, (_, idx) => {
      const weekStart = addDays(firstWeek, idx * 7);
      const wk = agg.perWeek.get(idx);
      const reps = wk?.reps ?? 0;
      const time = wk?.time ?? 0;
      const sets = wk?.sets ?? 0;
      const sessions = wk?.sessionIds.size ?? 0;
      const totalValue = reps + time;
      return {
        weekStart,
        label: formatWeekLabel(weekStart),
        totalReps: reps,
        totalTimeSeconds: time,
        sets,
        sessions,
        avgPerSet: sets > 0 ? Math.round((totalValue / sets) * 100) / 100 : 0,
      };
    });

    const { trend, deltaPercent, warning } = classifyExerciseTrend(weeklyData, isLearning);
    exercises.push({
      exerciseId,
      name: agg.name,
      category: agg.category,
      measurementType: agg.measurementType,
      weeklyData,
      trend,
      deltaPercent,
      warning,
    });
  }

  // Surface warnings first, then by recent activity. Helps the dashboard
  // show the most actionable rows in the top slots.
  exercises.sort((a, b) => {
    const aw = a.warning ? 0 : 1;
    const bw = b.warning ? 0 : 1;
    if (aw !== bw) return aw - bw;
    const aLast = a.weeklyData[a.weeklyData.length - 1]?.sessions ?? 0;
    const bLast = b.weeklyData[b.weeklyData.length - 1]?.sessions ?? 0;
    return bLast - aLast;
  });

  return exercises;
}

function buildCategoryShares(categoryMap: Map<string, number>): CategoryShareDTO[] {
  const total = Array.from(categoryMap.values()).reduce((s, v) => s + v, 0);
  return Array.from(categoryMap.entries())
    .map(([category, sets]) => ({
      category,
      sets,
      percentage: total > 0 ? Math.round((sets / total) * 100) : 0,
    }))
    .sort((a, b) => b.sets - a.sets);
}

interface DashboardOverviewDTO {
  totalSessions: number;
  streakDays: number;
  activeExercises: number;
  recentSessions: Array<{
    id: string;
    workoutTableName: string;
    startedAt: Date;
    completionRate: number;
  }>;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - day);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatWeekLabel(date: Date) {
  return date.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("ro-RO", { weekday: "short" });
}

const VOLUME_LANDMARKS = {
  mv: 6,
  mev: 10,
  mavMin: 12,
  mavMax: 20,
  mrv: 25,
} as const;

function getVolumeZone(hardSets: number): TrainingLoadZone {
  if (hardSets < VOLUME_LANDMARKS.mv) return "below-mv";
  if (hardSets < VOLUME_LANDMARKS.mev) return "maintenance";
  if (hardSets < VOLUME_LANDMARKS.mavMin) return "mev";
  if (hardSets <= VOLUME_LANDMARKS.mavMax) return "mav";
  return "mrv-risk";
}

function normalizeCategory(category: string | null | undefined, exerciseName: string) {
  const source = `${category ?? ""} ${exerciseName}`.toLowerCase();

  if (/(push|chest|triceps|piept|impins|împins|flot|dips)/i.test(source)) return "push";
  if (/(pull|back|biceps|spate|tras|tract|chin)/i.test(source)) return "pull";
  if (/(core|abs|abdomen|plank|l-sit|lsit)/i.test(source)) return "core";
  if (/(legs|leg|squat|picioare|genuflex|fandari|lunges)/i.test(source)) return "legs";

  return category?.trim() || "other";
}

function createEmptyDailyPoint(date: Date): DailyTrainingLoadPointDTO {
  return {
    date,
    label: formatDayLabel(date),
    hardSets: 0,
    totalReps: 0,
    totalTimeSeconds: 0,
    equivalentReps: 0,
    completionRate: 0,
  };
}

function calcCompletionRate(rows: Array<{
  plannedSetsSnapshot: number | null;
  plannedTargetValueSnapshot: number | null;
  performedSets: Array<{ actualValue: number }>;
}>) {
  if (rows.length === 0) return 0;

  const total = rows.reduce((acc, row) => {
    return acc + ((row.plannedSetsSnapshot ?? 0) * (row.plannedTargetValueSnapshot ?? 0));
  }, 0);
  const actual = rows.reduce((acc, row) => {
    return acc + row.performedSets.reduce((sum, set) => sum + set.actualValue, 0);
  }, 0);

  if (total === 0) return 0;
  return Math.min(100, (actual / total) * 100);
}

async function getCompletedSessionsInRange(userId: string, from: Date, to: Date) {
  return prisma.workoutSession.findMany({
    where: {
      userId,
      status: "completed",
      startedAt: { gte: from, lt: to },
    },
    include: {
      workoutTable: { select: { name: true } },
      rows: {
        include: {
          exercise: true,
          performedSets: true,
        },
      },
    },
  });
}

export const statsService = {
  getOverview: async (userId: string): Promise<DashboardOverviewDTO> => {
    const totalSessions = await prisma.workoutSession.count({
      where: { userId, status: "completed" },
    });

    const activeExercises = await prisma.exercise.count({
      where: {
        archivedAt: null,
        OR: [{ ownerUserId: userId }, { isGlobal: true }],
      },
    });

    const recent = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        workoutTable: { select: { name: true } },
        rows: { include: { performedSets: true } },
      },
    });

    const completedDates = await prisma.workoutSession.findMany({
      where: { userId, status: "completed" },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    });

    const days = new Set(completedDates.map((session) => session.startedAt.toISOString().slice(0, 10)));
    let streakDays = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const recentSessions = recent.map((session) => ({
      id: session.id,
      workoutTableName: session.workoutTable?.name ?? "Antrenament liber",
      startedAt: session.startedAt,
      completionRate: calcCompletionRate(session.rows),
    }));

    return { totalSessions, streakDays, activeExercises, recentSessions };
  },

  getWeeklyStats: async (userId: string): Promise<WeeklyStatsDTO> => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = addDays(weekStart, 7);
    const previousStart = addDays(weekStart, -7);

    const [sessions, previousSessions] = await Promise.all([
      getCompletedSessionsInRange(userId, weekStart, weekEnd),
      getCompletedSessionsInRange(userId, previousStart, weekStart),
    ]);

    const summarize = (items: Awaited<ReturnType<typeof getCompletedSessionsInRange>>) => {
      const totalSets = items.reduce((acc, session) => {
        return acc + session.rows.reduce((sum, row) => sum + row.performedSets.length, 0);
      }, 0);
      const totalReps = items.reduce((acc, session) => {
        return acc + session.rows.reduce((sum, row) => {
          if (row.measurementTypeSnapshot === "time") return sum;
          return sum + row.performedSets.reduce((setSum, set) => setSum + set.actualValue, 0);
        }, 0);
      }, 0);
      const totalTimeSeconds = items.reduce((acc, session) => {
        return acc + session.rows.reduce((sum, row) => {
          if (row.measurementTypeSnapshot !== "time") return sum;
          return sum + row.performedSets.reduce((setSum, set) => setSum + set.actualValue, 0);
        }, 0);
      }, 0);
      const completionRate = items.length === 0
        ? 0
        : items.reduce((acc, session) => acc + calcCompletionRate(session.rows), 0) / items.length;

      return { totalSets, totalReps, totalTimeSeconds, completionRate };
    };

    const current = summarize(sessions);
    const previous = summarize(previousSessions);

    return {
      weekStart,
      weekEnd,
      totalSessions: sessions.length,
      totalSets: current.totalSets,
      totalReps: current.totalReps,
      totalTimeSeconds: current.totalTimeSeconds,
      completionRate: current.completionRate,
      vsLastWeek: {
        sessionsDiff: sessions.length - previousSessions.length,
        completionDiff: Math.round(current.completionRate - previous.completionRate),
      },
    };
  },

  getExerciseProgress: async (userId: string, exerciseId: string, weeks: number): Promise<ExerciseProgressDTO> => {
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (!exercise.isGlobal && exercise.ownerUserId !== userId) throw AppError.forbidden();

    const safeWeeks = Math.min(52, Math.max(1, weeks));
    const currentWeek = startOfWeek(new Date());
    const firstWeek = addDays(currentWeek, -(safeWeeks - 1) * 7);

    const rows = await prisma.workoutSessionRow.findMany({
      where: {
        exerciseId,
        workoutSession: {
          userId,
          status: "completed",
          startedAt: { gte: firstWeek, lt: addDays(currentWeek, 7) },
        },
      },
      include: {
        performedSets: true,
        workoutSession: { select: { startedAt: true } },
      },
    });

    const weekly = Array.from({ length: safeWeeks }, (_, index) => {
      const weekStart = addDays(firstWeek, index * 7);
      return {
        weekStart,
        totalReps: 0,
        totalTimeSeconds: 0,
        avgValue: 0,
        sessionsCount: 0,
        setCount: 0,
      };
    });

    for (const row of rows) {
      const weekIndex = Math.floor((startOfWeek(row.workoutSession.startedAt).getTime() - firstWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const bucket = weekly[weekIndex];
      if (!bucket) continue;

      const rowTotal = row.performedSets.reduce((sum, set) => sum + set.actualValue, 0);
      if (row.measurementTypeSnapshot === "time") {
        bucket.totalTimeSeconds += rowTotal;
      } else {
        bucket.totalReps += rowTotal;
      }
      bucket.setCount += row.performedSets.length;
      bucket.sessionsCount += 1;
    }

    return {
      exerciseId,
      exerciseName: exercise.name,
      weeks: weekly.map(({ setCount, ...week }) => ({
        ...week,
        avgValue: setCount === 0 ? 0 : (week.totalReps + week.totalTimeSeconds) / setCount,
      })),
    };
  },

  getTrainingLoadDashboard: async (userId: string, weeks: number | "all"): Promise<TrainingLoadDashboardDTO> => {
    const currentWeek = startOfWeek(new Date());
    const historyStats = await prisma.workoutSession.aggregate({
      where: { userId, status: "completed" },
      _count: { _all: true },
      _min: { startedAt: true },
    });
    const firstCompletedAt = historyStats._min.startedAt ?? null;
    // Hard ceiling on both paths (incl. "all") so a long-lived account can't
    // make this endpoint load its entire history with deep includes in one go.
    const MAX_WEEKS = 260; // ~5 years
    const safeWeeks = weeks === "all"
      ? Math.min(
          MAX_WEEKS,
          Math.max(
            1,
            firstCompletedAt
              ? Math.floor(
                  (currentWeek.getTime() - startOfWeek(firstCompletedAt).getTime()) /
                    (7 * 24 * 60 * 60 * 1000)
                ) + 1
              : 1
          )
        )
      : Math.min(MAX_WEEKS, Math.max(1, weeks));
    const firstWeek = addDays(currentWeek, -(safeWeeks - 1) * 7);
    const end = addDays(currentWeek, 7);

    const [sessions, restDaysThisWeek] = await Promise.all([
      getCompletedSessionsInRange(userId, firstWeek, end),
      prisma.workoutSession.count({
        where: {
          userId,
          status: "rest",
          startedAt: { gte: currentWeek, lt: addDays(currentWeek, 7) },
        },
      }),
    ]);

    const completedSessions = historyStats._count._all;
    const daysOfHistory = firstCompletedAt
      ? Math.floor((Date.now() - firstCompletedAt.getTime()) / (24 * 60 * 60 * 1000))
      : 0;
    const isLearning =
      !firstCompletedAt ||
      daysOfHistory < LEARNING_MIN_DAYS ||
      completedSessions < LEARNING_MIN_SESSIONS;

    const learningState: LearningStateDTO = {
      firstCompletedAt,
      daysOfHistory,
      completedSessions,
      isLearning,
      minDays: LEARNING_MIN_DAYS,
      minSessions: LEARNING_MIN_SESSIONS,
    };

    const weekly = Array.from({ length: safeWeeks }, (_, index) => {
      const weekStart = addDays(firstWeek, index * 7);
      return {
        weekStart,
        label: formatWeekLabel(weekStart),
        hardSets: 0,
        totalReps: 0,
        totalTimeSeconds: 0,
        equivalentReps: 0,
        sessionsCount: 0,
        acwr: null,
        zone: "below-mv" as TrainingLoadZone,
        spike: false,
      };
    });

    const dailyVolume = Array.from({ length: 7 }, (_, index) =>
      createEmptyDailyPoint(addDays(currentWeek, index))
    );
    const dailyCompletion = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));
    const categoryMap = new Map<string, CategoryTrainingLoadDTO>();
    const exerciseMap = new Map<string, ExerciseDistributionDTO>();
    const sessionIdsByWeek = new Map<number, Set<string>>();

    for (const session of sessions) {
      const weekIndex = Math.floor(
        (startOfWeek(session.startedAt).getTime() - firstWeek.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const weekBucket = weekly[weekIndex];
      if (!weekBucket) continue;

      if (!sessionIdsByWeek.has(weekIndex)) {
        sessionIdsByWeek.set(weekIndex, new Set());
      }
      sessionIdsByWeek.get(weekIndex)!.add(session.id);

      const dayIndex = Math.floor(
        (new Date(session.startedAt).setHours(0, 0, 0, 0) - currentWeek.getTime()) /
          (24 * 60 * 60 * 1000)
      );
      const dayBucket = dailyVolume[dayIndex];

      if (dayBucket) {
        dailyCompletion[dayIndex].total += calcCompletionRate(session.rows);
        dailyCompletion[dayIndex].count += 1;
      }

      for (const row of session.rows) {
        const exerciseName = row.exercise?.name ?? "Necunoscut";
        const category = normalizeCategory(row.exercise?.category, exerciseName);
        const setCount = row.performedSets.length;
        const rowTotal = row.performedSets.reduce((sum, set) => sum + set.actualValue, 0);
        const isTime = row.measurementTypeSnapshot === "time";
        const reps = isTime ? 0 : rowTotal;
        const timeSeconds = isTime ? rowTotal : 0;
        const equivalentReps = reps + timeSeconds / 2;

        weekBucket.hardSets += setCount;
        weekBucket.totalReps += reps;
        weekBucket.totalTimeSeconds += timeSeconds;
        weekBucket.equivalentReps += equivalentReps;

        if (dayBucket) {
          dayBucket.hardSets += setCount;
          dayBucket.totalReps += reps;
          dayBucket.totalTimeSeconds += timeSeconds;
          dayBucket.equivalentReps += equivalentReps;
        }

        if (weekIndex === safeWeeks - 1) {
          const categoryBucket = categoryMap.get(category) ?? {
            category,
            hardSets: 0,
            totalReps: 0,
            totalTimeSeconds: 0,
            equivalentReps: 0,
            zone: "below-mv" as TrainingLoadZone,
          };
          categoryBucket.hardSets += setCount;
          categoryBucket.totalReps += reps;
          categoryBucket.totalTimeSeconds += timeSeconds;
          categoryBucket.equivalentReps += equivalentReps;
          categoryMap.set(category, categoryBucket);

          const exerciseKey = row.exerciseId;
          const exerciseBucket = exerciseMap.get(exerciseKey) ?? {
            exerciseId: exerciseKey,
            name: exerciseName,
            category,
            hardSets: 0,
            equivalentReps: 0,
          };
          exerciseBucket.hardSets += setCount;
          exerciseBucket.equivalentReps += equivalentReps;
          exerciseMap.set(exerciseKey, exerciseBucket);
        }
      }
    }

    const weeklyTrend: WeeklyTrainingLoadPointDTO[] = weekly.map((point, index) => {
      const previousFour = weekly.slice(Math.max(0, index - 4), index);
      const previousAverage =
        previousFour.length === 0
          ? 0
          : previousFour.reduce((sum, item) => sum + item.hardSets, 0) / previousFour.length;
      const previousWeek = weekly[index - 1];
      const acwr = previousAverage > 0 ? point.hardSets / previousAverage : null;
      // Spike comparisons against a tiny history are noise. Only flag a spike
      // once the user has cleared the learning threshold AND the previous
      // window actually contains real volume to compare against.
      const rawSpike =
        (acwr !== null && acwr > 1.5) ||
        (previousWeek ? point.hardSets - previousWeek.hardSets > 3 : false);

      return {
        ...point,
        sessionsCount: sessionIdsByWeek.get(index)?.size ?? 0,
        equivalentReps: Math.round(point.equivalentReps),
        acwr: acwr === null ? null : Number(acwr.toFixed(2)),
        zone: getVolumeZone(point.hardSets),
        spike: isLearning ? false : rawSpike,
      };
    });

    const currentWeekByCategory = Array.from(categoryMap.values())
      .map((item) => ({
        ...item,
        equivalentReps: Math.round(item.equivalentReps),
        zone: getVolumeZone(item.hardSets),
      }))
      .sort((a, b) => b.hardSets - a.hardSets);

    const exerciseDistribution = Array.from(exerciseMap.values())
      .map((item) => ({ ...item, equivalentReps: Math.round(item.equivalentReps) }))
      .sort((a, b) => b.hardSets - a.hardSets)
      .slice(0, 8);

    const pushSets = currentWeekByCategory.find((item) => item.category === "push")?.hardSets ?? 0;
    const pullSets = currentWeekByCategory.find((item) => item.category === "pull")?.hardSets ?? 0;
    const coreSets = currentWeekByCategory.find((item) => item.category === "core")?.hardSets ?? 0;
    const legsSets = currentWeekByCategory.find((item) => item.category === "legs")?.hardSets ?? 0;
    const pushPullRatio = pullSets > 0 ? Number((pushSets / pullSets).toFixed(2)) : null;
    const pushPullBalance: PushPullBalanceDTO = {
      pushSets,
      pullSets,
      coreSets,
      legsSets,
      pushPullRatio,
      status:
        pushSets === 0 || pullSets === 0
          ? "insufficient-data"
          : pushPullRatio! > 1.25
            ? "push-heavy"
            : pushPullRatio! < 0.8
              ? "pull-heavy"
              : "balanced",
    };

    const currentWeekPoint = weeklyTrend[weeklyTrend.length - 1];
    const recommendations: TrainingRecommendationDTO[] = [];

    if (isLearning) {
      // During the learning window we hide every warning/danger card and
      // surface a single info note so the user understands why the engine
      // hasn't started flagging things yet.
      recommendations.push({
        severity: "info",
        title: "Inca invatam ritmul tau",
        message:
          "Dupa 7-10 zile de antrenamente logate, recomandarile vor evidentia abaterile reale fata de stilul tau.",
      });
    } else {
      if (currentWeekPoint?.zone === "below-mv") {
        recommendations.push({
          severity: "info",
          title: "Volum sub MV",
          message: "Saptamana curenta este sub volumul de mentinere. E ok pentru pauza, dar nu pentru progres.",
        });
      }

      if (currentWeekPoint?.zone === "mrv-risk") {
        recommendations.push({
          severity: "danger",
          title: "Risc MRV",
          message: "Volumul trece peste zona MAV. Ia in calcul deload sau imparte seturile pe mai multe zile.",
        });
      }

      if (currentWeekPoint?.spike) {
        recommendations.push({
          severity: "warning",
          title: "Spike de volum",
          message: "Cresterea fata de istoricul recent este abrupta. Progresia recomandata este de 1-3 serii pe saptamana.",
        });
      }

      if (pushPullBalance.status === "push-heavy") {
        recommendations.push({
          severity: "warning",
          title: "Push/Pull dezechilibrat",
          message: "Ai semnificativ mai multe seturi de impins decat de tras. Pentru umeri sanatosi, apropie raportul de 1:1.",
        });
      }

      if (pushPullBalance.status === "pull-heavy") {
        recommendations.push({
          severity: "info",
          title: "Pull dominant",
          message: "Ai mai mult volum de tras decat de impins. Poate fi intentionat, dar verifica echilibrul planului.",
        });
      }

      if (recommendations.length === 0) {
        recommendations.push({
          severity: "info",
          title: "Zona buna",
          message: "Volumul curent arata controlat. Pentru analiza mai precisa, urmatorul pas este logarea RIR/RPE pe set.",
        });
      }
    }

    return {
      landmarks: VOLUME_LANDMARKS,
      weeklyTrend,
      dailyVolume: dailyVolume.map((item, index) => ({
        ...item,
        equivalentReps: Math.round(item.equivalentReps),
        completionRate:
          dailyCompletion[index].count === 0
            ? 0
            : Math.round(
                dailyCompletion[index].total /
                  dailyCompletion[index].count
              ),
      })),
      currentWeekByCategory,
      exerciseDistribution,
      pushPullBalance,
      recommendations,
      restDaysThisWeek,
      learningState,
    };
  },

  // Cross-exercise progress view for the dashboard. Aggregates weekly volume
  // per exercise, classifies a trend (up/flat/down) by comparing the last
  // active week to the average of prior active weeks, attaches drop/spike
  // warnings only once the user is past the learning window, and also returns
  // a flat weekly trend + workout-percentage breakdown for the cleaner
  // dashboard widgets. Keeps Plans & Progress untouched.
  getProgressInsights: async (userId: string, weeks: number): Promise<ProgressInsightsDTO> => {
    const safeWeeks = Math.min(12, Math.max(4, weeks));
    const currentWeek = startOfWeek(new Date());
    const firstWeek = addDays(currentWeek, -(safeWeeks - 1) * 7);
    const end = addDays(currentWeek, 7);
    const last7DaysStart = addDays(new Date(new Date().setHours(0, 0, 0, 0)), -6);

    const [sessions, historyStats, cardioAgg, cardioSessions] = await Promise.all([
      getCompletedSessionsInRange(userId, firstWeek, end),
      prisma.workoutSession.aggregate({
        where: { userId, status: "completed" },
        _count: { _all: true },
        _min: { startedAt: true },
      }),
      // Cardio totals are all-time so the headline percentage matches the user's
      // mental model ("2 runs of 6 activities = 33%"), independent of the chart window.
      prisma.workoutSession.aggregate({
        where: { userId, status: "cardio" },
        _count: { _all: true },
        _sum: { distanceKm: true, durationMinutes: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId, status: "cardio", startedAt: { gte: firstWeek, lt: end } },
        select: { startedAt: true, distanceKm: true },
      }),
    ]);

    const learningState = computeLearningState(
      historyStats._min.startedAt ?? null,
      historyStats._count._all,
    );

    // Aggregations built in one pass over the rows so we don't loop the
    // sessions array more than necessary.
    const weeklyAgg = Array.from({ length: safeWeeks }, () => ({
      totalReps: 0,
      totalTimeSeconds: 0,
      totalSets: 0,
      sessionIds: new Set<string>(),
    }));
    const categoryAgg = new Map<string, number>();
    const activeDaysSet = new Set<string>();
    const samples: ExerciseRowSample[] = [];

    let completionSum = 0;
    let completionCount = 0;

    for (const session of sessions) {
      const weekIndex = Math.floor(
        (startOfWeek(session.startedAt).getTime() - firstWeek.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );

      if (session.startedAt >= last7DaysStart) {
        activeDaysSet.add(session.startedAt.toISOString().slice(0, 10));
      }

      completionSum += calcCompletionRate(session.rows);
      completionCount += 1;

      const wk = weekIndex >= 0 && weekIndex < safeWeeks ? weeklyAgg[weekIndex] : null;
      if (wk) wk.sessionIds.add(session.id);

      for (const row of session.rows) {
        const exerciseName = row.exercise?.name ?? "Necunoscut";
        const category = normalizeCategory(row.exercise?.category, exerciseName);
        const setCount = row.performedSets.length;
        const rowTotal = row.performedSets.reduce((s, set) => s + set.actualValue, 0);
        const isTime = row.measurementTypeSnapshot === "time";
        const reps = isTime ? 0 : rowTotal;
        const time = isTime ? rowTotal : 0;

        categoryAgg.set(category, (categoryAgg.get(category) ?? 0) + setCount);

        if (wk) {
          wk.totalReps += reps;
          wk.totalTimeSeconds += time;
          wk.totalSets += setCount;
        }

        samples.push({
          exerciseId: row.exerciseId,
          exerciseName,
          category,
          isTime,
          reps,
          time,
          sets: setCount,
          weekIndex,
          sessionId: session.id,
        });
      }
    }

    const exercises = buildExerciseInsights(samples, safeWeeks, firstWeek, learningState.isLearning);

    const workoutPercentages: WorkoutPercentagesDTO = {
      activeDaysRatio: activeDaysSet.size / 7,
      completionRate: completionCount > 0 ? Math.round(completionSum / completionCount) : 0,
      totalCompletedSessions: learningState.completedSessions,
      byCategory: buildCategoryShares(categoryAgg),
    };

    const weeklyTrend: WeeklyVolumePointDTO[] = weeklyAgg.map((wk, idx) => {
      const weekStart = addDays(firstWeek, idx * 7);
      return {
        weekStart,
        label: formatWeekLabel(weekStart),
        totalReps: wk.totalReps,
        totalTimeSeconds: wk.totalTimeSeconds,
        sessions: wk.sessionIds.size,
        totalSets: wk.totalSets,
      };
    });

    // ── strength-vs-cardio balance ──────────────────────────────────────────
    // Reuse weeklyAgg's per-week completed-session counts as the strength side,
    // and bucket the manually entered runs by week for the same window.
    const round1 = (n: number) => Math.round(n * 10) / 10;
    const cardioWeekly = Array.from({ length: safeWeeks }, () => ({ runs: 0, distanceKm: 0 }));
    for (const run of cardioSessions) {
      const weekIndex = Math.floor(
        (startOfWeek(run.startedAt).getTime() - firstWeek.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );
      if (weekIndex >= 0 && weekIndex < safeWeeks) {
        cardioWeekly[weekIndex].runs += 1;
        cardioWeekly[weekIndex].distanceKm += run.distanceKm ?? 0;
      }
    }

    const cardioWeeklyPoints: CardioWeekPointDTO[] = cardioWeekly.map((wk, idx) => {
      const weekStart = addDays(firstWeek, idx * 7);
      const strengthSessions = weeklyAgg[idx].sessionIds.size;
      const weekTotal = wk.runs + strengthSessions;
      return {
        weekStart,
        label: formatWeekLabel(weekStart),
        runs: wk.runs,
        distanceKm: round1(wk.distanceKm),
        strengthSessions,
        cardioPercentage: weekTotal > 0 ? Math.round((wk.runs / weekTotal) * 100) : 0,
      };
    });

    const strengthSessionsAllTime = learningState.completedSessions;
    const cardioActivities = cardioAgg._count._all;
    const totalActivities = strengthSessionsAllTime + cardioActivities;
    const cardioPercentage =
      totalActivities > 0 ? Math.round((cardioActivities / totalActivities) * 100) : 0;
    const totalDistanceKm = round1(cardioAgg._sum.distanceKm ?? 0);

    let balanceLevel: CardioInsightsDTO["balanceLevel"];
    if (cardioActivities === 0) balanceLevel = "none";
    else if (cardioPercentage < 20) balanceLevel = "low";
    else if (cardioPercentage <= 40) balanceLevel = "balanced";
    else balanceLevel = "high";

    const thisWeekPoint = cardioWeeklyPoints[cardioWeeklyPoints.length - 1];
    const lastWeekPoint = cardioWeeklyPoints[cardioWeeklyPoints.length - 2];

    const cardio: CardioInsightsDTO = {
      totalActivities,
      strengthSessions: strengthSessionsAllTime,
      cardioActivities,
      cardioPercentage,
      totalDistanceKm,
      totalDurationMinutes: cardioAgg._sum.durationMinutes ?? 0,
      avgDistanceKm: cardioActivities > 0 ? round1(totalDistanceKm / cardioActivities) : 0,
      balanceLevel,
      thisWeekRuns: thisWeekPoint?.runs ?? 0,
      lastWeekRuns: lastWeekPoint?.runs ?? 0,
      thisWeekDistanceKm: thisWeekPoint?.distanceKm ?? 0,
      lastWeekDistanceKm: lastWeekPoint?.distanceKm ?? 0,
      weekly: cardioWeeklyPoints,
    };

    return { exercises, workoutPercentages, weeklyTrend, cardio, learningState };
  },
};

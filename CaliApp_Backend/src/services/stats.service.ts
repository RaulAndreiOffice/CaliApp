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

// Recommendations need a baseline of how the user normally trains before we
// can flag outliers like spikes or MRV-risk; without this gate, anyone in
// their first week sees scary warnings off a single workout.
const LEARNING_MIN_DAYS = 10;
const LEARNING_MIN_SESSIONS = 3;

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

  getTrainingLoadDashboard: async (userId: string, weeks: number): Promise<TrainingLoadDashboardDTO> => {
    const safeWeeks = Math.min(12, Math.max(4, weeks));
    const currentWeek = startOfWeek(new Date());
    const firstWeek = addDays(currentWeek, -(safeWeeks - 1) * 7);
    const end = addDays(currentWeek, 7);

    const [sessions, restDaysThisWeek, historyStats] = await Promise.all([
      getCompletedSessionsInRange(userId, firstWeek, end),
      prisma.workoutSession.count({
        where: {
          userId,
          status: "rest",
          startedAt: { gte: currentWeek, lt: addDays(currentWeek, 7) },
        },
      }),
      prisma.workoutSession.aggregate({
        where: { userId, status: "completed" },
        _count: { _all: true },
        _min: { startedAt: true },
      }),
    ]);

    const firstCompletedAt = historyStats._min.startedAt ?? null;
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
};

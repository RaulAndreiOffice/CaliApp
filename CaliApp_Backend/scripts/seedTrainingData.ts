import "dotenv/config";
import prisma from "../src/config/database";

const TARGET_EMAIL = process.env.SEED_EMAIL ?? "andrei@example.com";
const WEEKS = Number.parseInt(process.env.SEED_WEEKS ?? "12", 10);
const SESSIONS_PER_WEEK = Number.parseInt(process.env.SEED_SESSIONS_PER_WEEK ?? "3", 10);
const REST_DAYS_PER_WEEK = Number.parseInt(process.env.SEED_REST_DAYS_PER_WEEK ?? "2", 10);

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function jitter(value: number, pct = 0.1) {
  return value * (1 + rand(-pct, pct));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertExercise(ownerUserId: string, data: {
  name: string;
  category: string;
  measurementType: "reps" | "time";
  defaultSets: number;
  defaultTargetValue: number;
  defaultRestSeconds: number;
}) {
  const existing = await prisma.exercise.findFirst({
    where: { ownerUserId, name: data.name },
  });
  if (existing) return existing;
  return prisma.exercise.create({
    data: {
      ownerUserId,
      name: data.name,
      category: data.category,
      measurementType: data.measurementType,
      defaultSets: data.defaultSets,
      defaultTargetValue: data.defaultTargetValue,
      defaultRestSeconds: data.defaultRestSeconds,
      isGlobal: false,
    },
  });
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) throw new Error(`User not found: ${TARGET_EMAIL}`);
  console.log(`Seeding for user: ${user.email} (${user.id})`);

  // 1) Make sure we have a variety of exercises across categories.
  const pushExercises = await Promise.all([
    upsertExercise(user.id, { name: "Push Up",        category: "Chest",     measurementType: "reps", defaultSets: 4, defaultTargetValue: 15, defaultRestSeconds: 60 }),
    upsertExercise(user.id, { name: "Dips",           category: "Chest",     measurementType: "reps", defaultSets: 4, defaultTargetValue: 10, defaultRestSeconds: 90 }),
    upsertExercise(user.id, { name: "Pike Push Up",   category: "Shoulders", measurementType: "reps", defaultSets: 3, defaultTargetValue: 8,  defaultRestSeconds: 90 }),
    upsertExercise(user.id, { name: "Diamond Push Up",category: "Triceps",   measurementType: "reps", defaultSets: 3, defaultTargetValue: 10, defaultRestSeconds: 60 }),
  ]);

  const legsExercises = await Promise.all([
    upsertExercise(user.id, { name: "Bulgarian Split Squat", category: "Legs", measurementType: "reps", defaultSets: 4, defaultTargetValue: 10, defaultRestSeconds: 90 }),
    upsertExercise(user.id, { name: "Pistol Squat",          category: "Legs", measurementType: "reps", defaultSets: 3, defaultTargetValue: 5,  defaultRestSeconds: 120 }),
    upsertExercise(user.id, { name: "Wall Sit",              category: "Legs", measurementType: "time", defaultSets: 3, defaultTargetValue: 45, defaultRestSeconds: 60 }),
  ]);

  const coreExercises = await Promise.all([
    upsertExercise(user.id, { name: "Plank",            category: "Core", measurementType: "time", defaultSets: 3, defaultTargetValue: 60, defaultRestSeconds: 45 }),
    upsertExercise(user.id, { name: "L-Sit Hold",       category: "Core", measurementType: "time", defaultSets: 3, defaultTargetValue: 20, defaultRestSeconds: 60 }),
    upsertExercise(user.id, { name: "Hanging Leg Raise",category: "Core", measurementType: "reps", defaultSets: 3, defaultTargetValue: 12, defaultRestSeconds: 60 }),
  ]);

  console.log(`Exercises ensured: +${pushExercises.length} push, +${legsExercises.length} legs, +${coreExercises.length} core`);

  // 2) Find existing tables.
  const pushTable = await prisma.workoutTable.findFirst({
    where: { ownerUserId: user.id, name: "PusDay" },
  });
  const backTable = await prisma.workoutTable.findFirst({
    where: { ownerUserId: user.id, name: "Back Focus" },
  });
  if (!pushTable || !backTable) throw new Error("Missing PusDay or Back Focus table");

  // 3) Fill PusDay with rows if empty.
  const pushRowsCount = await prisma.workoutTableRow.count({ where: { workoutTableId: pushTable.id } });
  if (pushRowsCount === 0) {
    await prisma.workoutTableRow.createMany({
      data: [
        { workoutTableId: pushTable.id, exerciseId: pushExercises[0].id, plannedSets: 4, plannedTargetValue: 15, restSeconds: 60, orderIndex: 0 },
        { workoutTableId: pushTable.id, exerciseId: pushExercises[1].id, plannedSets: 4, plannedTargetValue: 10, restSeconds: 90, orderIndex: 1 },
        { workoutTableId: pushTable.id, exerciseId: pushExercises[2].id, plannedSets: 3, plannedTargetValue: 8,  restSeconds: 90, orderIndex: 2 },
        { workoutTableId: pushTable.id, exerciseId: pushExercises[3].id, plannedSets: 3, plannedTargetValue: 10, restSeconds: 60, orderIndex: 3 },
      ],
    });
    console.log("Filled PusDay table with 4 rows");
  }

  // 4) Create a Legs/Core table if missing.
  let legsCoreTable = await prisma.workoutTable.findFirst({
    where: { ownerUserId: user.id, name: "Legs & Core" },
  });
  if (!legsCoreTable) {
    legsCoreTable = await prisma.workoutTable.create({
      data: {
        ownerUserId: user.id,
        name: "Legs & Core",
        description: "Lower body + core stability",
        isActive: true,
      },
    });
    await prisma.workoutTableRow.createMany({
      data: [
        { workoutTableId: legsCoreTable.id, exerciseId: legsExercises[0].id, plannedSets: 4, plannedTargetValue: 10, restSeconds: 90, orderIndex: 0 },
        { workoutTableId: legsCoreTable.id, exerciseId: legsExercises[1].id, plannedSets: 3, plannedTargetValue: 5,  restSeconds: 120, orderIndex: 1 },
        { workoutTableId: legsCoreTable.id, exerciseId: legsExercises[2].id, plannedSets: 3, plannedTargetValue: 45, restSeconds: 60, orderIndex: 2 },
        { workoutTableId: legsCoreTable.id, exerciseId: coreExercises[0].id, plannedSets: 3, plannedTargetValue: 60, restSeconds: 45, orderIndex: 3 },
        { workoutTableId: legsCoreTable.id, exerciseId: coreExercises[2].id, plannedSets: 3, plannedTargetValue: 12, restSeconds: 60, orderIndex: 4 },
      ],
    });
    console.log("Created Legs & Core table with 5 rows");
  }

  // 5) Clean: mark stale "started" sessions today as cancelled.
  const stale = await prisma.workoutSession.updateMany({
    where: { userId: user.id, status: "started" },
    data: { status: "cancelled", completedAt: new Date() },
  });
  if (stale.count > 0) console.log(`Marked ${stale.count} stale "started" sessions as cancelled`);

  // 6) Backfill performed sets for any existing completed session that has no sets.
  const existingSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id },
    include: { rows: { include: { performedSets: true, exercise: true } } },
  });
  let backfilledSets = 0;
  for (const s of existingSessions) {
    for (const row of s.rows) {
      if (row.performedSets.length > 0) continue;
      const sets = row.plannedSetsSnapshot ?? 3;
      const target = row.plannedTargetValueSnapshot ?? 10;
      for (let i = 1; i <= sets; i++) {
        await prisma.performedSet.create({
          data: {
            workoutSessionRowId: row.id,
            setNumber: i,
            actualValue: Math.max(1, Math.round(jitter(target, 0.15))),
          },
        });
        backfilledSets++;
      }
    }
  }
  if (backfilledSets > 0) console.log(`Backfilled ${backfilledSets} performed sets on existing sessions`);

  // 7) Generate new sessions over WEEKS weeks, rotating tables.
  const tables = [
    await prisma.workoutTable.findUniqueOrThrow({ where: { id: backTable.id }, include: { rows: { include: { exercise: true } } } }),
    await prisma.workoutTable.findUniqueOrThrow({ where: { id: pushTable.id }, include: { rows: { include: { exercise: true } } } }),
    await prisma.workoutTable.findUniqueOrThrow({ where: { id: legsCoreTable.id }, include: { rows: { include: { exercise: true } } } }),
  ];

  const now = new Date();
  let sessionsCreated = 0;
  let setsCreated = 0;

  for (let w = WEEKS - 1; w >= 0; w--) {
    // progression factor: 0.85 at start, 1.10 at most recent
    const progressFactor = 0.85 + ((WEEKS - 1 - w) / Math.max(1, WEEKS - 1)) * 0.25;

    // Workout days within the week (Mon/Wed/Fri-ish based on count).
    const dayOffsets = SESSIONS_PER_WEEK === 3 ? [0, 2, 4]
                     : SESSIONS_PER_WEEK === 4 ? [0, 1, 3, 5]
                     : Array.from({ length: SESSIONS_PER_WEEK }, (_, i) => i);

    for (let d = 0; d < dayOffsets.length; d++) {
      const startedAt = new Date(now);
      startedAt.setDate(startedAt.getDate() - w * 7 - (6 - dayOffsets[d]));
      startedAt.setHours(18, Math.floor(rand(0, 59)), 0, 0);

      // Sometimes skip a session to simulate missed days (5% chance, more recent = less likely).
      if (Math.random() < 0.05 * (1 - progressFactor + 0.5)) continue;

      const table = tables[(w + d) % tables.length];
      const status: "completed" | "cancelled" = Math.random() < 0.08 ? "cancelled" : "completed";

      const sessionDurationMin = status === "cancelled" ? Math.floor(rand(5, 15)) : Math.floor(rand(35, 65));
      const completedAt = new Date(startedAt.getTime() + sessionDurationMin * 60_000);

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTableId: table.id,
          startedAt,
          completedAt,
          status,
          notes: status === "cancelled" ? "Cut short — low energy" : null,
        },
      });
      sessionsCreated++;

      if (status === "cancelled") continue;

      // Snapshot rows from the table.
      for (const tableRow of table.rows) {
        const sessionRow = await prisma.workoutSessionRow.create({
          data: {
            workoutSessionId: session.id,
            workoutTableRowId: tableRow.id,
            exerciseId: tableRow.exerciseId,
            plannedSetsSnapshot: tableRow.plannedSets,
            plannedTargetValueSnapshot: tableRow.plannedTargetValue,
            measurementTypeSnapshot: tableRow.exercise.measurementType,
            orderIndex: tableRow.orderIndex,
          },
        });

        // Performed sets with progressive overload + noise.
        const baseTarget = tableRow.plannedTargetValue * progressFactor;
        for (let i = 1; i <= tableRow.plannedSets; i++) {
          // Slight drop-off per set (fatigue).
          const setFactor = 1 - (i - 1) * 0.03;
          const value = Math.max(1, Math.round(jitter(baseTarget * setFactor, 0.12)));
          await prisma.performedSet.create({
            data: {
              workoutSessionRowId: sessionRow.id,
              setNumber: i,
              actualValue: value,
            },
          });
          setsCreated++;
        }
      }
    }
  }

  console.log(`\nGenerated ${sessionsCreated} new sessions and ${setsCreated} performed sets over ${WEEKS} weeks.`);

  // 8) Backfill rest days — fill REST_DAYS_PER_WEEK days per week that have no session yet.
  let restDaysCreated = 0;
  const restNotesPool = [
    "Mobility + foam roller",
    "Walk + stretching",
    "Active recovery",
    "Sleep + hydration",
    null,
    null,
  ];

  for (let w = WEEKS - 1; w >= 0; w--) {
    // Days already occupied by a session (any status) in this week.
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - w * 7 - 6);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const occupied = await prisma.workoutSession.findMany({
      where: { userId: user.id, startedAt: { gte: weekStart, lt: weekEnd } },
      select: { startedAt: true },
    });
    const usedDays = new Set(
      occupied.map((s) => new Date(s.startedAt).toISOString().slice(0, 10))
    );

    const freeOffsets: number[] = [];
    for (let d = 0; d < 7; d++) {
      const candidate = new Date(weekStart);
      candidate.setDate(candidate.getDate() + d);
      if (candidate > now) continue;
      if (!usedDays.has(candidate.toISOString().slice(0, 10))) {
        freeOffsets.push(d);
      }
    }

    // Pick REST_DAYS_PER_WEEK random free offsets.
    const restCount = Math.min(REST_DAYS_PER_WEEK, freeOffsets.length);
    for (let i = freeOffsets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [freeOffsets[i], freeOffsets[j]] = [freeOffsets[j], freeOffsets[i]];
    }

    for (let i = 0; i < restCount; i++) {
      const restDate = new Date(weekStart);
      restDate.setDate(restDate.getDate() + freeOffsets[i]);
      restDate.setHours(8, 0, 0, 0);
      const note = restNotesPool[Math.floor(Math.random() * restNotesPool.length)];

      await prisma.workoutSession.create({
        data: {
          userId: user.id,
          workoutTableId: null,
          startedAt: restDate,
          completedAt: restDate,
          status: "rest",
          notes: note,
        },
      });
      restDaysCreated++;
    }
  }
  console.log(`Generated ${restDaysCreated} rest days over ${WEEKS} weeks.`);

  // 9) Summary.
  const [users, exercises, tablesCount, sessions, restDays, rows, sets] = await Promise.all([
    prisma.user.count(),
    prisma.exercise.count({ where: { ownerUserId: user.id } }),
    prisma.workoutTable.count({ where: { ownerUserId: user.id } }),
    prisma.workoutSession.count({ where: { userId: user.id } }),
    prisma.workoutSession.count({ where: { userId: user.id, status: "rest" } }),
    prisma.workoutSessionRow.count({ where: { workoutSession: { userId: user.id } } }),
    prisma.performedSet.count({ where: { workoutSessionRow: { workoutSession: { userId: user.id } } } }),
  ]);
  console.log(`\nDB now contains (for ${user.email}):`);
  console.log(`  users (total):        ${users}`);
  console.log(`  exercises:            ${exercises}`);
  console.log(`  workout tables:       ${tablesCount}`);
  console.log(`  workout sessions:     ${sessions}  (of which rest days: ${restDays})`);
  console.log(`  session rows:         ${rows}`);
  console.log(`  performed sets:       ${sets}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
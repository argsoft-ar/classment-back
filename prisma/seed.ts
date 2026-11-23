// Safety guard: this seed wipes every table. It must run before any other import has side effects.
if (process.env["NODE_ENV"] === "production" && process.env["ALLOW_DEMO_SEED"] !== "true") {
  console.error(
    "Refusing to run the demo seed with NODE_ENV=production (it deletes all data). " +
      "Set ALLOW_DEMO_SEED=true to override.",
  );
  process.exit(1);
}

import {
  AcademicStatus,
  CorrelativeScope,
  PrismaClient,
  RecordOrigin,
  RequiredStatus,
} from "@prisma/client";
import { hashPassword } from "../src/utils/hash.utils";

const prisma = new PrismaClient();

// Demo-only credentials (documented in README). Never use in production.
const DEMO_PASSWORDS = {
  superAdmin: "SuperAdmin123!",
  directivo: "Directivo123!",
  docente: "Docente123!",
  alumno: "Alumno123!",
} as const;

const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const currentYear = now.getFullYear();
const daysFromNow = (days: number): Date => new Date(now.getTime() + days * DAY);

// ── Curriculum ───────────────────────────────────────────────────────────────

const CAREER = {
  name: "Tecnicatura Superior en Análisis de Sistemas",
  durationYears: 3,
};

const SUBJECTS = {
  MAT1: { name: "Matemática I", yearLevel: 1 },
  PROG1: { name: "Programación I", yearLevel: 1 },
  SYO: { name: "Sistemas y Organizaciones", yearLevel: 1 },
  ING1: { name: "Inglés Técnico I", yearLevel: 1 },
  ARQ: { name: "Arquitectura de Computadoras", yearLevel: 1 },

  MAT2: { name: "Matemática II", yearLevel: 2 },
  PROG2: { name: "Programación II", yearLevel: 2 },
  BD1: { name: "Base de Datos I", yearLevel: 2 },
  AS1: { name: "Análisis de Sistemas I", yearLevel: 2 },
  ING2: { name: "Inglés Técnico II", yearLevel: 2 },

  PROG3: { name: "Programación III", yearLevel: 3 },
  BD2: { name: "Base de Datos II", yearLevel: 3 },
  ISW: { name: "Ingeniería de Software", yearLevel: 3 },
  PP: { name: "Práctica Profesional", yearLevel: 3 },
  ETICA: { name: "Ética y Legislación Informática", yearLevel: 3 },
} satisfies Record<string, { name: string; yearLevel: number }>;
type SubjectKey = keyof typeof SUBJECTS;

const { CURSADA, FINAL } = CorrelativeScope;
const { REGULARIZADA, APROBADA } = RequiredStatus;

// [subject, required, appliesTo, requiredStatus]
const CORRELATIVES: [SubjectKey, SubjectKey, CorrelativeScope, RequiredStatus][] = [
  // Demo script: "B requires A REGULARIZADA" / "C requires A APROBADA and B REGULARIZADA".
  ["PROG2", "PROG1", CURSADA, REGULARIZADA],
  ["PROG3", "PROG1", CURSADA, APROBADA],
  ["PROG3", "PROG2", CURSADA, REGULARIZADA],

  ["MAT2", "MAT1", CURSADA, REGULARIZADA],
  ["BD1", "PROG1", CURSADA, REGULARIZADA],
  ["AS1", "SYO", CURSADA, REGULARIZADA],
  ["ING2", "ING1", CURSADA, REGULARIZADA],
  ["BD2", "BD1", CURSADA, REGULARIZADA],
  ["ISW", "AS1", CURSADA, APROBADA],
  ["PP", "PROG2", CURSADA, REGULARIZADA],
  ["PP", "BD1", CURSADA, REGULARIZADA],
  ["PP", "AS1", CURSADA, REGULARIZADA],

  // To sit a final, the previous subject must be APROBADA.
  ["PROG2", "PROG1", FINAL, APROBADA],
  ["MAT2", "MAT1", FINAL, APROBADA],
  ["BD1", "PROG1", FINAL, APROBADA],
  ["ING2", "ING1", FINAL, APROBADA],
  ["PROG3", "PROG2", FINAL, APROBADA],
];

// ── Students' history ────────────────────────────────────────────────────────

interface HistoryEntry {
  status: AcademicStatus;
  origin: RecordOrigin;
  finalGrade?: number;
  yearsAgo: number;
}

const h = (
  status: AcademicStatus,
  origin: RecordOrigin,
  yearsAgo: number,
  finalGrade?: number,
): HistoryEntry => ({ status, origin, yearsAgo, finalGrade });

const STUDENTS: {
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  cohortYear: number;
  history: Partial<Record<SubjectKey, HistoryEntry>>;
}[] = [
  {
    // Main demo student (2nd year): Programación II enrollable, Programación III rejected (2 reasons).
    email: "alumno1@classment.demo",
    dni: "40111222",
    firstName: "Lucía",
    lastName: "Fernández",
    cohortYear: currentYear - 1,
    history: {
      MAT1: h("APROBADA", "FINAL", 1, 8),
      PROG1: h("REGULARIZADA", "CURSADA", 1),
      SYO: h("APROBADA", "EQUIVALENCIA", 1),
      ING1: h("APROBADA", "FINAL", 1, 7),
      ARQ: h("REGULARIZADA", "CURSADA", 1),
    },
  },
  {
    // Freshman currently taking 1st-year subjects.
    email: "alumno2@classment.demo",
    dni: "41222333",
    firstName: "Martín",
    lastName: "Gómez",
    cohortYear: currentYear,
    history: {
      MAT1: h("CURSANDO", "CURSADA", 0),
      PROG1: h("CURSANDO", "CURSADA", 0),
      SYO: h("CURSANDO", "CURSADA", 0),
      ING1: h("CURSANDO", "CURSADA", 0),
      ARQ: h("CURSANDO", "CURSADA", 0),
    },
  },
  {
    // Advanced student (3rd year) with initial load from paper records.
    email: "alumno3@classment.demo",
    dni: "39333444",
    firstName: "Sofía",
    lastName: "Ramírez",
    cohortYear: currentYear - 2,
    history: {
      MAT1: h("APROBADA", "CARGA_INICIAL", 2, 9),
      PROG1: h("APROBADA", "CARGA_INICIAL", 2, 8),
      SYO: h("APROBADA", "CARGA_INICIAL", 2, 7),
      ING1: h("APROBADA", "EQUIVALENCIA", 2),
      ARQ: h("APROBADA", "CARGA_INICIAL", 2, 6),
      MAT2: h("DESAPROBADA", "CURSADA", 1),
      PROG2: h("APROBADA", "FINAL", 1, 9),
      BD1: h("REGULARIZADA", "CURSADA", 1),
      AS1: h("APROBADA", "FINAL", 1, 8),
      ING2: h("REGULARIZADA", "CURSADA", 1),
    },
  },
];

async function clearDatabase(): Promise<void> {
  // FK order: children first.
  await prisma.enrollment.deleteMany();
  await prisma.offering.deleteMany();
  await prisma.enrollmentPeriod.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.studentCareer.deleteMany();
  await prisma.correlativeRule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.career.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
}

async function main(): Promise<void> {
  console.log("🌱 Seeding Classment (terciario, Fase 0)...");
  await clearDatabase();

  await prisma.institution.create({
    data: {
      name: "Instituto Superior de Formación Técnica Classment (Demo)",
      cue: "9999999-00",
      address: "Av. Demo 1234, Ciudad Demo",
      levelType: "TERTIARY",
      allowsPromotion: false,
      passingGrade: 4,
      promotionGrade: null,
      validateFinalCorrelatives: true,
    },
  });

  const [superAdminHash, directivoHash, docenteHash, alumnoHash] = await Promise.all([
    hashPassword(DEMO_PASSWORDS.superAdmin),
    hashPassword(DEMO_PASSWORDS.directivo),
    hashPassword(DEMO_PASSWORDS.docente),
    hashPassword(DEMO_PASSWORDS.alumno),
  ]);

  await prisma.user.create({
    data: {
      email: "superadmin@classment.demo",
      dni: "20000001",
      firstName: "Admin",
      lastName: "Plataforma",
      role: "SuperAdmin",
      status: "ACTIVE",
      password: superAdminHash,
    },
  });
  await prisma.user.create({
    data: {
      email: "directivo@classment.demo",
      dni: "25000001",
      firstName: "Nicolás",
      lastName: "Director",
      role: "Directivo",
      status: "ACTIVE",
      password: directivoHash,
    },
  });
  const docente1 = await prisma.user.create({
    data: {
      email: "docente1@classment.demo",
      dni: "28000001",
      firstName: "Laura",
      lastName: "Méndez",
      role: "Docente",
      status: "ACTIVE",
      password: docenteHash,
    },
  });
  const docente2 = await prisma.user.create({
    data: {
      email: "docente2@classment.demo",
      dni: "28000002",
      firstName: "Jorge",
      lastName: "Paredes",
      role: "Docente",
      status: "ACTIVE",
      password: docenteHash,
    },
  });

  const career = await prisma.career.create({
    data: {
      ...CAREER,
      studyPlans: { create: { code: `PLAN-${currentYear - 2}`, year: currentYear - 2 } },
    },
    include: { studyPlans: true },
  });
  const studyPlan = career.studyPlans[0];
  if (!studyPlan) throw new Error("Study plan not created");

  const subjectIds = {} as Record<SubjectKey, string>;
  for (const [key, s] of Object.entries(SUBJECTS)) {
    const subject = await prisma.subject.create({
      data: { studyPlanId: studyPlan.id, name: s.name, yearLevel: s.yearLevel },
    });
    subjectIds[key as SubjectKey] = subject.id;
  }

  await prisma.correlativeRule.createMany({
    data: CORRELATIVES.map(([subject, required, appliesTo, requiredStatus]) => ({
      subjectId: subjectIds[subject],
      requiredSubjectId: subjectIds[required],
      appliesTo,
      requiredStatus,
    })),
  });

  const studentIds: string[] = [];
  for (const s of STUDENTS) {
    const student = await prisma.user.create({
      data: {
        email: s.email,
        dni: s.dni,
        firstName: s.firstName,
        lastName: s.lastName,
        role: "Alumno",
        status: "ACTIVE",
        password: alumnoHash,
        studentCareers: { create: { studyPlanId: studyPlan.id, cohortYear: s.cohortYear } },
      },
    });
    studentIds.push(student.id);

    const records = Object.entries(s.history).map(([key, entry]) => {
      const when = new Date(currentYear - entry.yearsAgo, 11, 1);
      const regularized =
        entry.status === "REGULARIZADA" ||
        (entry.status === "APROBADA" && entry.origin !== "EQUIVALENCIA");
      return {
        studentId: student.id,
        subjectId: subjectIds[key as SubjectKey],
        status: entry.status,
        origin: entry.origin,
        finalGrade: entry.finalGrade ?? null,
        regularizedAt: regularized ? when : null,
        approvedAt: entry.status === "APROBADA" ? new Date(currentYear - entry.yearsAgo, 11, 15) : null,
      };
    });
    await prisma.academicRecord.createMany({ data: records });
  }

  // ── Open periods ───────────────────────────────────────────────────────────
  // Relative dates keep the demo periods open whenever the seed is run.

  const cursada = await prisma.enrollmentPeriod.create({
    data: {
      type: "CURSADA",
      name: `Inscripción a Cursadas ${currentYear + 1}`,
      academicYear: currentYear + 1,
      callNumber: null,
      startsAt: daysFromNow(-7),
      endsAt: daysFromNow(60),
      isActive: true,
    },
  });

  const cursadaOfferings: [SubjectKey, string][] = [
    ["MAT1", docente1.id],
    ["PROG1", docente2.id],
    ["MAT2", docente1.id],
    ["PROG2", docente2.id],
    ["BD1", docente2.id],
    ["AS1", docente1.id],
    ["ING2", docente1.id],
    ["PROG3", docente2.id],
    ["BD2", docente2.id],
    ["ISW", docente1.id],
  ];
  await prisma.offering.createMany({
    data: cursadaOfferings.map(([key, teacherId]) => ({
      periodId: cursada.id,
      subjectId: subjectIds[key],
      teacherId,
    })),
  });

  const finals = await prisma.enrollmentPeriod.create({
    data: {
      type: "FINAL",
      name: `Turno Diciembre ${currentYear} — 1° Llamado`,
      academicYear: currentYear,
      callNumber: 1,
      startsAt: daysFromNow(-3),
      endsAt: daysFromNow(21),
      isActive: true,
    },
  });

  const finalOfferings: [SubjectKey, string, number][] = [
    ["PROG1", docente2.id, 25],
    ["ARQ", docente1.id, 26],
    ["MAT2", docente1.id, 27],
    ["ING2", docente1.id, 28],
    ["PROG2", docente2.id, 29],
    ["BD1", docente2.id, 30],
  ];
  await prisma.offering.createMany({
    data: finalOfferings.map(([key, teacherId, offsetDays]) => {
      const examDate = daysFromNow(offsetDays);
      examDate.setHours(18, 0, 0, 0);
      return { periodId: finals.id, subjectId: subjectIds[key], teacherId, examDate };
    }),
  });

  console.log("✅ Seed completed");
  console.log(`   Career: ${career.name} (${Object.keys(SUBJECTS).length} subjects)`);
  console.log(`   Students: ${studentIds.length} · Correlatives: ${CORRELATIVES.length}`);
  console.log(`   Periods: "${cursada.name}", "${finals.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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
  name: "Profesorado de Educación Física",
  durationYears: 4,
};

const SUBJECTS = {
  // 1° Año
  TLEO: { name: "Taller de Lectura, Escritura, Oralidad y Educación Corporal", yearLevel: 1 },
  PSICO1: { name: "Psicología del Desarrollo I", yearLevel: 1 },
  FILO: { name: "Filosofía", yearLevel: 1 },
  PEDAG: { name: "Pedagogía", yearLevel: 1 },
  DIDGEN: { name: "Didáctica General", yearLevel: 1 },
  ANAT: { name: "Anatomía Funcional", yearLevel: 1 },
  HISTEF: { name: "Historia de la Educación Física", yearLevel: 1 },
  DPGAL: { name: "Didáctica de las Prácticas Gimnásticas, Acuáticas y Lúdicas", yearLevel: 1 },
  PD1: { name: "Campo de la Práctica Docente I", yearLevel: 1 },

  // 2° Año
  PSICO2: { name: "Psicología del Desarrollo y del Aprendizaje II", yearLevel: 2 },
  TSOC: { name: "Teorías Sociopolíticas y Educación", yearLevel: 2 },
  DIDIP: { name: "Didáctica y Currículum para Nivel Inicial y Primario", yearLevel: 2 },
  DREC: { name: "Didáctica de la Recreación", yearLevel: 2 },
  DPGD: { name: "Didáctica de las Prácticas Gimnásticas y Deportivas", yearLevel: 2 },
  PD2: { name: "Campo de la Práctica Docente II", yearLevel: 2 },

  // 3° Año
  CCSE: { name: "Configuraciones Culturales del Sujeto Educativo", yearLevel: 3 },
  METOD: { name: "Metodología de la Investigación", yearLevel: 3 },
  AAM: { name: "Análisis de Acciones Motrices", yearLevel: 3 },
  DIDSEC: { name: "Didáctica para Nivel Secundario", yearLevel: 3 },
  HPLE: { name: "Historia, Política y Legislación Educativa", yearLevel: 3 },
  PD3: { name: "Campo de la Práctica Docente III", yearLevel: 3 },

  // 4° Año
  RFILO: { name: "Reflexión Filosófica", yearLevel: 4 },
  DEP: { name: "Dimensión Ético-Política de la Praxis Docente", yearLevel: 4 },
  PCDI: { name: "Pedagogía Crítica de las Diferencias", yearLevel: 4 },
  ASC: { name: "Antropología y Sociología del Cuerpo", yearLevel: 4 },
  DENT: { name: "Didáctica del Entrenamiento", yearLevel: 4 },
  PD4: { name: "Campo de la Práctica Docente IV", yearLevel: 4 },
} satisfies Record<string, { name: string; yearLevel: number }>;
type SubjectKey = keyof typeof SUBJECTS;

const { CURSADA, FINAL } = CorrelativeScope;
const { REGULARIZADA, APROBADA } = RequiredStatus;

// [subject, required, appliesTo, requiredStatus]
const CORRELATIVES: [SubjectKey, SubjectKey, CorrelativeScope, RequiredStatus][] = [
  // Para cursar (CURSADA)
  ["PSICO2", "PSICO1", CURSADA, REGULARIZADA],
  ["TSOC", "PEDAG", CURSADA, REGULARIZADA],
  ["DIDIP", "DIDGEN", CURSADA, REGULARIZADA],
  ["DREC", "DPGAL", CURSADA, REGULARIZADA],
  ["DPGD", "DPGAL", CURSADA, REGULARIZADA],
  ["PD2", "PD1", CURSADA, REGULARIZADA],
  ["CCSE", "PSICO2", CURSADA, REGULARIZADA],
  ["METOD", "TLEO", CURSADA, APROBADA],
  ["AAM", "ANAT", CURSADA, APROBADA],
  ["DIDSEC", "DIDGEN", CURSADA, APROBADA],
  ["DIDSEC", "DIDIP", CURSADA, REGULARIZADA],
  ["HPLE", "HISTEF", CURSADA, APROBADA],
  ["HPLE", "TSOC", CURSADA, REGULARIZADA],
  ["PD3", "PD1", CURSADA, APROBADA],
  ["PD3", "PD2", CURSADA, REGULARIZADA],
  ["RFILO", "FILO", CURSADA, APROBADA],
  ["DEP", "HPLE", CURSADA, REGULARIZADA],
  ["PCDI", "PEDAG", CURSADA, APROBADA],
  ["PCDI", "CCSE", CURSADA, REGULARIZADA],
  ["ASC", "TSOC", CURSADA, APROBADA],
  ["DENT", "ANAT", CURSADA, APROBADA],
  ["DENT", "AAM", CURSADA, REGULARIZADA],
  ["PD4", "PD2", CURSADA, APROBADA],
  ["PD4", "PD3", CURSADA, REGULARIZADA],

  // Para rendir final (FINAL)
  ["PSICO2", "PSICO1", FINAL, APROBADA],
  ["TSOC", "PEDAG", FINAL, APROBADA],
  ["DIDIP", "DIDGEN", FINAL, APROBADA],
  ["DREC", "DPGAL", FINAL, APROBADA],
  ["DPGD", "DPGAL", FINAL, APROBADA],
  ["PD2", "PD1", FINAL, APROBADA],
  ["CCSE", "PSICO2", FINAL, APROBADA],
  ["AAM", "ANAT", FINAL, APROBADA],
  ["DIDSEC", "DIDIP", FINAL, APROBADA],
  ["HPLE", "TSOC", FINAL, APROBADA],
  ["PD3", "PD2", FINAL, APROBADA],
  ["DENT", "AAM", FINAL, APROBADA],
  ["PD4", "PD3", FINAL, APROBADA],
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
    // Alumna principal de la demo (2° año): todo 2° año habilitado; 3° y 4° bloqueados con 1-2 motivos claros.
    email: "alumno1@classment.demo",
    dni: "40111222",
    firstName: "Lucía",
    lastName: "Fernández",
    cohortYear: currentYear - 1,
    history: {
      TLEO: h("APROBADA", "FINAL", 1, 8),
      PSICO1: h("APROBADA", "FINAL", 1, 9),
      FILO: h("APROBADA", "EQUIVALENCIA", 1),
      PEDAG: h("APROBADA", "FINAL", 1, 7),
      HISTEF: h("APROBADA", "FINAL", 1, 8),
      DIDGEN: h("REGULARIZADA", "CURSADA", 1),
      ANAT: h("REGULARIZADA", "CURSADA", 1),
      DPGAL: h("REGULARIZADA", "CURSADA", 1),
      PD1: h("REGULARIZADA", "CURSADA", 1),
    },
  },
  {
    // Ingresante cursando 1° año.
    email: "alumno2@classment.demo",
    dni: "41222333",
    firstName: "Martín",
    lastName: "Gómez",
    cohortYear: currentYear,
    history: {
      TLEO: h("CURSANDO", "CURSADA", 0),
      PSICO1: h("CURSANDO", "CURSADA", 0),
      FILO: h("CURSANDO", "CURSADA", 0),
      PEDAG: h("CURSANDO", "CURSADA", 0),
      DIDGEN: h("CURSANDO", "CURSADA", 0),
      ANAT: h("CURSANDO", "CURSADA", 0),
      HISTEF: h("CURSANDO", "CURSADA", 0),
      DPGAL: h("CURSANDO", "CURSADA", 0),
      PD1: h("CURSANDO", "CURSADA", 0),
    },
  },
  {
    // Alumna de 3° año con carga inicial e historial mixto (incluye materia para recursar).
    email: "alumno3@classment.demo",
    dni: "39333444",
    firstName: "Sofía",
    lastName: "Ramírez",
    cohortYear: currentYear - 2,
    history: {
      TLEO: h("APROBADA", "CARGA_INICIAL", 2, 8),
      PSICO1: h("APROBADA", "CARGA_INICIAL", 2, 9),
      FILO: h("APROBADA", "EQUIVALENCIA", 2),
      PEDAG: h("APROBADA", "CARGA_INICIAL", 2, 7),
      DIDGEN: h("APROBADA", "CARGA_INICIAL", 2, 8),
      ANAT: h("APROBADA", "CARGA_INICIAL", 2, 7),
      HISTEF: h("APROBADA", "CARGA_INICIAL", 2, 9),
      DPGAL: h("APROBADA", "CARGA_INICIAL", 2, 8),
      PD1: h("APROBADA", "CARGA_INICIAL", 2, 8),
      PSICO2: h("APROBADA", "FINAL", 1, 9),
      TSOC: h("APROBADA", "FINAL", 1, 8),
      DPGD: h("APROBADA", "FINAL", 1, 7),
      DIDIP: h("REGULARIZADA", "CURSADA", 1),
      PD2: h("REGULARIZADA", "CURSADA", 1),
      DREC: h("DESAPROBADA", "CURSADA", 1),
    },
  },
  {
    // Alumno avanzado de 4° año.
    email: "alumno4@classment.demo",
    dni: "38444555",
    firstName: "Mateo",
    lastName: "Quiroga",
    cohortYear: currentYear - 3,
    history: {
      TLEO: h("APROBADA", "CARGA_INICIAL", 3, 8),
      PSICO1: h("APROBADA", "CARGA_INICIAL", 3, 8),
      FILO: h("APROBADA", "CARGA_INICIAL", 3, 7),
      PEDAG: h("APROBADA", "CARGA_INICIAL", 3, 8),
      DIDGEN: h("APROBADA", "CARGA_INICIAL", 3, 9),
      ANAT: h("APROBADA", "CARGA_INICIAL", 3, 7),
      HISTEF: h("APROBADA", "CARGA_INICIAL", 3, 8),
      DPGAL: h("APROBADA", "CARGA_INICIAL", 3, 9),
      PD1: h("APROBADA", "CARGA_INICIAL", 3, 8),
      PSICO2: h("APROBADA", "FINAL", 2, 8),
      TSOC: h("APROBADA", "FINAL", 2, 7),
      DIDIP: h("APROBADA", "FINAL", 2, 8),
      DREC: h("APROBADA", "FINAL", 2, 9),
      DPGD: h("APROBADA", "FINAL", 2, 8),
      PD2: h("APROBADA", "FINAL", 2, 9),
      CCSE: h("APROBADA", "FINAL", 1, 8),
      METOD: h("APROBADA", "FINAL", 1, 9),
      DIDSEC: h("APROBADA", "FINAL", 1, 8),
      AAM: h("REGULARIZADA", "CURSADA", 1),
      HPLE: h("REGULARIZADA", "CURSADA", 1),
      PD3: h("REGULARIZADA", "CURSADA", 1),
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
  console.log("🌱 Seeding Classment (Profesorado de Educación Física, Fase 0)...");
  await clearDatabase();

  await prisma.institution.create({
    data: {
      name: "Instituto Superior de Formación Docente — Educación Física (Demo)",
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
  const docente3 = await prisma.user.create({
    data: {
      email: "docente3@classment.demo",
      dni: "28000003",
      firstName: "Diego",
      lastName: "Morales",
      role: "Docente",
      status: "ACTIVE",
      password: docenteHash,
    },
  });

  const career = await prisma.career.create({
    data: {
      ...CAREER,
      studyPlans: { create: { code: "RES-2432/09", year: currentYear - 3 } },
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
    // 1° Año
    ["DIDGEN", docente1.id],
    ["ANAT", docente3.id],
    ["PEDAG", docente1.id],
    ["FILO", docente1.id],
    // 2° Año
    ["PSICO2", docente1.id],
    ["TSOC", docente1.id],
    ["DIDIP", docente2.id],
    ["DREC", docente2.id],
    ["DPGD", docente2.id],
    ["PD2", docente2.id],
    // 3° Año
    ["CCSE", docente1.id],
    ["METOD", docente1.id],
    ["AAM", docente3.id],
    ["DIDSEC", docente2.id],
    ["HPLE", docente1.id],
    ["PD3", docente2.id],
    // 4° Año
    ["RFILO", docente1.id],
    ["DEP", docente1.id],
    ["PCDI", docente1.id],
    ["ASC", docente3.id],
    ["DENT", docente3.id],
    ["PD4", docente2.id],
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
    ["DIDGEN", docente1.id, 25],
    ["ANAT", docente3.id, 26],
    ["DPGAL", docente2.id, 27],
    ["PD1", docente2.id, 28],
    ["PSICO2", docente1.id, 29],
    ["DIDIP", docente2.id, 30],
    ["DPGD", docente2.id, 31],
    ["AAM", docente3.id, 32],
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

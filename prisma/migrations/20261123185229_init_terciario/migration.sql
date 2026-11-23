-- CreateEnum
CREATE TYPE "LevelType" AS ENUM ('TERTIARY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SuperAdmin', 'Directivo', 'Docente', 'Alumno');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubjectRegime" AS ENUM ('ANNUAL');

-- CreateEnum
CREATE TYPE "CorrelativeScope" AS ENUM ('CURSADA', 'FINAL');

-- CreateEnum
CREATE TYPE "RequiredStatus" AS ENUM ('REGULARIZADA', 'APROBADA');

-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('CURSANDO', 'REGULARIZADA', 'APROBADA', 'DESAPROBADA', 'LIBRE');

-- CreateEnum
CREATE TYPE "RecordOrigin" AS ENUM ('CURSADA', 'FINAL', 'EQUIVALENCIA', 'CARGA_INICIAL');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('CURSADA', 'FINAL');

-- CreateEnum
CREATE TYPE "EnrollmentModality" AS ENUM ('REGULAR', 'LIBRE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVA', 'BAJA', 'CERRADA');

-- CreateEnum
CREATE TYPE "EnrollmentResult" AS ENUM ('REGULARIZADA', 'APROBADA', 'DESAPROBADA', 'AUSENTE');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cue" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "levelType" "LevelType" NOT NULL DEFAULT 'TERTIARY',
    "allowsPromotion" BOOLEAN NOT NULL DEFAULT false,
    "passingGrade" INTEGER NOT NULL DEFAULT 4,
    "promotionGrade" INTEGER,
    "validateFinalCorrelatives" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "dni" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "regime" "SubjectRegime" NOT NULL DEFAULT 'ANNUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrelativeRule" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "requiredSubjectId" TEXT NOT NULL,
    "appliesTo" "CorrelativeScope" NOT NULL,
    "requiredStatus" "RequiredStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrelativeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCareer" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "cohortYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "status" "AcademicStatus" NOT NULL,
    "origin" "RecordOrigin" NOT NULL,
    "finalGrade" DECIMAL(4,2),
    "regularizedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentPeriod" (
    "id" TEXT NOT NULL,
    "type" "PeriodType" NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "callNumber" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "examDate" TIMESTAMP(3),
    "maxCapacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "modality" "EnrollmentModality" NOT NULL DEFAULT 'REGULAR',
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVA',
    "grade" DECIMAL(4,2),
    "result" "EnrollmentResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_cue_key" ON "Institution"("cue");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlan_careerId_code_key" ON "StudyPlan"("careerId", "code");

-- CreateIndex
CREATE INDEX "Subject_studyPlanId_yearLevel_idx" ON "Subject"("studyPlanId", "yearLevel");

-- CreateIndex
CREATE UNIQUE INDEX "CorrelativeRule_subjectId_requiredSubjectId_appliesTo_key" ON "CorrelativeRule"("subjectId", "requiredSubjectId", "appliesTo");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCareer_studentId_studyPlanId_key" ON "StudentCareer"("studentId", "studyPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicRecord_studentId_subjectId_key" ON "AcademicRecord"("studentId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Offering_periodId_subjectId_key" ON "Offering"("periodId", "subjectId");

-- CreateIndex
CREATE INDEX "Enrollment_offeringId_studentId_idx" ON "Enrollment"("offeringId", "studentId");

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelativeRule" ADD CONSTRAINT "CorrelativeRule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelativeRule" ADD CONSTRAINT "CorrelativeRule_requiredSubjectId_fkey" FOREIGN KEY ("requiredSubjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCareer" ADD CONSTRAINT "StudentCareer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCareer" ADD CONSTRAINT "StudentCareer_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "EnrollmentPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

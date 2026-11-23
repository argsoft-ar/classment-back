-- Hand-written integrity constraints not expressible in schema.prisma.

-- A subject cannot be its own correlative.
ALTER TABLE "CorrelativeRule"
  ADD CONSTRAINT "CorrelativeRule_no_self_reference_check"
  CHECK ("subjectId" <> "requiredSubjectId");

-- Only one ACTIVA enrollment per (offering, student); re-enrolling after a BAJA is allowed.
CREATE UNIQUE INDEX "Enrollment_offeringId_studentId_active_key"
  ON "Enrollment" ("offeringId", "studentId")
  WHERE "status" = 'ACTIVA';
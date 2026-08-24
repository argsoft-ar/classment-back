import { PrismaClient, RoleLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ACADEMIC_YEAR = 2026;
const SALT_ROUNDS = 10;

// ── Student data ─────────────────────────────────────────────────────────────

const studentData = [
  { firstName: "Valentina", lastName: "Rodríguez", dni: "45000001" },
  { firstName: "Tomás", lastName: "González", dni: "45000002" },
  { firstName: "Lucía", lastName: "Martínez", dni: "45000003" },
  { firstName: "Mateo", lastName: "López", dni: "45000004" },
  { firstName: "Camila", lastName: "García", dni: "45000005" },
  { firstName: "Santiago", lastName: "Fernández", dni: "45000006" },
  { firstName: "Sofía", lastName: "Torres", dni: "45000007" },
  { firstName: "Benjamín", lastName: "Díaz", dni: "45000008" },
  { firstName: "Martina", lastName: "Sánchez", dni: "45000009" },
  { firstName: "Nicolás", lastName: "Pérez", dni: "45000010" },
  { firstName: "Juliana", lastName: "Romero", dni: "45000011" },
  { firstName: "Ignacio", lastName: "Herrera", dni: "45000012" },
  { firstName: "Agustina", lastName: "Medina", dni: "45000013" },
  { firstName: "Felipe", lastName: "Acosta", dni: "45000014" },
  { firstName: "Florencia", lastName: "Vargas", dni: "45000015" },
  { firstName: "Joaquín", lastName: "Castro", dni: "45000016" },
  { firstName: "Isabella", lastName: "Guzmán", dni: "45000017" },
  { firstName: "Emilio", lastName: "Morales", dni: "45000018" },
  { firstName: "Renata", lastName: "Ortiz", dni: "45000019" },
  { firstName: "Facundo", lastName: "Delgado", dni: "45000020" },
  { firstName: "Amparo", lastName: "Navarro", dni: "45000021" },
  { firstName: "Rodrigo", lastName: "Reyes", dni: "45000022" },
  { firstName: "Mora", lastName: "Jiménez", dni: "45000023" },
  { firstName: "Sebastián", lastName: "Álvarez", dni: "45000024" },
  { firstName: "Milagros", lastName: "Flores", dni: "45000025" },
  { firstName: "Axel", lastName: "Ríos", dni: "45000026" },
  { firstName: "Bianca", lastName: "Vega", dni: "45000027" },
  { firstName: "Lautaro", lastName: "Méndez", dni: "45000028" },
  { firstName: "Pilar", lastName: "Salinas", dni: "45000029" },
  { firstName: "Marcos", lastName: "Ramos", dni: "45000030" },
  { firstName: "Aldana", lastName: "Núñez", dni: "45000031" },
  { firstName: "Ezequiel", lastName: "Molina", dni: "45000032" },
  { firstName: "Celeste", lastName: "Moreno", dni: "45000033" },
  { firstName: "Thiago", lastName: "Ruiz", dni: "45000034" },
  { firstName: "Dana", lastName: "Guerrero", dni: "45000035" },
  { firstName: "Bruno", lastName: "Muñoz", dni: "45000036" },
  { firstName: "Zoe", lastName: "Alonso", dni: "45000037" },
  { firstName: "Mauro", lastName: "Palacios", dni: "45000038" },
  { firstName: "Nadia", lastName: "Vera", dni: "45000039" },
  { firstName: "Dylan", lastName: "Cruz", dni: "45000040" },
  { firstName: "Catalina", lastName: "Mendoza", dni: "45000041" },
  { firstName: "Agustín", lastName: "Santos", dni: "45000042" },
  { firstName: "Brenda", lastName: "Vásquez", dni: "45000043" },
  { firstName: "Leandro", lastName: "Rojas", dni: "45000044" },
  { firstName: "Daniela", lastName: "Contreras", dni: "45000045" },
  { firstName: "Franco", lastName: "Sierra", dni: "45000046" },
  { firstName: "Luciana", lastName: "Figueroa", dni: "45000047" },
  { firstName: "Gonzalo", lastName: "Espinoza", dni: "45000048" },
  { firstName: "Rocío", lastName: "Fuentes", dni: "45000049" },
  { firstName: "Maximiliano", lastName: "Carrillo", dni: "45000050" },
  { firstName: "Julieta", lastName: "Avila", dni: "45000051" },
  { firstName: "Pablo", lastName: "León", dni: "45000052" },
  { firstName: "Constanza", lastName: "Ibáñez", dni: "45000053" },
  { firstName: "Mariano", lastName: "Serrano", dni: "45000054" },
  { firstName: "Ailin", lastName: "Maldonado", dni: "45000055" },
  { firstName: "Cristian", lastName: "Vidal", dni: "45000056" },
  { firstName: "Yamila", lastName: "Castillo", dni: "45000057" },
  { firstName: "Ramiro", lastName: "Mora", dni: "45000058" },
  { firstName: "Valentín", lastName: "Silva", dni: "45000059" },
  { firstName: "Antonella", lastName: "Bravo", dni: "45000060" },
  { firstName: "Nahuel", lastName: "Aguilar", dni: "45000061" },
  { firstName: "Natalía", lastName: "Ponce", dni: "45000062" },
  { firstName: "Patricio", lastName: "Crespo", dni: "45000063" },
  { firstName: "Micaela", lastName: "Montoya", dni: "45000064" },
  { firstName: "Lisandro", lastName: "Arias", dni: "45000065" },
  { firstName: "Ayelén", lastName: "Villanueva", dni: "45000066" },
  { firstName: "Esteban", lastName: "Heredia", dni: "45000067" },
  { firstName: "Sabrina", lastName: "Cabrera", dni: "45000068" },
  { firstName: "Iván", lastName: "Cortez", dni: "45000069" },
  { firstName: "Carolina", lastName: "Suárez", dni: "45000070" },
  { firstName: "Alexis", lastName: "Campos", dni: "45000071" },
  { firstName: "Estefanía", lastName: "Pizarro", dni: "45000072" },
  { firstName: "Darío", lastName: "Sandoval", dni: "45000073" },
  { firstName: "Paola", lastName: "Miranda", dni: "45000074" },
  { firstName: "Walter", lastName: "Cáceres", dni: "45000075" },
  { firstName: "Gisela", lastName: "Paredes", dni: "45000076" },
  { firstName: "Hernán", lastName: "Benítez", dni: "45000077" },
  { firstName: "Érica", lastName: "Vaca", dni: "45000078" },
  { firstName: "Rodrigo", lastName: "Quintero", dni: "45000079" },
  { firstName: "Ivana", lastName: "Rivero", dni: "45000080" },
  { firstName: "Claudio", lastName: "Correa", dni: "45000081" },
  { firstName: "Selena", lastName: "Domínguez", dni: "45000082" },
  { firstName: "Gustavo", lastName: "Tapia", dni: "45000083" },
  { firstName: "Lorena", lastName: "Villalba", dni: "45000084" },
  { firstName: "Adrián", lastName: "Escobar", dni: "45000085" },
  { firstName: "Natalia", lastName: "Ocampo", dni: "45000086" },
  { firstName: "Ricardo", lastName: "Cabello", dni: "45000087" },
  { firstName: "Verónica", lastName: "Nava", dni: "45000088" },
  { firstName: "Juan Manuel", lastName: "Beltrán", dni: "45000089" },
  { firstName: "Gabriela", lastName: "Pedroza", dni: "45000090" },
  { firstName: "Fernando", lastName: "Estrada", dni: "45000091" },
  { firstName: "Mariela", lastName: "Leal", dni: "45000092" },
  { firstName: "Eduardo", lastName: "Chávez", dni: "45000093" },
  { firstName: "Patricia", lastName: "Andrade", dni: "45000094" },
  { firstName: "Roberto", lastName: "Enríquez", dni: "45000095" },
  { firstName: "Adriana", lastName: "Roca", dni: "45000096" },
  { firstName: "Miguel", lastName: "Cardenas", dni: "45000097" },
  { firstName: "Sandra", lastName: "Porras", dni: "45000098" },
  { firstName: "Jorge", lastName: "Valenzuela", dni: "45000099" },
  { firstName: "Elena", lastName: "Pascual", dni: "45000100" },
];

// courseKey → [start_index, end_index] inclusive, 0-based
const COURSE_DISTRIBUTION: Record<string, [number, number]> = {
  "1A": [0, 16],
  "2A": [17, 33],
  "3A": [34, 50],
  "4A": [51, 67],
  "5A": [68, 83],
  "6A": [84, 99],
};

const SUBJECTS_BY_YEAR: Record<
  number,
  { name: string; teacherEmail: string }[]
> = {
  1: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    {
      name: "Ciencias Naturales",
      teacherEmail: "prof.ciencias@escuela1.edu.ar",
    },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
  2: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    {
      name: "Ciencias Naturales",
      teacherEmail: "prof.ciencias@escuela1.edu.ar",
    },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
  3: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    { name: "Biología", teacherEmail: "prof.ciencias@escuela1.edu.ar" },
    { name: "Física", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
  4: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    { name: "Biología", teacherEmail: "prof.ciencias@escuela1.edu.ar" },
    { name: "Física", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
  5: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    { name: "Biología", teacherEmail: "prof.ciencias@escuela1.edu.ar" },
    { name: "Física", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    { name: "Química", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
  6: [
    { name: "Matemática", teacherEmail: "prof.matematica@escuela1.edu.ar" },
    {
      name: "Lengua y Literatura",
      teacherEmail: "prof.lengua@escuela1.edu.ar",
    },
    { name: "Historia", teacherEmail: "prof.historia@escuela1.edu.ar" },
    { name: "Geografía", teacherEmail: "prof.geografia@escuela1.edu.ar" },
    { name: "Biología", teacherEmail: "prof.ciencias@escuela1.edu.ar" },
    { name: "Física", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    { name: "Química", teacherEmail: "prof.fisica@escuela1.edu.ar" },
    {
      name: "Educación Física",
      teacherEmail: "prof.edufisica@escuela1.edu.ar",
    },
    { name: "Inglés", teacherEmail: "prof.ingles@escuela1.edu.ar" },
    {
      name: "Formación Ética y Ciudadana",
      teacherEmail: "prof.fec@escuela1.edu.ar",
    },
    { name: "Informática", teacherEmail: "prof.informatica@escuela1.edu.ar" },
  ],
};

async function main() {
  console.log("🌱 Starting seed...");

  // ── 1. Clean DB ─────────────────────────────────────────────────────────────
  console.log("🧹 Cleaning database...");
  await prisma.gradeModificationLog.deleteMany();
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.attendanceEntry.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.academicRecordPrevia.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.roleSubject.deleteMany();
  await prisma.roleCourse.deleteMany();
  await prisma.role.deleteMany();
  await prisma.courseStudent.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // ── 2. Institution ──────────────────────────────────────────────────────────
  console.log("🏫 Creating institution...");
  const institution = await prisma.institution.create({
    data: {
      name: 'Escuela Secundaria N° 1 "Ing. Carlos Casanova"',
      cue: "060001200",
      address: "Av. San Martín 1500, Buenos Aires",
      institutionType: "secondary",
      activeAcademicYear: ACADEMIC_YEAR,
      gradingPeriodOpen: true,
    },
  });

  // ── 3. Hash passwords ────────────────────────────────────────────────────────
  const [hashAdmin, hashPreceptor, hashDocente, hashAlumno] = await Promise.all(
    [
      bcrypt.hash("admin123", SALT_ROUNDS),
      bcrypt.hash("preceptor123", SALT_ROUNDS),
      bcrypt.hash("docente123", SALT_ROUNDS),
      bcrypt.hash("alumno123", SALT_ROUNDS),
    ],
  );

  // ── 4. Create staff ──────────────────────────────────────────────────────────
  console.log("👔 Creating staff...");

  const directivo = await prisma.user.create({
    data: {
      email: "directivo@escuela1.edu.ar",
      password: hashAdmin,
      dni: "20000001",
      firstName: "Carlos",
      lastName: "Rodríguez",
    },
  });

  const preceptorA = await prisma.user.create({
    data: {
      email: "preceptor.a@escuela1.edu.ar",
      password: hashPreceptor,
      dni: "20000002",
      firstName: "María",
      lastName: "Fernández",
    },
  });

  const preceptorB = await prisma.user.create({
    data: {
      email: "preceptor.b@escuela1.edu.ar",
      password: hashPreceptor,
      dni: "20000003",
      firstName: "Roberto",
      lastName: "Sánchez",
    },
  });

  const docenteDataList = [
    {
      email: "prof.matematica@escuela1.edu.ar",
      firstName: "Ana",
      lastName: "Martínez",
      dni: "20000010",
    },
    {
      email: "prof.lengua@escuela1.edu.ar",
      firstName: "Luis",
      lastName: "García",
      dni: "20000011",
    },
    {
      email: "prof.historia@escuela1.edu.ar",
      firstName: "Silvia",
      lastName: "López",
      dni: "20000012",
    },
    {
      email: "prof.geografia@escuela1.edu.ar",
      firstName: "Diego",
      lastName: "Torres",
      dni: "20000013",
    },
    {
      email: "prof.ciencias@escuela1.edu.ar",
      firstName: "Laura",
      lastName: "Gómez",
      dni: "20000014",
    },
    {
      email: "prof.fisica@escuela1.edu.ar",
      firstName: "Pablo",
      lastName: "Herrera",
      dni: "20000015",
    },
    {
      email: "prof.edufisica@escuela1.edu.ar",
      firstName: "Marcelo",
      lastName: "Vega",
      dni: "20000016",
    },
    {
      email: "prof.ingles@escuela1.edu.ar",
      firstName: "Claudia",
      lastName: "Ruiz",
      dni: "20000017",
    },
    {
      email: "prof.fec@escuela1.edu.ar",
      firstName: "Andrea",
      lastName: "Díaz",
      dni: "20000018",
    },
    {
      email: "prof.informatica@escuela1.edu.ar",
      firstName: "Sebastián",
      lastName: "Morales",
      dni: "20000019",
    },
  ];

  const docentes = await Promise.all(
    docenteDataList.map((d) =>
      prisma.user.create({
        data: { ...d, password: hashDocente },
      }),
    ),
  );

  const docenteByEmail = new Map(docentes.map((d) => [d.email, d]));

  // ── 5. Create students ───────────────────────────────────────────────────────
  console.log("🎒 Creating 100 students...");
  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.create({
        data: {
          email: `${s.dni}@alumnos.escuela1.edu.ar`,
          password: hashAlumno,
          dni: s.dni,
          firstName: s.firstName,
          lastName: s.lastName,
        },
      }),
    ),
  );

  // ── 6. Create courses ────────────────────────────────────────────────────────
  console.log("📚 Creating courses...");
  const courseDefinitions = [
    { key: "1A", name: "1° A", year: 1 },
    { key: "2A", name: "2° A", year: 2 },
    { key: "3A", name: "3° A", year: 3 },
    { key: "4A", name: "4° A", year: 4 },
    { key: "5A", name: "5° A", year: 5 },
    { key: "6A", name: "6° A", year: 6 },
  ];

  const courseMap = new Map<string, { id: string; year: number }>();
  for (const def of courseDefinitions) {
    const course = await prisma.course.create({
      data: {
        name: def.name,
        year: def.year,
        division: "A",
        academicYear: ACADEMIC_YEAR,
        institutionId: institution.id,
      },
    });
    courseMap.set(def.key, { id: course.id, year: def.year });
  }

  // ── 7. Enroll students in courses ────────────────────────────────────────────
  console.log("📋 Enrolling students in courses...");
  for (const [courseKey, [start, end]] of Object.entries(COURSE_DISTRIBUTION)) {
    const course = courseMap.get(courseKey)!;
    const slice = students.slice(start, end + 1);
    await prisma.courseStudent.createMany({
      data: slice.map((s) => ({ courseId: course.id, userId: s.id })),
    });
  }

  // ── 8. Create subjects ───────────────────────────────────────────────────────
  console.log("📖 Creating subjects...");
  const subjectsByTeacherEmail = new Map<string, { id: string }[]>();
  const subjectsByCourse = new Map<string, { id: string }[]>();

  for (const [courseKey, { id: courseId, year }] of courseMap.entries()) {
    const subjectDefs = SUBJECTS_BY_YEAR[year] ?? SUBJECTS_BY_YEAR[1];
    const createdSubjects: { id: string }[] = [];

    for (const def of subjectDefs) {
      const teacher = docenteByEmail.get(def.teacherEmail)!;
      const subject = await prisma.subject.create({
        data: {
          name: def.name,
          courseId,
          teacherId: teacher.id,
          institutionId: institution.id,
          academicYear: ACADEMIC_YEAR,
        },
      });
      createdSubjects.push({ id: subject.id });

      if (!subjectsByTeacherEmail.has(def.teacherEmail)) {
        subjectsByTeacherEmail.set(def.teacherEmail, []);
      }
      subjectsByTeacherEmail.get(def.teacherEmail)!.push({ id: subject.id });
    }

    subjectsByCourse.set(courseKey, createdSubjects);
  }

  // ── 9. Create Roles ──────────────────────────────────────────────────────────
  console.log("🔐 Creating roles...");

  await prisma.role.create({
    data: {
      userId: directivo.id,
      institutionId: institution.id,
      level: RoleLevel.Directivo,
    },
  });

  const rolePreceptorA = await prisma.role.create({
    data: {
      userId: preceptorA.id,
      institutionId: institution.id,
      level: RoleLevel.Preceptor,
    },
  });
  await prisma.roleCourse.createMany({
    data: ["1A", "2A", "3A"].map((key) => ({
      roleId: rolePreceptorA.id,
      courseId: courseMap.get(key)!.id,
    })),
  });

  const rolePreceptorB = await prisma.role.create({
    data: {
      userId: preceptorB.id,
      institutionId: institution.id,
      level: RoleLevel.Preceptor,
    },
  });
  await prisma.roleCourse.createMany({
    data: ["4A", "5A", "6A"].map((key) => ({
      roleId: rolePreceptorB.id,
      courseId: courseMap.get(key)!.id,
    })),
  });

  for (const docente of docentes) {
    const role = await prisma.role.create({
      data: {
        userId: docente.id,
        institutionId: institution.id,
        level: RoleLevel.Docente,
      },
    });

    const subjects = subjectsByTeacherEmail.get(docente.email) ?? [];
    if (subjects.length > 0) {
      await prisma.roleSubject.createMany({
        data: subjects.map((s) => ({ roleId: role.id, subjectId: s.id })),
      });
    }
  }

  await Promise.all(
    students.map((student) =>
      prisma.role.create({
        data: {
          userId: student.id,
          institutionId: institution.id,
          level: RoleLevel.Alumno,
        },
      }),
    ),
  );

  // ── 10. Create AcademicRecords ───────────────────────────────────────────────
  console.log("📊 Creating academic records...");
  for (const [courseKey, [start, end]] of Object.entries(COURSE_DISTRIBUTION)) {
    const course = courseMap.get(courseKey)!;
    const slice = students.slice(start, end + 1);
    await prisma.academicRecord.createMany({
      data: slice.map((s) => ({
        studentId: s.id,
        institutionId: institution.id,
        courseId: course.id,
        academicYear: ACADEMIC_YEAR,
        cycleStatus: "EnCurso",
      })),
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  const totalSubjects = Array.from(subjectsByCourse.values()).reduce(
    (acc, arr) => acc + arr.length,
    0,
  );
  console.log("\n✅ Seed completed successfully!");
  console.log(`   Institution : 1`);
  console.log(
    `   Staff       : 1 directivo + 2 preceptores + ${docentes.length} docentes`,
  );
  console.log(`   Students    : ${students.length}`);
  console.log(`   Courses     : ${courseMap.size}`);
  console.log(`   Subjects    : ${totalSubjects}`);
  console.log(`   Roles       : ${1 + 2 + docentes.length + students.length}`);
  console.log(`   AcadRecords : ${students.length}`);
  console.log("\n📧 Test credentials:");
  console.log("   directivo@escuela1.edu.ar       → admin123");
  console.log("   preceptor.a@escuela1.edu.ar     → preceptor123");
  console.log("   prof.matematica@escuela1.edu.ar → docente123");
  console.log("   45000001@alumnos.escuela1.edu.ar → alumno123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

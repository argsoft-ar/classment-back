## 1. Contexto del Proyecto y Stack Tecnológico

El proyecto se llama "Classment" y es un sistema SaaS multitenant de gestión académica, comenzando por el módulo de Educación Secundaria.
El stack tecnológico a utilizar será **React con TypeScript** para el frontend, un backend modular (Node.js/Next.js) con tipado estricto, y una base de datos orientada a documentos (ej. MongoDB). El sistema debe estar preparado para un despliegue continuo en plataformas de la nube como Vercel.
La arquitectura debe ser estrictamente modular. En esta fase solo se desarrollará la lógica de secundaria, pero la base de datos debe contemplar un campo `institution_type` para aislar futuras lógicas de nivel terciario.

## 2. Modelos de Datos Principales

- **Institution:** Almacena la configuración de la escuela y el ciclo lectivo activo.
- **User:** Almacena credenciales universales (email, password, DNI, nombre).
- **Role:** Relaciona un `User` con una `Institution` y un nivel de acceso (Directivo, Preceptor, Docente, Alumno).
- **Course:** Entidad estática que agrupa a los alumnos de un año escolar (ej. aulas de 35 estudiantes promedio).
- **Subject:** Materia asignada a un `Course` y a un `User` (Docente).
- **AcademicRecord:** Entidad que resume la trayectoria del alumno. Contiene el estado del ciclo (Promovido, Repite, Egresado) y el registro de materias adeudadas (Previas).

## 3. Roles y Permisos (RBAC)

- **Directivo (Admin):** Tiene permisos globales de lectura/escritura (ABM) sobre toda la institución. Es el único que abre y cierra los periodos de carga de calificaciones. Puede modificar cualquier nota (generando un log de auditoría). Asigna el estado final del alumno al cerrar el ciclo (Promovido/Repite).
- **Preceptor (Manager):** Acceso restringido a los cursos que tiene asignados. Carga la asistencia diaria. Emite comunicados a sus cursos. Puede ver el historial académico completo de sus alumnos.
- **Docente (Teacher):** Acceso restringido exclusivamente a las materias que dicta. Carga calificaciones solo si el periodo está habilitado por el Directivo. Modifica notas de materias previas (mesas de examen) si el Directivo se lo asigna.
- **Alumno (Student):** Acceso de solo lectura a su asistencia, calificaciones consolidadas, materias adeudadas y comunicados recibidos.

## 4. Reglas de Negocio: Módulo de Asistencia

- La carga de asistencia es diaria y masiva por curso.
- La interfaz debe renderizar a todos los alumnos con estado "Presente" por defecto para minimizar los clics.
- Valores matemáticos estrictos: P (Presente) equivale a 0. A (Ausente) equivale a 1. T (Tarde) equivale a 0.5.
- El campo acumulador en la base de datos debe ser de tipo `Float` o `Decimal` para soportar las medias faltas correctamente.

## 5. Reglas de Negocio: Módulo de Calificaciones

- El ciclo lectivo tiene 2 cuatrimestres.
- Cada cuatrimestre exige cargar un campo `pre_informe` (feedback de mitad de término) y una `nota_final_cuatrimestre` (numérica).
- El `pre_informe` debe tener un flag interno para ser excluido del boletín de calificaciones oficial del alumno.
- La nota final del ciclo lectivo **NO debe ser calculada ni promediada por el sistema**. Debe ser un input libre numérico habilitado para que el docente asigne la valoración definitiva de la trayectoria.

## 6. Reglas de Negocio: Mensajería Institucional

- Es un sistema de "Tablón de Anuncios" unidireccional (Broadcast), no un chat interactivo.
- Solo Directivos y Preceptores pueden emitir mensajes.
- Los mensajes pueden ser globales (a toda la escuela) o segmentados por `Course` específico.
- Implementar un estado booleano de lectura (`read: false`) para generar notificaciones visuales en el frontend de Alumnos y Docentes.

export type AttendanceValue = 0 | 1 | 0.5;

export interface IAttendanceEntry {
  id: string;
  attendanceSessionId: string;
  studentId: string;
  value: AttendanceValue;
}

export interface IAttendanceSession {
  id: string;
  courseId: string;
  institutionId: string;
  date: Date;
  recordedById: string;
  createdAt: Date;
  updatedAt: Date;
}

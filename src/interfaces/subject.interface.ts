export interface ISubject {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  institutionId: string;
  academicYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

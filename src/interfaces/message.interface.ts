export interface IMessage {
  id: string;
  title: string;
  body: string;
  senderId: string;
  institutionId: string;
  targetCourseId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

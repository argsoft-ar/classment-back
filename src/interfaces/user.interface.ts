export interface IUser {
  id: string;
  email: string;
  password: string;
  dni: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

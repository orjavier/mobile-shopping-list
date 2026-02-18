export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  public_id?: string;
  secure_url?: string;
  pushToken?: string;
  createdAt?: Date;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  public_id?: string;
  secure_url?: string;
  pushToken?: string;
}

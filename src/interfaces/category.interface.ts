export interface ICategory {
  _id?: string;
  name: string;
  color: string;
  public_id: string | null;
  secure_url: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

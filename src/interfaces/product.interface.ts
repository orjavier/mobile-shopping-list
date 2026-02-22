export interface IProduct {
  _id?: string;
  name: string;
  category?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  defaultPrice?: number;
  imageUrl?: string;
  public_id?: string;
  secure_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductCreate {
  name: string;
  category?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  defaultPrice?: number;
  imageUrl?: string;
  public_id?: string;
  secure_url?: string;
}

export interface IProductUpdate {
  name?: string;
  category?: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  defaultPrice?: number;
  imageUrl?: string;
  public_id?: string;
  secure_url?: string;
}

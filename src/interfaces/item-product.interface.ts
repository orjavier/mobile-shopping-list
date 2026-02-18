export interface IItemProduct {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  isCompleted: boolean;
  shoppingListId: string;
  addedBy: string;
  addedAt: Date;
  public_id?: string;
  secure_url?: string;
  price?: number;
  notes?: string;
  order?: number;
}

export interface IItemProductCreate {
  name: string;
  quantity: number;
  unit: string;
  shoppingListId: string;
  addedBy: string;
  public_id?: string;
  secure_url?: string;
  price?: number;
  notes?: string;
  order?: number;
}

export interface IItemProductUpdate {
  name?: string;
  quantity?: number;
  unit?: string;
  isCompleted?: boolean;
  public_id?: string;
  secure_url?: string;
  price?: number;
  notes?: string;
  order?: number;
}

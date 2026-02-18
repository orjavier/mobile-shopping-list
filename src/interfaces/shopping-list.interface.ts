import { IItemProduct } from './item-product.interface';

export interface IShoppingList {
  _id?: string;
  name: string;
  createdBy: string;
  itemsProduct: IItemProduct[];
  status: 'open' | 'closed';
  totalAmount: number;
  closedAt?: Date;
  purchasedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShoppingListCreate {
  name: string;
  createdBy: string;
}

export interface IShoppingListUpdate {
  name?: string;
  status?: 'open' | 'closed';
  totalAmount?: number;
  closedAt?: Date;
  purchasedBy?: string;
}

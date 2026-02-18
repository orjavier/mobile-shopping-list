export class CreateShoppingListDTO {
  name: string;
  createdBy: string;

  constructor(name: string, createdBy: string) {
    this.name = name;
    this.createdBy = createdBy;
  }
}

export class UpdateShoppingListDTO {
  name?: string;
  status?: 'open' | 'closed';
  totalAmount?: number;
  closedAt?: Date;
  purchasedBy?: string;

  constructor(data: Partial<UpdateShoppingListDTO>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.status !== undefined) this.status = data.status;
    if (data.totalAmount !== undefined) this.totalAmount = data.totalAmount;
    if (data.closedAt !== undefined) this.closedAt = data.closedAt;
    if (data.purchasedBy !== undefined) this.purchasedBy = data.purchasedBy;
  }
}

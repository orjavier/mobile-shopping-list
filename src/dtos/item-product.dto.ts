export class CreateItemProductDTO {
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

  constructor(
    name: string,
    quantity: number,
    unit: string,
    shoppingListId: string,
    addedBy: string,
    public_id?: string,
    secure_url?: string,
    price?: number,
    notes?: string,
    order?: number
  ) {
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.shoppingListId = shoppingListId;
    this.addedBy = addedBy;
    this.public_id = public_id;
    this.secure_url = secure_url;
    this.price = price;
    this.notes = notes;
    this.order = order;
  }
}

export class UpdateItemProductDTO {
  name?: string;
  quantity?: number;
  unit?: string;
  isCompleted?: boolean;
  public_id?: string;
  secure_url?: string;
  price?: number;
  notes?: string;
  order?: number;

  constructor(data: Partial<UpdateItemProductDTO>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.quantity !== undefined) this.quantity = data.quantity;
    if (data.unit !== undefined) this.unit = data.unit;
    if (data.isCompleted !== undefined) this.isCompleted = data.isCompleted;
    if (data.public_id !== undefined) this.public_id = data.public_id;
    if (data.secure_url !== undefined) this.secure_url = data.secure_url;
    if (data.price !== undefined) this.price = data.price;
    if (data.notes !== undefined) this.notes = data.notes;
    if (data.order !== undefined) this.order = data.order;
  }
}

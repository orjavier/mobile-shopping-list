export class CreateCategoryDTO {
  name: string;
  color: string;
  public_id?: string;
  secure_url?: string;

  constructor(name: string, color: string, public_id?: string, secure_url?: string) {
    this.name = name;
    this.color = color;
    this.public_id = public_id;
    this.secure_url = secure_url;
  }
}

export class UpdateCategoryDTO {
  name?: string;
  color?: string;
  public_id?: string;
  secure_url?: string;

  constructor(data: Partial<UpdateCategoryDTO>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.color !== undefined) this.color = data.color;
    if (data.public_id !== undefined) this.public_id = data.public_id;
    if (data.secure_url !== undefined) this.secure_url = data.secure_url;
  }
}

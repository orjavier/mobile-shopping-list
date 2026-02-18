export class LoginDTO {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  constructor(firstName: string, lastName: string, email: string, password: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }
}

export class UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  public_id?: string;
  secure_url?: string;
  pushToken?: string;

  constructor(data: Partial<UpdateUserDTO>) {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.email !== undefined) this.email = data.email;
    if (data.public_id !== undefined) this.public_id = data.public_id;
    if (data.secure_url !== undefined) this.secure_url = data.secure_url;
    if (data.pushToken !== undefined) this.pushToken = data.pushToken;
  }
}

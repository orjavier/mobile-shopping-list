import { IUser } from '../interfaces';
import { UpdateUserDTO } from '../dtos';
import { userRepository } from '../repositories';
import { useAuthStore } from '@/stores/authStore';

export class UserController {
  static async login(email: string, password: string): Promise<IUser> {
    return await userRepository.login(email, password);
  }

  static async register(firstName: string, lastName: string, email: string, password: string): Promise<IUser> {
    return await userRepository.register(firstName, lastName, email, password);
  }

  static async getAll(): Promise<IUser[]> {
    return await userRepository.getAll();
  }

  static async getById(id: string): Promise<IUser | null> {
    return await userRepository.getById(id);
  }

  static async update(id: string, data: Partial<UpdateUserDTO>): Promise<IUser> {
    return await userRepository.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    return await userRepository.delete(id);
  }

  static logout(): void {
    userRepository.logout();
  }

  static isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }
}

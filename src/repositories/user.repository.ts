import { useAuthStore } from "@/stores/authStore";
import { API_ENDPOINTS } from "../constants/api";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../dtos";
import apiService from "../services/api.service";

export class UserRepository {
  async login(email: string, password: string) {
    const dto = new LoginDTO(email, password);
    const response = await apiService.post<any>("/auth/login", dto);

    // response ya es: {success, status, message, request_id, data: {token, user}}
    // response.data = {token, user}
    if (response.data?.token && response.data?.user) {
      const user = {
        _id: response.data.user._id || response.data.user.id,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email,
        public_id: response.data.user.public_id,
        secure_url: response.data.user.secure_url,
      };
      useAuthStore.getState().setAuth(user, response.data.token);
      return user;
    }
    throw new Error("Invalid response from server");
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const dto = new RegisterDTO(firstName, lastName, email, password);
    const response = await apiService.post<any>("/auth/register", dto);

    if (response.data?.token && response.data?.user) {
      const user = {
        _id: response.data.user._id || response.data.user.id,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email,
        public_id: response.data.user.public_id,
        secure_url: response.data.user.secure_url,
      };
      useAuthStore.getState().setAuth(user, response.data.token);
      return user;
    }
    throw new Error("Invalid response from server");
  }

  async getAll(): Promise<any[]> {
    const response = await apiService.get<any>(API_ENDPOINTS.USERS);
    return response.data?.data || [];
  }

  async getById(id: string): Promise<any | null> {
    try {
      const response = await apiService.get<any>(
        `${API_ENDPOINTS.USERS}/${id}`,
      );
      return response.data?.data || null;
    } catch {
      return null;
    }
  }

  async update(id: string, dto: UpdateUserDTO): Promise<any> {
    const response = await apiService.patch<any>(
      `${API_ENDPOINTS.USERS}/${id}`,
      dto,
    );
    return response.data?.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.USERS}/${id}`);
  }

  logout(): void {
    useAuthStore.getState().logout();
  }
}

export const userRepository = new UserRepository();

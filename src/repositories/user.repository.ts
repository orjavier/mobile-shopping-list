import { useAuthStore } from "@/stores/authStore";
import { API_ENDPOINTS } from "../constants/api";
import { LoginDTO, RegisterDTO, UpdateUserDTO } from "../dtos";
import apiService from "../services/api.service";

export class UserRepository {
  async login(email: string, password: string) {
    const dto = new LoginDTO(email, password);
    const response = await apiService.post<any>("/auth/login", dto);

    const userData = response.data?.user || response.data;
    const token = response.data?.token || response.token;

    if (token && userData?._id) {
      const user = {
        _id: userData._id || userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        public_id: userData.public_id,
        secure_url: userData.secure_url,
      };
      useAuthStore.getState().setAuth(user, token);
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

    console.log("Register response:", JSON.stringify(response.data, null, 2));

    const userData = response.data?.user || response.data;

    if (response.data?.token && userData?._id) {
      const user = {
        _id: userData._id || userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        public_id: userData.public_id,
        secure_url: userData.secure_url,
      };
      useAuthStore.getState().setAuth(user, response.data.token);
      return user;
    }

    if (userData?._id || userData?.id) {
      return userData;
    }

    if (response.data?.message) {
      throw new Error(response.data.message);
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

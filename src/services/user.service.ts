import { UpdateUserDTO } from "../dtos";
import apiService from "./api.service";

class UserService {
  async updateUser(id: string, userData: UpdateUserDTO) {
    try {
      return await apiService.put(`/users/${id}`, userData);
    } catch (error: unknown) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

export default new UserService();

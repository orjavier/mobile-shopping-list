import { API_ENDPOINTS } from "../constants/api";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos";
import {
  ICategory,
  StandardListResponse,
  StandardSingleResponse,
} from "../interfaces";
import apiService from "../services/api.service";

export class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    const response = await apiService.get<StandardListResponse<ICategory>>(
      API_ENDPOINTS.CATEGORIES,
    );
    return response.data!;
  }

  async findById(id: string): Promise<ICategory | null> {
    try {
      const response = await apiService.get<StandardSingleResponse<ICategory>>(
        `${API_ENDPOINTS.CATEGORIES}/${id}`,
      );
      return response.data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching category by id:", error);
      return null;
    }
  }

  async create(data: CreateCategoryDTO): Promise<ICategory> {
    const response = await apiService.post<StandardSingleResponse<ICategory>>(
      API_ENDPOINTS.CATEGORIES,
      data,
    );
    return response.data!;
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<ICategory> {
    const response = await apiService.patch<StandardSingleResponse<ICategory>>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
      data,
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    } catch (error: unknown) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}

export const categoryRepository = new CategoryRepository();

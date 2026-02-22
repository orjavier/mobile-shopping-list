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
    const response = await apiService.get<ICategory[] | StandardListResponse<ICategory>>(
      API_ENDPOINTS.CATEGORIES,
    );
    if (Array.isArray(response)) {
      return response;
    }
    return (response as StandardListResponse<ICategory>).data || [];
  }

  async findById(id: string): Promise<ICategory | null> {
    try {
      const response = await apiService.get<ICategory | StandardSingleResponse<ICategory>>(
        `${API_ENDPOINTS.CATEGORIES}/${id}`,
      );
      if (Array.isArray(response) || !('data' in response)) {
        return null;
      }
      return (response as StandardSingleResponse<ICategory>).data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching category by id:", error);
      return null;
    }
  }

  async create(data: CreateCategoryDTO): Promise<ICategory> {
    const response = await apiService.post<ICategory | StandardSingleResponse<ICategory>>(
      API_ENDPOINTS.CATEGORIES,
      data,
    );
    if ('data' in response) {
      return (response as StandardSingleResponse<ICategory>).data!;
    }
    return response as ICategory;
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<ICategory> {
    const response = await apiService.patch<ICategory | StandardSingleResponse<ICategory>>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
      data,
    );
    if ('data' in response) {
      return (response as StandardSingleResponse<ICategory>).data!;
    }
    return response as ICategory;
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

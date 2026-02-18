import { AxiosError } from 'axios';
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos";
import { ICategory, StandardListResponse, StandardSingleResponse } from "../interfaces";
import apiService from "./api.service";

class CategoryService {
  async getCategories(): Promise<StandardListResponse<ICategory>> {
    try {
      return await apiService.get<StandardListResponse<ICategory>>("/categories");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error fetching categories:", axiosError.message);
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<StandardSingleResponse<ICategory>> {
    try {
      return await apiService.get<StandardSingleResponse<ICategory>>(`/categories/${id}`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error fetching category:", axiosError.message);
      throw error;
    }
  }

  async createCategory(category: CreateCategoryDTO): Promise<StandardSingleResponse<ICategory>> {
    try {
      return await apiService.post<StandardSingleResponse<ICategory>>("/categories", category);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error creating category:", axiosError.message);
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<UpdateCategoryDTO>): Promise<StandardSingleResponse<ICategory>> {
    try {
      return await apiService.patch<StandardSingleResponse<ICategory>>(`/categories/${id}`, updates);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error updating category:", axiosError.message);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiService.delete(`/categories/${id}`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error deleting category:", axiosError.message);
      throw error;
    }
  }
}

export default new CategoryService();

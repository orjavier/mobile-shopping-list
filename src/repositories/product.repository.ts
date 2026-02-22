import { API_ENDPOINTS } from "../constants/api";
import { IProduct, IProductCreate, IProductUpdate } from "../interfaces";
import apiService from "../services/api.service";

export class ProductRepository {
  async findAll(): Promise<IProduct[]> {
    try {
      const response = await apiService.get<IProduct[]>(
        API_ENDPOINTS.PRODUCTS,
      );
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async findById(id: string): Promise<IProduct | null> {
    try {
      const response = await apiService.get<IProduct>(
        `${API_ENDPOINTS.PRODUCTS}/${id}`,
      );
      return response || null;
    } catch (error: unknown) {
      console.error("Error fetching product by id:", error);
      return null;
    }
  }

  async findByCategory(categoryId: string): Promise<IProduct[]> {
    try {
      const response = await apiService.get<IProduct[]>(
        `${API_ENDPOINTS.PRODUCTS}/category/${categoryId}`,
      );
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error: unknown) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  }

  async create(data: IProductCreate): Promise<IProduct> {
    const response = await apiService.post<IProduct>(
      API_ENDPOINTS.PRODUCTS,
      data,
    );
    return response;
  }

  async update(id: string, data: IProductUpdate): Promise<IProduct> {
    const response = await apiService.patch<IProduct>(
      `${API_ENDPOINTS.PRODUCTS}/${id}`,
      data,
    );
    return response;
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
    } catch (error: unknown) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
}

export const productRepository = new ProductRepository();

import { API_ENDPOINTS } from "../constants/api";
import { CreateShoppingListDTO, UpdateShoppingListDTO } from "../dtos";
import {
  IShoppingList,
  IItemProduct,
  StandardListResponse,
  StandardSingleResponse,
} from "../interfaces";
import apiService from "../services/api.service";

export class ShoppingListRepository {
  async getByUser(userId: string): Promise<IShoppingList[]> {
    const response = await apiService.get<StandardListResponse<IShoppingList>>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/user/${userId}`,
    );
    return response.data!;
  }

  async getById(id: string): Promise<IShoppingList | null> {
    try {
      const response = await apiService.get<
        StandardSingleResponse<IShoppingList>
      >(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`);
      return response.data ?? null;
    } catch (error: unknown) {
      console.error("Error getting shopping list by id:", error);
      return null;
    }
  }

  async create(dto: CreateShoppingListDTO): Promise<IShoppingList> {
    const response = await apiService.post<
      StandardSingleResponse<IShoppingList>
    >(`${API_ENDPOINTS.SHOPPING_LISTS}`, dto);
    return response.data!;
  }

  async update(id: string, dto: UpdateShoppingListDTO): Promise<IShoppingList> {
    const response = await apiService.patch<
      StandardSingleResponse<IShoppingList>
    >(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`, dto);
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`${API_ENDPOINTS.SHOPPING_LISTS}/${id}`);
    } catch (error: unknown) {
      console.error("Error deleting shopping list:", error);
      throw error;
    }
  }

  async addItem(listId: string, item: unknown): Promise<IItemProduct> {
    const response = await apiService.post<StandardSingleResponse<IItemProduct>>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items`,
      item,
    );
    return response.data!;
  }

  async toggleItemCompleted(itemId: string): Promise<IItemProduct> {
    const response = await apiService.patch<StandardSingleResponse<IItemProduct>>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/items/${itemId}/toggle`,
      {},
    );
    return response.data!;
  }

  async deleteItem(listId: string, itemId: string): Promise<void> {
    try {
      await apiService.delete(
        `${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items/${itemId}`,
      );
    } catch (error: unknown) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }
}

export const shoppingListRepository = new ShoppingListRepository();

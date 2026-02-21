import { API_ENDPOINTS } from "../constants/api";
import { CreateShoppingListDTO, UpdateShoppingListDTO } from "../dtos";
import { IItemProduct, IShoppingList } from "../interfaces";
import apiService from "../services/api.service";

export class ShoppingListRepository {
  async getByUser(userId: string): Promise<IShoppingList[]> {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/user/${userId}`,
    );
    // Handle both wrapped and unwrapped responses
    return response.data || response || [];
  }

  async getById(id: string): Promise<IShoppingList | null> {
    try {
      const response = await apiService.get<any>(
        `${API_ENDPOINTS.SHOPPING_LISTS}/${id}`,
      );
      console.log('[ShoppingListRepo getById] response:', JSON.stringify(response));
      // Handle both wrapped and unwrapped responses
      const data = response.data || response || null;
      console.log('[ShoppingListRepo getById] data retornado:', JSON.stringify(data));
      return data;
    } catch (error: unknown) {
      console.error("Error getting shopping list by id:", error);
      return null;
    }
  }

  async create(dto: CreateShoppingListDTO): Promise<IShoppingList> {
    const response = await apiService.post<any>(
      `${API_ENDPOINTS.SHOPPING_LISTS}`,
      dto,
    );
    return response.data || response;
  }

  async update(id: string, dto: UpdateShoppingListDTO): Promise<IShoppingList> {
    const response = await apiService.patch<any>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/${id}`,
      dto,
    );
    return response.data || response;
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
    console.log('[ShoppingListRepo] addItem - listId:', listId);
    console.log('[ShoppingListRepo] addItem - item:', JSON.stringify(item));
    const response = await apiService.post<any>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/${listId}/items`,
      item,
    );
    console.log('[ShoppingListRepo] addItem - response:', JSON.stringify(response));
    return response.data || response;
  }

  async toggleItemCompleted(itemId: string): Promise<IItemProduct> {
    const response = await apiService.patch<any>(
      `${API_ENDPOINTS.SHOPPING_LISTS}/items/${itemId}/toggle`,
      {},
    );
    return response.data || response;
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

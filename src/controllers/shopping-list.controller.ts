import { IShoppingList, IItemProduct } from '../interfaces';
import { CreateShoppingListDTO, UpdateShoppingListDTO, CreateItemProductDTO } from '../dtos';
import { shoppingListRepository } from '../repositories';

export class ShoppingListController {
  static async getByUser(userId: string): Promise<IShoppingList[]> {
    return await shoppingListRepository.getByUser(userId);
  }

  static async getById(id: string): Promise<IShoppingList | null> {
    return await shoppingListRepository.getById(id);
  }

  static async create(name: string, createdBy: string): Promise<IShoppingList> {
    const dto = new CreateShoppingListDTO(name, createdBy);
    return await shoppingListRepository.create(dto);
  }

  static async update(id: string, data: Partial<UpdateShoppingListDTO>): Promise<IShoppingList> {
    const dto = new UpdateShoppingListDTO(data);
    return await shoppingListRepository.update(id, dto);
  }

  static async delete(id: string): Promise<void> {
    return await shoppingListRepository.delete(id);
  }

  static async addItem(
    listId: string,
    name: string,
    quantity: number,
    unit: string,
    addedBy: string,
    public_id?: string,
    secure_url?: string,
    price?: number,
    notes?: string,
    order?: number
  ): Promise<IItemProduct> {
    const dto = new CreateItemProductDTO(name, quantity, unit, listId, addedBy, public_id, secure_url, price, notes, order);
    return await shoppingListRepository.addItem(listId, dto);
  }

  static async toggleItemCompleted(itemId: string): Promise<any> {
    return await shoppingListRepository.toggleItemCompleted(itemId);
  }

  static async deleteItem(listId: string, itemId: string): Promise<void> {
    return await shoppingListRepository.deleteItem(listId, itemId);
  }
}

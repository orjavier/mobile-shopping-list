import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos";
import { ICategory } from "../interfaces";
import { categoryRepository } from "../repositories";

export class CategoryController {
  static async getAll(): Promise<ICategory[]> {
    return await categoryRepository.findAll();
  }

  static async getById(id: string): Promise<ICategory | null> {
    return await categoryRepository.findById(id);
  }

  static async create(
    name: string,
    color: string,
    public_id?: string,
    secure_url?: string,
  ): Promise<ICategory> {
    const dto = new CreateCategoryDTO(name, color, public_id, secure_url);
    return await categoryRepository.create(dto);
  }

  static async update(
    id: string,
    data: Partial<UpdateCategoryDTO>,
  ): Promise<ICategory> {
    const dto = new UpdateCategoryDTO(data);
    return await categoryRepository.update(id, dto);
  }

  static async delete(id: string): Promise<void> {
    return await categoryRepository.delete(id);
  }
}

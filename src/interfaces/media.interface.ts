export interface IMedia {
  _id?: string;
  public_id: string;
  url?: string;
  secure_url: string;
  format?: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  width?: number;
  height?: number;
  size?: number;
  title?: string;
  description?: string;
  relatedTo: 'recipes' | 'steps' | 'users' | 'categories' | 'subcategories';
  relatedId?: string;
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

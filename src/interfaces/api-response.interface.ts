export interface PaginationMeta {
  total_count: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface HAETOASLinks {
  self: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

export interface StandardResponse<T> {
  success: boolean;
  status: 'success' | 'error';
  message: string;
  request_id?: string;
  data?: T;
}

export interface LoginUserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  public_id?: string | null;
  secure_url?: string | null;
  pushToken?: string | null;
}

export interface LoginResponse {
  token: string;
  user: LoginUserData;
}

export interface StandardLoginResponse extends StandardResponse<LoginResponse> {}

export interface StandardListResponse<T> extends StandardResponse<T[]> {
  meta: PaginationMeta;
  links: HAETOASLinks;
}

export type StandardSingleResponse<T> = StandardResponse<T>;
export type StandardActionResponse<T> = StandardResponse<T>;

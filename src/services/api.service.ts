import { useAuthStore } from "@/stores/authStore";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://shopping-list-backend-production-bf48.up.railway.app/api";

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("[API] Request Error:", error.message);
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        console.error("[API] Response Error:", error.message);
        console.error("[API] Status:", error.response?.status);
        console.error("[API] Status Text:", error.response?.statusText);
        console.error("[API] Response data:", error.response?.data);
        console.error("[API] URL:", error.config?.url);

        if (error.response?.status === 401) {
          console.log("[API] 401 Unauthorized - cerrando sesión");
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    console.log("[API POST]", url);
    console.log("[API POST] Data:", JSON.stringify(data));
    try {
      const response: AxiosResponse<T> = await this.api.post<T>(
        url,
        data,
        config,
      );
      console.log("[API POST] Success:", response.status);
      console.log("[API POST] Full response:", JSON.stringify(response));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[API POST] Axios Error:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch<T>(
      url,
      data,
      config,
    );
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete<T>(url, config);
    return response.data;
  }

  public setBaseURL(url: string): void {
    console.log("[API] Cambiando baseURL a:", url);
    this.api.defaults.baseURL = url;
  }

  public setHeader(key: string, value: string): void {
    this.api.defaults.headers.common[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.api.defaults.headers.common[key];
  }
}

export const apiService = ApiService.getInstance();
export default apiService;

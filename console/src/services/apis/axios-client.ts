import Axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import Qs from "qs";
import { authService } from "../auth.service";

// Types
interface QueueItem {
  resolve: (value: string) => void;
  reject: (error?: any) => void;
}

interface RefreshTokenResponse {
  token: string;
  expiredAt: string;
}

// Constants
const API_ENDPOINTS = {
  REFRESH_TOKEN: "http://localhost:3000/members/refresh-token",
} as const;

const STORAGE_KEYS = {
  TOKEN: "token",
  EXPIRED_AT: "expiredAt",
  MEMBER: "member",
} as const;

// Token management class
class TokenManager {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token || "");
      }
    });
    this.failedQueue = [];
  }

  private clearAuthData(): void {
    const keysToRemove = Object.values(STORAGE_KEYS);
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  private saveTokenData(token: string, expiredAt: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.EXPIRED_AT, expiredAt);
  }

  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await Axios.post<RefreshTokenResponse>(
        API_ENDPOINTS.REFRESH_TOKEN,
        {},
        { withCredentials: true }
      );

      const { token, expiredAt } = response.data;
      this.saveTokenData(token, expiredAt);
      this.processQueue(null, token);

      return token;
    } catch (error) {
      this.clearAuthData();
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async handleUnauthorized(
    originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
  ): Promise<AxiosResponse> {
    if (originalRequest._retry) {
      throw new Error("Token refresh already attempted");
    }

    if (!authService.getCurrentMember()) {
      throw new Error("No authenticated user found");
    }

    originalRequest._retry = true;
    const newToken = await this.refreshToken();

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }

    return axiosInstance(originalRequest);
  }
}

// Create axios instance
export const axiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_API_SYSTEM_URL,
  paramsSerializer: (params) => Qs.stringify(params, { arrayFormat: "repeat" }),
  withCredentials: true,
});

// Initialize token manager
const tokenManager = new TokenManager();

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        return await tokenManager.handleUnauthorized(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export types
export type HttpError<T = unknown> = AxiosError<T>;
export type RequestBody<T = unknown> = T;

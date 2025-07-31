import type {
  SignInFormData,
  AuthResponse,
} from "@/types/interfaces/auth.interface";
import { axiosInstance } from "@/services/apis/axios-client";
import { customToast } from "@/lib/toast";

export const authService = {
  async signIn(credentials: SignInFormData): Promise<AuthResponse | undefined> {
    try {
      // Determine which endpoint to call based on whether OTP is provided
      const endpoint = credentials.otp
        ? "/members/sign-in/confirm-otp"
        : "/members/sign-in/send-otp";

      const response = await axiosInstance.post(endpoint, credentials);

      // If we get a token, store auth data
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("expiredAt", response.data.expiredAt);
        localStorage.setItem("member", JSON.stringify(response.data.member));
      }

      return response.data;
    } catch (error: any) {
      customToast.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },

  async signOut() {
    try {
      const response = await axiosInstance.post("/members/sign-out");
      this.clearAuthData();
      return response.data;
    } catch (error: any) {
      this.clearAuthData();
      customToast.error(error.message || "Đăng xuất thất bại");
    }
  },

  clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiredAt");
    localStorage.removeItem("member");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getCurrentMember() {
    const member = localStorage.getItem("member");
    return member ? JSON.parse(member) : null;
  },

  isAuthenticated() {
    const token = this.getToken();
    const expiredAt = localStorage.getItem("expiredAt");

    if (!token || !expiredAt) return false;

    try {
      const expirationDate = new Date(expiredAt);
      if (isNaN(expirationDate.getTime())) return false;
      return expirationDate > new Date();
    } catch {
      return false;
    }
  },

  // Helper method to refresh token
  async refreshToken() {
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("expiredAt", response.data.expiredAt);
        localStorage.setItem("member", JSON.stringify(response.data.member));
        return response.data;
      }
    } catch (error: any) {
      this.clearAuthData();
      customToast.error(error.message || "Lỗi khi cập nhật token");
    }
  },
};

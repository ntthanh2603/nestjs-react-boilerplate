import { z } from "zod";
import type { Member } from "@/types/interfaces/member.interface";
import { RoleMember } from "@/types/enums/enum";

export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vui lòng nhập email" })
    .email({ message: "Email không hợp lệ" })
    .max(30, { message: "Email không được vượt quá 30 ký tự" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .max(20, { message: "Mật khẩu không được vượt quá 20 ký tự" }),
  roleMember: z.nativeEnum(RoleMember, {
    required_error: "Vui lòng chọn vai trò",
  }),
  otp: z.string().optional(),
});

export type SignInFormData = z.infer<typeof signInFormSchema>;

export interface AuthResponse {
  token?: string;
  expiredAt?: string;
  member?: Member;
  message?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  member: Member | null;
  signIn: (credentials: SignInFormData) => Promise<AuthResponse>;
  signOut: () => Promise<string>;
  clearAuthData: () => void;
  loading: boolean;
}

export interface SignUpDto {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  description?: string;
  otp?: string;
}

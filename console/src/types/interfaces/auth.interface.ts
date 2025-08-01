import { z } from "zod";
import type { Member } from "@/types/interfaces/member.interface";
import { RoleMember } from "@/types/enums/enum";

export const signInFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(30, { message: "Email must not exceed 30 characters" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must not exceed 20 characters" }),
  roleMember: z.nativeEnum(RoleMember, {
    required_error: "Please select a role",
  }),
  otp: z.string().optional(),
});

export type SignInFormData = z.infer<typeof signInFormSchema>;

export const signUpFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" })
      .max(50, { message: "Email must not exceed 50 characters" })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(20, { message: "Password must not exceed 20 characters" }),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(50, { message: "Full name must not exceed 50 characters" })
      .trim(),
    description: z
      .string()
      .max(500, { message: "Description must not exceed 500 characters" })
      .optional(),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpFormSchema>;

export interface AuthResponse {
  token?: string;
  expiredAt?: string;
  member?: Member;
  message?: string;
}

export interface SignUpResponse {
  message: string;
  token?: string;
  expiredAt?: string;
  member?: Member;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  member: Member | null;
  signIn: (credentials: SignInFormData) => Promise<AuthResponse>;
  signUpSendOTP: (
    data: Omit<SignUpFormData, "otp" | "confirmPassword">
  ) => Promise<{ message: string }>;
  signUpConfirmOTP: (
    data: Pick<
      SignUpFormData,
      "email" | "otp" | "fullName" | "description" | "password"
    >
  ) => Promise<SignUpResponse>;
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

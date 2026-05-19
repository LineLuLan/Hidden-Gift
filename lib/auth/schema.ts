/**
 * @file lib/auth/schema.ts
 * @description Zod schemas for auth forms — email/password signup, login.
 *              Vietnamese error messages (CLAUDE.md §3: VN-first UI text).
 * @phase 1
 */

import { z } from "zod";

const emailField = z
  .string({ required_error: "Vui lòng nhập email" })
  .trim()
  .min(1, "Vui lòng nhập email")
  .email("Email không hợp lệ");

const passwordField = z
  .string({ required_error: "Vui lòng nhập mật khẩu" })
  .min(8, "Mật khẩu cần ít nhất 8 ký tự")
  .max(128, "Mật khẩu quá dài");

export const signUpSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
    displayName: z.string().trim().min(1, "Vui lòng nhập tên hiển thị").max(50, "Tên quá dài"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type SignInInput = z.infer<typeof signInSchema>;

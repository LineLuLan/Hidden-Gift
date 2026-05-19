/**
 * @file lib/secrets/schema.ts
 * @description Zod validation for secret prepare/update inputs.
 */

import { z } from "zod";

export const secretInputSchema = z.object({
  title: z
    .string({ required_error: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(100, "Tiêu đề tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả tối đa 1000 ký tự")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  recipientId: z.string().uuid("Recipient không hợp lệ"),
  linkedWishId: z
    .string()
    .uuid("Wish liên kết không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  revealAt: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || !Number.isNaN(Date.parse(v)), "Ngày hẹn không hợp lệ"),
});

export type SecretInput = z.infer<typeof secretInputSchema>;

export const secretIdSchema = z.string().uuid("ID không hợp lệ");

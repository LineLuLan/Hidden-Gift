/**
 * @file lib/wishes/schema.ts
 * @description Zod schemas for wish input. Vietnamese error messages.
 */

import { z } from "zod";

export const wishInputSchema = z.object({
  title: z
    .string({ required_error: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(100, "Tiêu đề tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả tối đa 500 ký tự")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  emoji: z
    .string()
    .trim()
    .max(10, "Emoji không hợp lệ")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export type WishInput = z.infer<typeof wishInputSchema>;

export const wishIdSchema = z.string().uuid("ID không hợp lệ");

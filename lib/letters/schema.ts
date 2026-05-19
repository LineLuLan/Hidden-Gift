/**
 * @file lib/letters/schema.ts
 * @description Zod validation for letter compose/schedule.
 */

import { z } from "zod";

export const letterInputSchema = z.object({
  subject: z
    .string({ required_error: "Vui lòng nhập tiêu đề" })
    .trim()
    .min(1, "Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  body: z
    .string({ required_error: "Vui lòng viết nội dung" })
    .trim()
    .min(1, "Vui lòng viết nội dung")
    .max(20000, "Nội dung quá dài"),
  scheduledFor: z
    .string()
    .min(1, "Vui lòng chọn ngày giao")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Ngày giao không hợp lệ"),
  recipientId: z.string().uuid("Người nhận không hợp lệ"),
  isDraft: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .default(true),
});

export type LetterInput = z.infer<typeof letterInputSchema>;

export const letterIdSchema = z.string().uuid("ID không hợp lệ");

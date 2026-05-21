/**
 * @file lib/countdowns/schema.ts
 * @description Zod schemas for countdown CRUD inputs.
 */

import { z } from "zod";

export const countdownIdSchema = z.string().uuid("ID không hợp lệ");

export const countdownInputSchema = z.object({
  title: z.string().trim().min(1, "Tên là bắt buộc").max(100, "Tên tối đa 100 ký tự"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải dạng YYYY-MM-DD"),
  isRecurring: z.boolean().default(false),
  emoji: z
    .string()
    .trim()
    .max(10, "Emoji tối đa 10 ký tự")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CountdownInput = z.infer<typeof countdownInputSchema>;

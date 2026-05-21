/**
 * @file lib/pings/schema.ts
 * @description Emoji ping input validation.
 */

import { z } from "zod";

export const pingInputSchema = z.object({
  emoji: z
    .string({ required_error: "Vui lòng chọn emoji" })
    .trim()
    .min(1, "Vui lòng chọn emoji")
    .max(10, "Emoji không hợp lệ"),
  message: z
    .string()
    .trim()
    .max(200, "Tin nhắn tối đa 200 ký tự")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type PingInput = z.infer<typeof pingInputSchema>;

export const pingIdSchema = z.string().uuid("ID không hợp lệ");

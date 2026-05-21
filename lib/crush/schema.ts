/**
 * @file lib/crush/schema.ts
 * @description Zod schemas for crush profile + diary entry inputs.
 */

import { z } from "zod";

const optional = (s: z.ZodString) =>
  s.optional().transform((v) => (v == null || v === "" ? undefined : v));

export const crushProfileSchema = z.object({
  nickname: z
    .string({ required_error: "Vui lòng nhập tên/biệt danh" })
    .trim()
    .min(1, "Vui lòng nhập tên/biệt danh")
    .max(80, "Tên tối đa 80 ký tự"),
  bio: optional(z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự")),
  emoji: optional(z.string().trim().max(10, "Emoji không hợp lệ")),
  metAt: optional(z.string()).refine(
    (v) => v === undefined || !Number.isNaN(Date.parse(v)),
    "Ngày không hợp lệ",
  ),
  countdownLabel: optional(z.string().trim().max(80, "Tối đa 80 ký tự")),
  countdownTo: optional(z.string()).refine(
    (v) => v === undefined || !Number.isNaN(Date.parse(v)),
    "Ngày không hợp lệ",
  ),
  status: z.enum(["crushing", "confessed", "rejected", "together"]).default("crushing"),
});

export type CrushProfileInput = z.infer<typeof crushProfileSchema>;

export const diaryEntrySchema = z.object({
  content: z
    .string({ required_error: "Vui lòng viết gì đó" })
    .trim()
    .min(1, "Vui lòng viết gì đó")
    .max(2000, "Tối đa 2000 ký tự"),
  mood: optional(z.string().trim().max(10, "Emoji không hợp lệ")),
  entryDate: optional(z.string()).refine(
    (v) => v === undefined || !Number.isNaN(Date.parse(v)),
    "Ngày không hợp lệ",
  ),
});

export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;

export const diaryIdSchema = z.string().uuid("ID không hợp lệ");
